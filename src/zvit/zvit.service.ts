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
import { CreateChildPerioZvitDto } from './dto/create-children-period.dto';

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

  async createReportChildrens(dto: CreateOneMonthTotalZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    // Отримуємо всі уроки за вказаний період зі статусом "Відпрацьовано"
    const lessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
        isHappend: 'Відпрацьоване',
      })
      .exec();

    // Групуємо уроки по дитині
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childrenMap = new Map<string, any>();
    lessons.forEach((lesson) => {
      const child = lesson.child.toString();
      if (!childrenMap.has(child)) {
        childrenMap.set(child, {
          child: lesson.child,
          childName: lesson.childName,
          childSurname: lesson.childSurname,
          start: { price: 0, sum: 0, balance: 0 },
          period: { price: 0, sum: 0, balance: 0 },
          end: { balance: 0 },
        });
      }

      const childData = childrenMap.get(child);
      childData.period.price += lesson.price || 0;
      childData.period.sum += lesson.sum || 0;
      childData.period.balance = childData.period.sum - childData.period.price;
    });

    // Отримуємо дані на початок періоду
    const startOfCurrentYear = startOfYear(startOfDay);
    const endOfPreviousPeriod = subDays(startOfDay, 1);

    const previousPeriodLessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod },
        isHappend: 'Відпрацьоване',
      })
      .exec();

    previousPeriodLessons.forEach((lesson) => {
      const child = lesson.child.toString();
      if (childrenMap.has(child)) {
        const childData = childrenMap.get(child);
        childData.start.price += lesson.price || 0;
        childData.start.sum += lesson.sum || 0;
        childData.start.balance = childData.start.sum - childData.start.price;
      }
    });

    // Розраховуємо баланс на кінець періоду
    childrenMap.forEach((childData) => {
      childData.end.balance =
        childData.start.balance + childData.period.balance;
    });

    // Повертаємо результат у вигляді масиву
    return Array.from(childrenMap.values());
  }

  async getChildDetailReport(_id: string, dto: CreateChildPerioZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    const lessons = await this.lessonModule
      .find({
        child: _id,
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
        isHappend: 'Відпрацьоване',
      })
      .exec();

    let totalBalance = 0;
    const details = lessons.map((lesson) => {
      const balance = (lesson.sum || 0) - (lesson.price || 0);
      totalBalance += balance;
      return {
        dateLesson: lesson.dateLesson,
        office: lesson.office,
        price: lesson.price || 0,
        sum: lesson.sum || 0,
        balance,
      };
    });

    return {
      childName: lessons[0]?.childName || '',
      childSurname: lessons[0]?.childSurname || '',
      child: _id,
      totalBalance,
      details,
    };
  }
}
