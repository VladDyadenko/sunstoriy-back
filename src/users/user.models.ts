import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Child } from 'src/child/child.models';
import { Type } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: [true, 'Set name for user'] })
  name: string;

  @Prop({ required: [true, 'Email is required'], unique: true })
  email: string;

  @Prop({ required: [true, 'Set password for user'] })
  password: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: false })
  verify: boolean;

  @Prop()
  verificationToken: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'lesson' }])
  lessons: string[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: Child.name }])
  @Type(() => Child)
  children: Child[];

  @Prop({ default: null })
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
