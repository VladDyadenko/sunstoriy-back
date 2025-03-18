import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Document } from 'mongoose';
import { Lesson } from 'src/lesson/lesson.models';

export type TeacherDocument = Teacher & Document;

@Schema({ versionKey: false, timestamps: false })
export class Teacher {
  @Prop({ required: [true, 'Set name for teacher'] })
  name: string;

  @Prop()
  surname?: string;

  @Prop()
  teacherImage?: string;

  @Prop()
  phone?: string;

  @Prop()
  email: string;

  @Prop()
  color?: string;

  @Prop()
  about?: string;

  @Prop()
  specialization?: [string];

  @Prop()
  salaryRate?: number;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'lessons' }])
  lesson: Lesson;
}
export const TeacherSchema = SchemaFactory.createForClass(Teacher);
