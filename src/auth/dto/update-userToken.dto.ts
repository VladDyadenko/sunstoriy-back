import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-users.dto';

export class UpdateUserTokenDto extends PartialType(CreateUserDto) {}
