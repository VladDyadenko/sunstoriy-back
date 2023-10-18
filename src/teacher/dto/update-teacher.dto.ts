import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  name?: string;
  surname?: string;
  teacherImage?: string;
  phone?: string;
  email?: string;
  color?: string;
  about?: string;
  specialization?: string[];
}
