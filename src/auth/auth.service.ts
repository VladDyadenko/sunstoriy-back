import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as gravatar from 'gravatar';
import { Model, Types } from 'mongoose';
import { compareSync } from 'bcrypt';
import { v4 } from 'uuid';
import * as path from 'path';
import { UsersService } from 'src/users/users.service';
import { IToken, IUser } from 'src/users/interface/users.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from 'src/users/dto/update-users.dto';
import { Token, User } from 'src/users/user.models';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces/tokens.interface';
import { add } from 'date-fns';
import { HttpService } from '@nestjs/axios';
import { CreateUserDto } from 'src/users/dto/create-users.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
    @InjectModel(User.name) private userModule: Model<IUser>,
    @InjectModel(Token.name) private tokenModule: Model<IToken>,
    private readonly httpService: HttpService,
  ) {}

  async register(userDto: RegisterDto) {
    const { email, password, passwordRepeat } = userDto;
    if (!email || !password || !passwordRepeat) {
      throw new NotFoundException('Введіть всі потрібні поля');
    }
    const candidate = await this.usersService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        'Користувач з таким email вже існує',
        HttpStatus.BAD_REQUEST,
      );
    }
    const avatarUrl = gravatar.url(email);
    const newUser = await this.usersService.createUser({
      ...userDto,
      avatarUrl,
    });
    return newUser;
  }

  async login(dto: LoginDto, agent: string) {
    const user = await this.validateUser(dto);

    return await this.generateToken(user, agent);
  }

  async refreshTokens(refreshToken: string, agent: string) {
    const tokenDoc = await this.tokenModule.findOne({ token: refreshToken });

    if (!tokenDoc) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (Date.now() > tokenDoc.exp.getTime()) {
      await this.tokenModule.deleteOne({ token: refreshToken });
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.usersService.getUserById(tokenDoc.userId, true);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.generateToken(user, agent);
  }

  async deleteRefreshToken(refreshToken: string) {
    return await this.tokenModule.deleteOne({ token: refreshToken });
  }

  async updateProfile(
    userId: string,
    name?: string,
    avatar?: Express.Multer.File,
  ) {
    const user = await this.userModule.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: { name?: string; avatarUrl?: string } = {};

    // Обновляем имя только если оно передано
    if (name) {
      updateData.name = name;
    }

    // Обновляем аватар только если файл передан
    if (avatar) {
      const publicId = path.parse(avatar.originalname).name;
      updateData.avatarUrl = (
        await this.cloudinaryService.uploadFile(avatar, 'avatar', publicId)
      ).secure_url;
    }

    const updatedUser = await this.userModule.findByIdAndUpdate(
      userId,
      updateData,
      { new: true },
    );

    return updatedUser;
  }

  async logout(updateUserDto: UpdateUserDto) {
    const { _id } = updateUserDto;
    const UpdateUser = await this.userModule.findByIdAndUpdate(_id, {
      $set: { token: null },
    });
    return UpdateUser;
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userModule.findById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    return user;
  }

  private async validateUser(dto: LoginDto): Promise<User> {
    const { email, password } = dto;

    if (!email) {
      throw new NotFoundException('Введіть всі потрібні поля');
    }

    const user = await this.usersService.getUserByEmail(email, false);

    if (!user) {
      throw new NotFoundException({
        message: 'Незареєстрований користувач',
      });
    }

    // Если пользователь авторизован через Google, возвращаем его без проверки пароля
    if (user.provider === 'google') {
      return user;
    }

    // Проверяем пароль только для обычных пользователей
    if (!password) {
      throw new UnauthorizedException("Пароль обов'язковий");
    }

    const isPasswordValid = compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    return user;
  }

  private async refreshToken(_id: Types.ObjectId | string, agent: string) {
    try {
      let token = await this.tokenModule.findOne({
        userId: _id,
        userAgent: agent,
      });

      const tokenData = {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId: _id,
        userAgent: agent,
      };

      if (token) {
        token = await this.tokenModule.findOneAndUpdate(
          {
            userId: _id,
            userAgent: agent,
          },
          tokenData,
          { new: true },
        );
      } else {
        token = await this.tokenModule.create(tokenData);
      }

      return token;
    } catch (error) {
      throw error;
    }
  }
  // Генерація токенів
  private async generateToken(user: User, agent: string): Promise<Tokens> {
    try {
      const accessToken =
        'Bearer ' +
        this.jwtService.sign({
          id: user._id,
          email: user.email,
          role: user.role,
        });

      const refreshToken = await this.refreshToken(user._id, agent);

      if (!refreshToken) {
        throw new UnauthorizedException('Failed to generate refresh token');
      }

      return {
        accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw error;
    }
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.getUserByEmail(
      googleUser.email,
      false,
    );
    if (user) return user;
    const newUser = await this.usersService.createUser(googleUser);
    return newUser;
  }
}
