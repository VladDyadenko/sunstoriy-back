import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  date: Date;

  salaryId?: string;

  category: string;

  amount: number;

  paymentForm: string;

  bank: string;

  description?: string;
}
