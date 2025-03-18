export class CreateLessonDto {
  office: string;
  child: string;
  teacher: string;
  price: number;
  plan: string;
  review: string;
  dateLesson: Date;
  timeLesson: Date[];
  childName: string;
  childSurname: string;
  mather?: string;
  matherPhone?: string;
  teacherName: string;
  teacherSurname: string;
  teacherColor: string;
  isSendSms: boolean;
  status?: string;
}
