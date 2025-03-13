/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
   UnauthorizedException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ClassSerializerInterceptor,
  BadRequestException,
  UseGuards,
  Req,
  Patch,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from 'src/users/dto/update-users.dto';
import { LoginDto, RegisterDto } from './dto';
import { UserResponse } from 'src/users/responses/user.response';
import { Cookies, CurrentUser, Public, UserAgent } from '@common/decorators';
import { Tokens } from './interfaces/tokens.interface';
import { ConfigService } from '@nestjs/config';
import { GoogleGuard } from './guards/google.guard';
import { HttpService } from '@nestjs/axios';
import { JwtPayload } from './interfaces/jwt-payload.interface';


const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  async registration(@Body() userDto: RegisterDto) {
    const user = await this.authService.register(userDto);
    if (!user) {
      throw new BadRequestException(
        `Помилка при реєстрації користувача з даними ${JSON.stringify(
          userDto,
        )}`,
      );
    }
    return new UserResponse(user);
  }

  @Public()
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    try {
      const tokens = await this.authService.login(dto, agent);
    const accessToken=  await this.setRefreshTokenCookie(tokens, res);

      return res.status(HttpStatus.OK).json({
        accessToken,
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  private async setRefreshTokenCookie(tokens: Tokens, @Res() res: Response) {
    if (!tokens || !tokens.refreshToken) {
      throw new UnauthorizedException('Invalid tokens');
    }

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'none', 
      expires: new Date(tokens.refreshToken.exp),
      secure: true, 
      path: '/',
    });

    return tokens.accessToken;
  }

  @Public()
  @Get('/refresh_tokens')
  async refreshTokens(
    @Cookies(REFRESH_TOKEN_COOKIE_NAME) refreshToken: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    
    const accessToken = await this.setRefreshTokenCookie(tokens, res);

    return res.status(HttpStatus.OK).json({
      accessToken,
    });
  }

  @Get('/logout')
  async logout(
    @Cookies(REFRESH_TOKEN_COOKIE_NAME) refreshToken: string,
    @Res() res: Response,
  ) {

    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }
    const deleteToken = await this.authService.deleteRefreshToken(refreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('/upload')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponse> {
    if (!user) {
      throw new UnauthorizedException({
        message: 'Неавторизований користувач',
      });
    }

    if (!file && !updateUserDto?.name) {
      throw new BadRequestException('No data provided for update');
    }

    const updatedUser = await this.authService.updateProfile(
      user.id,
      updateUserDto?.name,
      file,
    );

    return new UserResponse(updatedUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/current')
  async getCurrentUser(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    if (!user) {
      throw new UnauthorizedException('Неавторизований користувач');
    }
    const currentUser = await this.authService.getCurrentUser(user.id);
    return new UserResponse(currentUser);
  }

  @Public()
  @UseGuards(GoogleGuard)
  @Get('/google/login')
  googleLogin() {
    console.log("callback")
  }

  @Public()
  @UseGuards(GoogleGuard)
  @Get('/google/callback')
  async googleCallback(@Req() req, @Res() res, @Headers('user-agent') agent: string) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('No user from Google');
      }

      const tokens = await this.authService.login({ email: req.user.email }, agent);
      if (!tokens) {
        throw new UnauthorizedException('Failed to generate tokens');
      }

      const accessToken = await this.setRefreshTokenCookie(tokens, res);
      return res.redirect(`${process.env.GOOGLR_REDIRECT_URI}/auth/success-google?token=${accessToken}`);

    } catch (error) {
      return res.redirect(`${process.env.GOOGLR_REDIRECT_ERROR_URI}/auth/error`);
    }
  }
}
