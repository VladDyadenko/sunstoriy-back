import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Order {
  @Prop()
  office: string;
}
