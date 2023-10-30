import { Document } from 'mongoose';

export interface ILesson extends Document {
  readonly office: string;

  readonly child: string[];

  readonly teacher: string[];

  readonly dateLesson: Date;

  readonly timeLesson: string;

  readonly plans: string;

  readonly review: string;

  readonly price: string;
}
