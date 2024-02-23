import { Document } from 'mongoose';

export interface ILesson extends Document {
  office: string;

  child: string;

  teacher: string;

  dateLesson: Date;

  timeLesson: Date[];

  childName: string;

  childSurname: string;

  mather?: string;

  matherPhone?: string;

  teacherName: string;

  teacherSurname: string;

  teacherColor: string;

  plan: string;

  review: string;

  price: string;

  isSendSms: boolean;

  status?: string;
}
