import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-users.dto';
import { LoginUserDto } from 'src/users/dto/login-users.dto';

@Controller('/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  registration(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Post('/login')
  login(@Body() userDto: LoginUserDto) {
    return this.authService.login(userDto);
  }
}
