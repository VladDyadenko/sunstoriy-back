import { Document } from 'mongoose';

export interface ILesson extends Document {
  readonly office: string;

  readonly child: string;

  readonly teacher: string;

  readonly dateLesson: Date;

  readonly timeLesson: Date[];

  readonly childName: string;

  readonly childSurname: string;

  readonly teacherName: string;

  readonly teacherSurname: string;

  readonly teacherColor: string;

  readonly plan: string;

  readonly review: string;

  readonly price: string;
}
