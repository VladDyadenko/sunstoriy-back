import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITeacher } from 'src/teacher/interface/teacher.interface';
import { Teacher } from 'src/teacher/teacher.models';
import { AddSalaryOrder } from './dto/add-salary.dto';
import { Salary } from './salary.models';
import { ISalary } from './interface/salary.interface';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { GetSalaryByDateDto } from './dto/get-salary_date.dto';
import { IExpense } from 'src/expense/interface/expense.interface';
import { Expense } from 'src/expense/expense.models';

@Injectable()
export class SalaryService {
  constructor(
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
    @InjectModel(Salary.name) private salaryModule: Model<ISalary>,
    @InjectModel(Expense.name) private expenseModule: Model<IExpense>,
  ) {}

  async addSalaryOrder(dto: AddSalaryOrder) {
    const salary = await this.salaryModule.create(dto);
    return salary;
  }

  async updateSalary(_id: string, dto: UpdateSalaryDto) {
    const existingSalary = await this.salaryModule.findOne({ _id }).lean();

    // Формуємо новий comment
    let newComment = dto.comment;
    if (existingSalary?.comment) {
      newComment = `${existingSalary.comment}, ${dto.comment}`;
    }

    const salary = await this.salaryModule.findOneAndUpdate(
      { _id },
      {
        $set: {
          comment: newComment,
          amount_debt: dto.amount_debt,
          bank: dto.bank,
        },
        $inc: {
          amount_cash: dto.amount_cash || 0,
          amount_cashless: dto.amount_cashless || 0,
        },
      },
      {
        new: true,
      },
    );
    return salary;
  }

  async getSalaryByDate(dto: GetSalaryByDateDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    const salary = await this.salaryModule
      .find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .sort({ date: 1 })
      .exec();

    return salary;
  }

  async getSalaryById(id: string) {
    const salary = await this.salaryModule.findById({ _id: id });
    return salary;
  }

  async deleteSalaryById(id: string) {
    const salary = await this.salaryModule.findById({ _id: id });
    if (!salary) {
      throw new NotFoundException('Запис з такою ЗП не знайдено');
    }
    await this.salaryModule.deleteOne({ _id: id });

    const deletedExpenses = await this.expenseModule.deleteMany({
      salaryId: salary._id,
    });

    return `Successful delete. Додатково видалено ${deletedExpenses.deletedCount} розходів.`;
  }
}
