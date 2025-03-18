import { Document } from 'mongoose';

export interface IExpense extends Document {
  date: Date;

  salaryId?: string;

  category: string;

  amount: number;

  paymentForm: string;

  bank: string;

  description?: string;
}
