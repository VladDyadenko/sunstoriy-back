import { IsPasswordsMatchingConstraint } from '@common/decorators';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { emailRegexp, nameRegexp, passwordRegexp } from 'src/constans/patterns';

export class RegisterDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  @Matches(nameRegexp, {
    message: "Некоректне им'я",
  })
  name?: string;

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
  password?: string;

  @IsString()
  @MinLength(6)
  @Validate(IsPasswordsMatchingConstraint)
  passwordRepeat?: string;
}
