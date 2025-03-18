import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema()
class Payment {
  @Prop({ type: Date, required: true })
  date?: Date;

  @Prop({ type: Number, required: true })
  amount?: number;

  @Prop({ type: String, required: true })
  paymentForm?: string;

  @Prop({ type: String })
  bank?: string;
}

const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema({ versionKey: false, timestamps: false })
export class Lesson {
  @Prop({ required: true })
  office: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'child', required: true })
  child: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'teacher', required: true })
  teacher: string;

  @Prop({ required: true })
  dateLesson: Date;

  @Prop({ required: true })
  timeLesson: Date[];

  @Prop()
  plan: string;

  @Prop()
  childName: string;

  @Prop()
  childSurname: string;

  @Prop()
  mather: string;

  @Prop()
  matherPhone: string;

  @Prop()
  teacherName: string;

  @Prop()
  teacherSurname: string;

  @Prop()
  teacherColor: string;

  @Prop()
  review: string;

  @Prop()
  price: number;

  @Prop({ default: false })
  isSendSms: boolean;

  @Prop({ default: 'to_plan' })
  status: string;

  @Prop()
  isHappend: string;

  // Використовуємо масив підсхем
  @Prop({ type: [PaymentSchema], default: [] })
  sum: Payment[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
