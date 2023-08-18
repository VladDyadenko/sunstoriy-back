import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Res,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-users.dto';
import { LoginUserDto } from 'src/users/dto/login-users.dto';
import { IUser } from 'src/users/interface/users.interface';

@Controller('/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async registration(@Body() userDto: CreateUserDto, @Res() res: Response) {
    try {
      const newUser = await this.authService.register(userDto);
      if (!newUser) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      return res.status(200).json({
        message: 'Success login',
        token: newUser.token,
        user: {
          name: newUser.name,
          email: newUser.email,
          avatarUrl: newUser.avatarUrl,
          registeredAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }

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
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          lessons: user.lessons,
          registeredAt: user.createdAt,
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
  async getCurrent(@Body() userDto: IUser, @Res() res: Response) {
    try {
      const user = await this.authService.getCurrent(userDto);

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
}
