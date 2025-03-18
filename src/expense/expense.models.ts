import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ versionKey: false, timestamps: false })
export class Expense {
  @Prop({ required: true })
  date: Date;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'salary',
    },
  ])
  salaryId?: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  paymentForm: string;

  @Prop()
  bank: string;

  @Prop()
  description?: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
