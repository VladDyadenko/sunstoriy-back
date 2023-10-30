import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Document } from 'mongoose';

export type TeacherDocument = Lesson & Document;

@Schema({ versionKey: false, timestamps: true })
export class Lesson {
  @Prop()
  office: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'child' }])
  child: string[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'teacher' }])
  teacher: string[];

  @Prop()
  dateLesson: Date;

  @Prop()
  timeLesson: string;

  @Prop()
  plans: string;

  @Prop()
  review: string;

  @Prop()
  price: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
