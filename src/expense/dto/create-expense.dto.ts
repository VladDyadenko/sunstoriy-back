export class CreateExpenseDto {
  date: Date;

  salaryId?: string;

  category: string;

  amount_accrued: number;

  paymentForm: string;

  bank: string;

  description?: string;
}
