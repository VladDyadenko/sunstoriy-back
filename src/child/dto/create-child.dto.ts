import {
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChildDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  surname?: string;

  @IsDateString()
  birthDate?: Date;

  @IsString()
  age?: string;

  @IsString()
  mather?: string;

  matherPhone?: string;
  childImage?: string;
  father?: string;
  fatherPhone?: string;
  about?: string;
  sensornaya?: string;
  logoped?: string;
  correction?: string;
  tutor?: string;
  rehabilitation?: string;
  childFiles?: string[];
  owner: string;
}
