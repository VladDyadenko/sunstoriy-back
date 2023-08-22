import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as gravatar from 'gravatar';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-users.dto';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/user.models';
import { LoginUserDto } from 'src/users/dto/login-users.dto';
import { IUser } from 'src/users/interface/users.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from 'src/users/dto/update-users.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
    @InjectModel(User.name) private userModule: Model<IUser>,
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
    const { _id: id } = newUser;
    const token = await this.generateToken(newUser, id);

    const updatedUser = await this.userModule.findByIdAndUpdate(id, token, {
      new: true,
    });
    return updatedUser;
  }

  async login(userDto: LoginUserDto) {
    const user = await this.validateUser(userDto);
    const { _id: id } = user;
    const token = await this.generateToken(user, id);

    const updatedUser = await this.userModule.findByIdAndUpdate(id, token, {
      new: true,
    });

    return updatedUser;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
    folder: string,
  ) {
    const user = await this.userModule.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const publicId = `${folder}/${file.originalname}`;
    const avatarUrl = file
      ? (await this.cloudinaryService.uploadFile(file, folder, publicId))
          .secure_url
      : user.avatarUrl;

    const newName = updateUserDto ? updateUserDto.name : user.name;
    const avatarNew = file ? avatarUrl : user.avatarUrl;

    const updatedUser = await this.userModule.findByIdAndUpdate(
      userId,
      { name: newName, avatarUrl: avatarNew },
      { new: true },
    );

    return {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      publicId,
    };
  }

  async logout(_id: string) {
    const user = await this.userModule.findById(_id);

    if (!user) {
      throw new UnauthorizedException({
        message: 'Неавторизований користувач',
      });
    }
    const updateUser = await this.userModule.findByIdAndUpdate(_id, {
      $set: { token: null },
    });
    return updateUser;
  }

  private async generateToken(user: User, id: string) {
    const payload = {
      _id: id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };

    return { token: this.jwtService.sign(payload) };
  }

  private async validateUser(userDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (!user) {
      throw new NotFoundException({
        message: 'Незареєстрований користувач',
      });
    }
    const { email, password } = userDto;
    if (!email || !password) {
      throw new NotFoundException('Введіть всі потрібні поля');
    }
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
