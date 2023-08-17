import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-users.dto';
import { UsersService } from 'src/users/users.service';
import * as gravatar from 'gravatar';
import { User } from '../users/user.models';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/users/dto/login-users.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    const { email, password } = userDto;
    if (!email || !password) {
      throw new NotFoundException('Введіть всі потрібні поля');
    }
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        'Користувач з таким email вже існує',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const avatarUrl = gravatar.url(email);
    const newUser = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
      avatarUrl,
    });

    const token = await this.generateToken(newUser);

    const updatedUser = await this.userService.update(newUser.id, token);

    return updatedUser;
  }

  async login(userDto: LoginUserDto) {
    const user = await this.validateUser(userDto);
    const token = await this.generateToken(user);
    const updatedUser = await this.userService.update(user.id, token);

    return updatedUser;
  }

  private async generateToken(user: User) {
    const payload = {
      email: user.email,
    };
    return { token: this.jwtService.sign(payload) };
  }

  private async validateUser(userDto: LoginUserDto) {
    const { email, password } = userDto;
    if (!email || !password) {
      throw new NotFoundException('Введіть всі потрібні поля');
    }
    const user = await this.userService.getUserByEmail(userDto.email);
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({ message: 'Невірний пароль або email' });
  }
}
