import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';

class PaymentDto {
  date?: Date;
  amount?: number;
  paymentForm?: string;
  bank?: string;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  office?: string;
  child?: string;
  teacher?: string;
  price?: number;
  plan?: string;
  review?: string;
  dateLesson?: Date;
  timeLesson?: Date[];
  childName?: string;
  childSurname?: string;
  mather?: string;
  matherPhone?: string;
  teacherName?: string;
  teacherSurname?: string;
  teacherColor?: string;
  isSendSms?: boolean;
  status?: string;
  sum?: PaymentDto[];
}
