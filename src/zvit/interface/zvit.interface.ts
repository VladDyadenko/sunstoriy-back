import { Document } from 'mongoose';

export interface IZvit extends Document {
  startDate?: Date;

  endDate?: Date;

  id?: string;
}
