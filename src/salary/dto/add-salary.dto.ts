export class AddSalaryOrder {
  teacherId: string;
  lessonId: string;
  name: string;
  surname: string;
  date: Date;
  amount_accrued: number;
  amount_cash?: number;
  amount_cashless?: number;
  amount_debt?: number;
  paymentMethod?: string[];
  bank?: string;
  comment?: string;
}
