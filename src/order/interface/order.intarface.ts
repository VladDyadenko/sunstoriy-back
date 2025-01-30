import { Document } from 'mongoose';

export interface IOrder extends Document {
  type: 'debet' | 'credit';

  dateTransaction: Date;

  child?: string;

  lesson?: string;

  teacher?: string;

  office?: string;

  sum: string;

  paymentForm: string;

  bank?: string;

  transactionInfo?: string;

  transactionName?: string;
}
