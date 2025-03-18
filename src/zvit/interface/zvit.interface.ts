import { Document } from 'mongoose';

export interface IZvit extends Document {
  startDate?: Date;

  endDate?: Date;

  id?: string;
}
export interface IPaymentRespons {
  cash: number;
  privatBank: number;
  monoBank: number;
  amount: number;
}

export interface IChildrensRespons {
  child: string;
  childName: string;
  childSurname: string;
  start: { price: number; sum: number; balance: number };
  period: { price: number; sum: number; balance: number };
  end: { balance: number };
}
