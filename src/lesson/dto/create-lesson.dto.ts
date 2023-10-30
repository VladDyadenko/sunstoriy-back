import { IsString, IsNumber } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  office: string;

  @IsString()
  child: string[];

  @IsString()
  teacher: string[];

  @IsString()
  dateLesson: Date;

  @IsString()
  timeLesson: string;

  @IsString()
  plans?: string;

  @IsString()
  review?: string;

  @IsNumber()
  price?: string;
}
