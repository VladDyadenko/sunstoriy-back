export class CreateExpenseDto {
  date: Date;

  category: string;

  amount_accrued: number;

  paymentForm: string;

  bank: string;

  description?: string;
}
