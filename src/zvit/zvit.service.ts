import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child } from 'src/child/child.models';
import { IChild } from 'src/child/interface/child.intarface';
import { Expense } from 'src/expense/expense.models';
import { IExpense } from 'src/expense/interface/expense.interface';
import { ILesson } from 'src/lesson/interface/lesson.interface';
import { Lesson } from 'src/lesson/lesson.models';
import { ITeacher } from 'src/teacher/interface/teacher.interface';
import { Teacher } from 'src/teacher/teacher.models';
import { CreateOneMonthTotalZvitDto } from './dto/create-oneMonse-zvit.dto';

@Injectable()
export class ZvitService {
  constructor(
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
    @InjectModel(Child.name) private childModule: Model<IChild>,
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
    @InjectModel(Expense.name) private expenseModule: Model<IExpense>,
  ) {}

  async createZvitOneMonthTotal(dto: CreateOneMonthTotalZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    const lessonsPeriod = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    const expensesPerid = await this.expenseModule
      .find({
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    const lessonsWorked = lessonsPeriod?.filter((lesson) => {
      return lesson.isHappend === 'Відпрацьоване';
    });

    const totalExpensePeriod = expensesPerid?.reduce(
      (acum, expense) => acum + (expense.amount || 0),
      0,
    );

    const totalIncome = lessonsPeriod?.reduce(
      (acum, lesson) => acum + (lesson.sum || 0),
      0,
    );
    const workedIncom = lessonsWorked?.reduce(
      (acum, lesson) => acum + (+lesson.price || 0),
      0,
    );

    const netProfit = totalIncome - totalExpensePeriod;

    const totalData = {
      totalIncome: totalIncome,
      workedIncom: workedIncom,
      totalExpensePeriod: totalExpensePeriod,
      netProfit: netProfit,
    };
    return totalData;
  }
}
