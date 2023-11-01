import { CreateLessonDto } from './create-lesson.dto';

export class GetLessonByOfficeAndDateDto extends CreateLessonDto {
  office: string;
  dateLesson: Date;
}
