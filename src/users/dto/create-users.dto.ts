import { IsEmail, IsOptional, IsString } from 'class-validator';

import { Provider } from '../user.models';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  provider?: Provider;
}
