import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  office?: string;

  child?: string[];

  teacher?: string[];

  dateLesson?: Date;

  timeLesson?: string;

  plans?: string;

  review?: string;

  price?: string;
}
