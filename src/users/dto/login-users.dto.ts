import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { emailRegexp, passwordRegexp } from 'src/constans/patterns';

export class LoginUserDto {
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
}
