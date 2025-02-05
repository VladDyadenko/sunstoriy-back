import { Document } from 'mongoose';
import { User } from 'src/users/user.models';

export interface IExpense extends Document {
  date: Date;

  category: string;

  amount: number;

  paymentForm: string;

  bank: string;

  description?: string;
}
