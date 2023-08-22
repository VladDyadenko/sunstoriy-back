import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Res,
  Request,
  UnauthorizedException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-users.dto';
import { LoginUserDto } from 'src/users/dto/login-users.dto';
import { Public } from './public.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from 'src/users/dto/update-users.dto';

@Controller('/')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Post('/register')
  async registration(@Body() userDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.authService.register(userDto);
      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      return res.status(200).json({
        message: 'Success login',
        token: user.token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Public()
  @Post('/login')
  async login(@Body() userDto: LoginUserDto, @Res() res: Response) {
    try {
      const user = await this.authService.login(userDto);
      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      return res.status(200).json({
        message: 'Success login',
        token: user.token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          lessons: user.lessons,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Patch('/logout/:id')
  async logout(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.authService.logout(id);
      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      return res.status(204).json({
        message: 'User logout successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Get('/current')
  async getCurrent(@Request() req, @Res() res: Response) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      return res.json({
        code: HttpStatus.OK,
        message: 'Success',
        user,
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      let folder: string;
      if (file.fieldname === 'avatar') {
        folder = 'avatars';
      } else if (file.fieldname === 'child') {
        folder = 'children';
      } else if (file.fieldname === 'teacher') {
        folder = 'teachers';
      } else if (file.fieldname === 'lesson') {
        folder = 'lessons';
      } else {
        folder = 'life';
      }
      const updateUser = await this.authService.updateProfile(
        req.user._id,
        updateUserDto,
        file,
        folder,
      );
      return res.json({
        code: HttpStatus.OK,
        message: 'User update successful',
        updateUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
}
