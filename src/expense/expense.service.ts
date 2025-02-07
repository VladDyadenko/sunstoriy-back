import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IExpense } from './interface/expense.interface';
import { Model } from 'mongoose';
import { Expense } from './expense.models';
import { UpdateExpenseDto } from './dto/update-expense.dto';

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
}
