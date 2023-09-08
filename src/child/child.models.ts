import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/user.models';

export type ChildDocument = Child & Document;

@Schema({ versionKey: false, timestamps: true })
export class Child {
  @Prop({ required: [true, 'Set name for child'] })
  name: string;

  @Prop()
  surname?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  age?: string;

  @Prop()
  childImage?: string;

  @Prop({ required: [true, 'Set name for mather'] })
  mather: string;

  @Prop({ required: [true, 'phone is required'], unique: true })
  matherPhone: string;

  @Prop()
  father?: string;

  @Prop()
  fatherPhone?: string;

  @Prop()
  about?: string;

  @Prop()
  sensornaya?: string;

  @Prop()
  logoped?: string;

  @Prop()
  correction?: string;

  @Prop()
  tutor?: string;

  @Prop()
  rehabilitation?: string;

  @Prop()
  childFiles?: string[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }])
  owner: User;
}
export const ChildSchema = SchemaFactory.createForClass(Child);
