import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Document } from 'mongoose';

export type TeacherDocument = Lesson & Document;

@Schema({ versionKey: false, timestamps: true })
export class Lesson {
  @Prop({ required: true })
  office: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'child', required: true })
  child: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: true,
  })
  teacher: string;

  @Prop({
    required: true,
  })
  dateLesson: Date;

  @Prop({
    required: true,
  })
  timeLesson: Date[];

  @Prop()
  plan: string;

  @Prop()
  childName: string;

  @Prop()
  childSurname: string;

  @Prop()
  mather: string;

  @Prop()
  matherPhone: string;

  @Prop()
  teacherName: string;

  @Prop()
  teacherSurname: string;

  @Prop()
  teacherColor: string;

  @Prop()
  review: string;

  @Prop()
  price: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
