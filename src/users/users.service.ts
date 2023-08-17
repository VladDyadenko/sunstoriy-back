import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.models';
import { CreateUserDto } from './dto/create-users.dto';
import { Model } from 'mongoose';
import { IUser } from './interface/users.interface';
import { UpdateUserDto } from './dto/update-users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModule: Model<IUser>) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userModule.create(dto);
    return user;
  }

  async getUsers() {
    const users = await this.userModule.find().exec();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { avatarUrl, name, token } = updateUserDto;

    const user = await this.userModule.findByIdAndUpdate(
      id,
      { name: name, avatarUrl: avatarUrl, token: token },
      { new: true },
    );

    return user;
  }

  async getUserById(id: string) {
    const user = await this.userModule.findById({ _id: id });
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userModule.findOne({ email });
    return user;
  }

  async deleteUserById(id: string) {
    const user = await this.userModule.deleteOne({ _id: id });
    return `This action delete a #${user} user`;
  }
}
