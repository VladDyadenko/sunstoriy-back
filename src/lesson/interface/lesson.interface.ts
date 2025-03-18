import { Document } from 'mongoose';

export interface IPayment {
  _id?: string;
  date?: Date;
  amount?: number;
  paymentForm?: string;
  bank?: string;
}

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

  price: number;

  isSendSms: boolean;

  status?: string;

  isHappend?: string;

  sum?: IPayment[];
}
