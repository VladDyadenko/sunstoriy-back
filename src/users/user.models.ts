import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Provider {
  GOOGLE = 'google',
  LOCAL = 'local',
}

@Schema({ versionKey: false, timestamps: false })
export class User {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  @Prop()
  name?: string;

  @Prop({ required: [true, 'Email is required'], unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  avatarUrl: string;

  // @Prop({ default: false })
  // verify: boolean;

  // @Prop()
  // verificationToken: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'lesson' }])
  lessons: string[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'child' }])
  children: string[];

  @Prop({ default: null })
  token: string;

  @Prop({ default: Provider.LOCAL })
  provider?: Provider;
}

@Schema({ versionKey: false })
export class Token {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  exp: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  userAgent: string;
}
export const TokenSchema = SchemaFactory.createForClass(Token);
export const UserSchema = SchemaFactory.createForClass(User);
