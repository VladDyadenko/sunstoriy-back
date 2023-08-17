import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { emailRegexp, nameRegexp, passwordRegexp } from 'src/constans/patterns';

export class CreateUserDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  @Matches(nameRegexp, {
    message: "Некоректне им'я",
  })
  readonly name: string;

  @IsEmail()
  @Matches(emailRegexp, {
    message: 'Некоректна адреса електронної пошти',
  })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Не меньше 6 символів' })
  @Matches(passwordRegexp, {
    message: 'Пароль повинен мати як мінімум одну літеру та одну цифру',
  })
  password: string;

  token?: string;

  avatarUrl?: string;
}
