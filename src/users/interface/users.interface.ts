import { Document } from 'mongoose';
import { Provider } from '../user.models';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  role: string;
  lessons: string[];
  children: string[];
  token: string;
  provider?: Provider;
  createdAt: string;
}

export interface IToken extends Document {
  token: string;
  exp: Date;
  userId: string;
  userAgent: string;
}
