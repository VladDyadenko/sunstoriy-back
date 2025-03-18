import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: false })
export class Salary extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: true,
  })
  teacherId: string;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lesson',
    },
  ])
  lessonId: string[];

  @Prop({ required: true })
  name: string;

  @Prop()
  surname?: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  amount_accrued: number;

  @Prop()
  amount_cash?: number;

  @Prop()
  amount_cashless?: number;

  @Prop()
  amount_debt?: number;

  @Prop()
  paymentMethod?: string[];

  @Prop()
  bank?: string;

  @Prop()
  comment?: string;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);
