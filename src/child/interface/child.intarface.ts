import { Document } from 'mongoose';

export interface IChild extends Document {
  readonly name: string;
  readonly surname: string;
  readonly birthDate: Date;
  readonly age: string;
  readonly file: string;
  readonly mather: string;
  readonly matherPhone: string;
  readonly father: string;
  readonly fatherPhone: string;
  readonly about: string;
  readonly sensornaya: string;
  readonly logoped: string;
  readonly correction: string;
  readonly tutor: string;
  readonly rehabilitation: string;
  readonly childFiles: string[];
  readonly createdAt: string;
}
