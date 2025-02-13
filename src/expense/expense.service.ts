import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IExpense } from './interface/expense.interface';
import { Model } from 'mongoose';
import { Expense } from './expense.models';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetExpenseByDateDto } from './dto/get-expense-date.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModule: Model<IExpense>,
  ) {}
  async createExpense(dto: CreateExpenseDto) {
    const expense = await this.expenseModule.create(dto);

    return expense;
  }

  async updateExpense(_id: string, dto: UpdateExpenseDto) {
    const expense = await this.expenseModule.findOneAndUpdate({ _id }, dto, {
      new: true,
      lean: true,
    });
    if (!expense) {
      throw new Error('Такий розход не знайдено');
    }

    return expense;
  }

  async getExpenses() {
    return await this.expenseModule.find().exec();
  }

  async getExpenseById(id: string) {
    return await this.expenseModule.findById({ _id: id });
  }

  async getExpenseByDate(dto: GetExpenseByDateDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    const expenses = await this.expenseModule
      .find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .sort({ date: 1 })
      .exec();

    const finalValues = expenses.reduce(
      (acc, expense) => {
        const sum = expense.amount;
        if (expense.paymentForm === 'cash') {
          acc.cash += sum;
        } else if (expense.paymentForm === 'cashless') {
          if (expense.bank === 'PrivatBank') {
            acc.privatBank += sum;
          } else if (expense.bank === 'MonoBank') {
            acc.monoBank += sum;
          }
        }

        acc.amount += sum;
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );
    return { expenses, finalValues };
  }

  async deleteExpenseById(id: string) {
    await this.expenseModule.deleteOne({ _id: id });
    return `Successful delete`;
  }
}
