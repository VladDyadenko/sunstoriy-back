import { PartialType } from '@nestjs/mapped-types';
import { CreateChildDto } from './create-child.dto';

export class UpdateChildDto extends PartialType(CreateChildDto) {
  name?: string;
  surname?: string;
  birthDate?: Date;
  age?: string;
  mather?: string;
  matherPhone?: string;
  childImage?: string;
  father?: string;
  fatherPhone?: string;
  about?: string;
  sensornaya?: string;
  logoped?: string;
  correction?: string;
  tutor?: string;
  rehabilitation?: string;
  childFiles?: string[];
}
