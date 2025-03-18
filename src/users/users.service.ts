import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token, User } from './user.models';
import { CreateUserDto } from './dto/create-users.dto';
import { Model } from 'mongoose';
import { IToken, IUser } from './interface/users.interface';
import { hashSync, genSaltSync } from 'bcrypt';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { convertToSecondsUtil } from '@common/utils';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModule: Model<IUser>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    @InjectModel(Token.name) private tokenModule: Model<IToken>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const userData = {
      ...dto,
      password: dto.password ? this.hashPassword(dto.password) : undefined,
    };
    const newUser = new this.userModule(userData);
    await newUser.save();
    return newUser;
  }

  async getUsers() {
    const users = await this.userModule.find().exec();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  // async update(updateUserDto: UpdateUserDto) {
  //   const { avatarUrl, name, token, _id } = updateUserDto;

  //   const user = await this.userModule.findByIdAndUpdate(
  //     _id,
  //     { name: name, avatarUrl: avatarUrl, token: token },
  //     { new: true },
  //   );

  //   return user;
  // }

  async updateChild(_id: string, id: string) {
    const user = await this.userModule.findByIdAndUpdate(
      _id,
      {
        children: id,
      },
      { new: true },
    );

    return user;
  }

  async getUserById(id: string, isReset = false): Promise<User | null> {
    if (isReset) {
      // якщо isReset === true, то видаляємо дані з кешу, якщо юзер розлогінений
      const cacheKey = `user_${id}`;
      await this.cacheManager.del(cacheKey);
    }
    const cacheKey = `user_${id}`;
    let user = await this.cacheManager.get<User>(cacheKey);
    if (!user) {
      user = await this.userModule.findById(id);
      if (!user) return null;

      const ttl = convertToSecondsUtil(
        this.configService.get<string>('JWT_EXP') || '3000s',
      );
      await this.cacheManager.set<User>(cacheKey, user, ttl);

      return user;
    }
    return user;
  }

  async getUserByEmail(email: string, isReset = false): Promise<User | null> {
    if (isReset) {
      // якщо isReset === true, то видаляємо дані з кешу, якщо юзер розлогінений
      const cacheKey = `user_${email}`;
      await this.cacheManager.del(cacheKey);
    }
    const cacheKey = `user_${email}`;
    let user = await this.cacheManager.get<User>(cacheKey);
    if (!user) {
      user = await this.userModule.findOne({ email });
      if (!user) return null;
      const ttl = convertToSecondsUtil(
        this.configService.get<string>('JWT_EXP') || '3000s',
      );
      await this.cacheManager.set<User>(cacheKey, user, ttl);
      return user;
    }
    return user;
  }

  async deleteUserById(id: string, user: JwtPayload): Promise<string> {
    const cacheKeyId = `user_${id}`;
    const cacheKeyEmail = `user_${user.email}`;
    await Promise.all([
      this.cacheManager.del(cacheKeyId),
      this.cacheManager.del(cacheKeyEmail),
    ]);

    if (user.id !== id && user.role !== 'admin') {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    await this.tokenModule.deleteMany({ userId: id });
    await this.userModule.deleteOne({ _id: id });
    return `User ${id} deleted successfully`;
  }
  private hashPassword(password: string | undefined) {
    if (!password) return undefined;
    return hashSync(password, genSaltSync(10));
  }
}
