import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-users.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  _id?: string;
  avatarUrl?: string;
  newUsername?: string;
  role?: string;
}
