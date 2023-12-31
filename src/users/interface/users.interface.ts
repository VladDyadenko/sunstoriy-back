import { Document } from 'mongoose';

export interface IUser extends Document {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly avatarUrl: string;
  readonly verify: boolean;
  readonly verificationToken: string;
  readonly role: string;
  readonly lessons: string[];
  readonly children: string[];
  readonly token: string;
  readonly createdAt: string;
}
