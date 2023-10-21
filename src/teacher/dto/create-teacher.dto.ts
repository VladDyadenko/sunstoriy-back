import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  surname?: string;

  @IsString()
  teacherImage?: string;

  @IsString()
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  color?: string;

  @IsString()
  about?: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specialization?: any;
}
