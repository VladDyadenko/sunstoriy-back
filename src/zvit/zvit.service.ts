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
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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

    // Отримуємо початок і кінець попереднього місяця
    const startOfPreviousMonth = startOfMonth(subMonths(startOfDay, 1));
    const endOfPreviousMonth = endOfMonth(subMonths(startOfDay, 1));

    // Отримуємо дані за попередній місяць
    const previousMonthLessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      })
      .exec();

    const previousMonthExpenses = await this.expenseModule
      .find({
        date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      })
      .exec();

    // Розраховуємо прибуток і витрати за попередній місяць
    const previousMonthIncome = previousMonthLessons?.reduce(
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

    const previousMonthExpense = previousMonthExpenses?.reduce(
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

    const previousMonthProfit = {
      amount: previousMonthIncome.amount - previousMonthExpense.amount,
      privatBank:
        previousMonthIncome.privatBank - previousMonthExpense.privatBank,
      monoBank: previousMonthIncome.monoBank - previousMonthExpense.monoBank,
      cash: previousMonthIncome.cash - previousMonthExpense.cash,
    };

    //   уроки заданого періоду
    const lessonsPeriod = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();
    //   розходи заданого періоду
    const expensesPeriod = await this.expenseModule
      .find({
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();
    // уроки цього-ж періоду зі статусом Відпрацьовані
    const lessonsWorked = lessonsPeriod?.filter((lesson) => {
      return lesson.isHappend === 'Відпрацьоване';
    });
    // усі розходи періоду
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
    // всі кошти отримані за період
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
    // кошти за відпрацьовані уроки по тарифу
    const workedIncom = lessonsWorked?.reduce(
      (acum, lesson) => acum + (+lesson.price || 0),
      0,
    );
    // прибуток за період
    const profit = {
      amount: income.amount - expense.amount + previousMonthProfit.amount,
      privatBank:
        income.privatBank - expense.privatBank + previousMonthProfit.privatBank,
      monoBank:
        income.monoBank - expense.monoBank + previousMonthProfit.monoBank,
      kasa: income.cash - expense.cash + previousMonthProfit.cash,
    };

    return { income, workedIncom, expense, profit, previousMonthProfit };
  }
}
