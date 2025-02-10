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
import { startOfYear, subDays } from 'date-fns';

@Injectable()
export class ZvitService {
  constructor(
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
    @InjectModel(Child.name) private childModule: Model<IChild>,
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
    @InjectModel(Expense.name) private expenseModule: Model<IExpense>,
  ) {}

  async createZviForSelectedPeriod(dto: CreateOneMonthTotalZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    // Отримуємо початок поточного року
    const startOfCurrentYear = startOfYear(startOfDay);

    // Отримуємо кінець попереднього дня (перед startOfDay)
    const endOfPreviousPeriod = subDays(startOfDay, 1);

    // Отримуємо дані від початку року до кінця попереднього дня
    const previousPeriodLessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod },
      })
      .exec();

    const previousPeriodExpenses = await this.expenseModule
      .find({
        date: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod },
      })
      .exec();

    // Розраховуємо прибуток і витрати за попередній період
    const previousPeriodIncome = previousPeriodLessons?.reduce(
      (acc, lesson) => {
        const sum = lesson.sum || 0;

        if (lesson.paymentForm === 'cash') {
          acc.cash += sum;
        } else if (lesson.paymentForm === 'cashless') {
          if (lesson.bank === 'PrivatBank') {
            acc.privatBank += sum;
          } else if (lesson.bank === 'MonoBank') {
            acc.monoBank += sum;
          }
        }

        acc.amount += sum;
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );

    const previousPeriodExpense = previousPeriodExpenses?.reduce(
      (acc, expense) => {
        const amount = expense.amount || 0;

        if (expense.paymentForm === 'cash') {
          acc.cash += amount;
        } else if (expense.paymentForm === 'cashless') {
          if (expense.bank === 'PrivatBank') {
            acc.privatBank += amount;
          } else if (expense.bank === 'MonoBank') {
            acc.monoBank += amount;
          }
        }

        acc.amount += amount;
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );

    const previousPeriodProfit = {
      amount: previousPeriodIncome.amount - previousPeriodExpense.amount,
      privatBank:
        previousPeriodIncome.privatBank - previousPeriodExpense.privatBank,
      monoBank: previousPeriodIncome.monoBank - previousPeriodExpense.monoBank,
      cash: previousPeriodIncome.cash - previousPeriodExpense.cash,
    };

    // Отримуємо уроки за заданий період
    const lessonsPeriod = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    // Отримуємо розходи за заданий період
    const expensesPeriod = await this.expenseModule
      .find({
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    // Отримуємо уроки зі статусом "Відпрацьоване"
    const lessonsWorked = lessonsPeriod?.filter((lesson) => {
      return lesson.isHappend === 'Відпрацьоване';
    });

    // Розраховуємо всі розходи за період
    const expense = expensesPeriod?.reduce(
      (acc, expense) => {
        const amount = expense.amount || 0;

        if (expense.paymentForm === 'cash') {
          acc.cash += amount;
        } else if (expense.paymentForm === 'cashless') {
          if (expense.bank === 'PrivatBank') {
            acc.privatBank += amount;
          } else if (expense.bank === 'MonoBank') {
            acc.monoBank += amount;
          }
        }

        acc.amount += amount;
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );

    // Розраховуємо всі кошти, отримані за період
    const income = lessonsPeriod?.reduce(
      (acc, lesson) => {
        const sum = lesson.sum || 0;

        if (lesson.paymentForm === 'cash') {
          acc.cash += sum;
        } else if (lesson.paymentForm === 'cashless') {
          if (lesson.bank === 'PrivatBank') {
            acc.privatBank += sum;
          } else if (lesson.bank === 'MonoBank') {
            acc.monoBank += sum;
          }
        }

        acc.amount += sum;
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );

    // Розраховуємо кошти за відпрацьовані уроки по тарифу
    const workedIncom = lessonsWorked?.reduce(
      (acum, lesson) => acum + (+lesson.price || 0),
      0,
    );

    // Розраховуємо прибуток за період
    const profit = {
      amount: income.amount - expense.amount + previousPeriodProfit.amount,
      privatBank:
        income.privatBank -
        expense.privatBank +
        previousPeriodProfit.privatBank,
      monoBank:
        income.monoBank - expense.monoBank + previousPeriodProfit.monoBank,
      kasa: income.cash - expense.cash + previousPeriodProfit.cash,
    };

    return { income, workedIncom, expense, profit, previousPeriodProfit };
  }
}
