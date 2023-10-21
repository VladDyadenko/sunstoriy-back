import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ versionKey: false, timestamps: true })
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
}
export const TeacherSchema = SchemaFactory.createForClass(Teacher);
