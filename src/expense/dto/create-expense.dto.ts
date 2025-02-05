export class CreateExpenseDto {
  date: Date;

  category: string;

  amount: number;

  paymentForm: string;

  bank: string;

  description?: string;
}
