import { Document } from 'mongoose';

export interface ITeacher extends Document {
  readonly name: string;
  readonly surname: string;
  readonly teacherImage: string;
  readonly phone: string;
  readonly email: string;
  readonly color: string;
  readonly about: string;
  readonly specialization: string;
  salaryRate?: number;
}
