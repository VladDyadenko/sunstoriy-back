import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child } from 'src/child/child.models';
import { IChild } from 'src/child/interface/child.intarface';
import { Expense } from 'src/expense/expense.models';
import { IExpense } from 'src/expense/interface/expense.interface';
import { ILesson, IPayment } from 'src/lesson/interface/lesson.interface';
import { Lesson } from 'src/lesson/lesson.models';
import { CreateOneMonthTotalZvitDto } from './dto/create-oneMonse-zvit.dto';
import { startOfYear, subDays } from 'date-fns';
import { CreateChildPerioZvitDto } from './dto/create-children-period.dto';
import { IChildrensRespons, IPaymentRespons } from './interface/zvit.interface';

@Injectable()
export class ZvitService {
  private childCache = new Map<string, IChild>();

  constructor(
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
    @InjectModel(Child.name) private childModule: Model<IChild>,
    @InjectModel(Expense.name) private expenseModule: Model<IExpense>,
  ) {}

  async createZviForSelectedPeriod(dto: CreateOneMonthTotalZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);
    const startOfCurrentYear = startOfYear(startOfDay);
    const endOfPreviousPeriod = subDays(startOfDay, 1);

    const allPayments = await this.lessonModule.aggregate([
      { $unwind: '$sum' },
      { $match: { 'sum.date': { $gte: startOfCurrentYear, $lte: endOfDay } } },
      { $project: { _id: 0, sum: 1 } },
    ]);

    const previousPayments = allPayments.filter(
      (payment) => payment.sum.date < startOfDay,
    );
    const periodPayments = allPayments.filter(
      (payment) =>
        payment.sum.date >= startOfDay && payment.sum.date <= endOfDay,
    );

    const previousLessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod },
      })
      .exec();
    const previousExpenses = await this.expenseModule
      .find({ date: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod } })
      .exec();

    const previousIncome = this.calculateIncome(
      previousPayments.map((p) => p.sum),
    );
    const previousExpense = this.calculateExpenses(previousExpenses);

    const previousPeriodProfit = {
      amount: previousIncome.amount - previousExpense.amount,
      cash: previousIncome.cash - previousExpense.cash,
      privatBank: previousIncome.privatBank - previousExpense.privatBank,
      monoBank: previousIncome.monoBank - previousExpense.monoBank,
    };

    const lessonsPeriod = await this.lessonModule
      .find({ dateLesson: { $gte: startOfDay, $lte: endOfDay } })
      .exec();
    const workedLessons = lessonsPeriod.filter(
      (lesson) => lesson.isHappend === 'Відпрацьоване',
    );
    const workedIncom = workedLessons.reduce(
      (acc, lesson) => acc + (lesson.price || 0),
      0,
    );

    const expensesPeriod = await this.expenseModule
      .find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .exec();
    const income = this.calculateIncome(periodPayments.map((p) => p.sum));
    const expense = this.calculateExpenses(expensesPeriod);

    const profit = {
      amount: income.amount - expense.amount + previousPeriodProfit.amount,
      cash: income.cash - expense.cash + previousPeriodProfit.cash,
      privatBank:
        income.privatBank -
        expense.privatBank +
        previousPeriodProfit.privatBank,
      monoBank:
        income.monoBank - expense.monoBank + previousPeriodProfit.monoBank,
    };

    return { income, workedIncom, expense, profit, previousPeriodProfit };
  }

  private calculateIncome(payments: IPayment[]): IPaymentRespons {
    return payments.reduce<IPaymentRespons>(
      (acc, payment) => {
        acc.amount += payment.amount;
        if (payment.paymentForm === 'cash') {
          acc.cash += payment.amount;
        } else if (payment.paymentForm === 'cashless') {
          if (payment.bank === 'PrivatBank') {
            acc.privatBank += payment.amount;
          } else if (payment.bank === 'MonoBank') {
            acc.monoBank += payment.amount;
          }
        }
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );
  }

  private calculateExpenses(expenses: IExpense[]) {
    return expenses.reduce(
      (acc, expense) => {
        acc.amount += expense.amount;
        if (expense.paymentForm === 'cash') {
          acc.cash += expense.amount;
        } else if (expense.paymentForm === 'cashless') {
          if (expense.bank === 'PrivatBank') {
            acc.privatBank += expense.amount;
          } else if (expense.bank === 'MonoBank') {
            acc.monoBank += expense.amount;
          }
        }
        return acc;
      },
      { cash: 0, privatBank: 0, monoBank: 0, amount: 0 },
    );
  }

  private async getChildInfo(childId: string): Promise<IChild> {
    if (this.childCache.has(childId)) {
      return this.childCache.get(childId);
    }

    const child = await this.childModule.findById(childId).exec();
    this.childCache.set(childId, child);
    return child;
  }

  async createReportChildrens(dto: CreateOneMonthTotalZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);
    const startOfCurrentYear = startOfYear(startOfDay);
    const endOfPreviousPeriod = subDays(startOfDay, 1);

    // Отримуємо всі уроки за період
    const lessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
        isHappend: 'Відпрацьоване',
      })
      .exec();

    // Групуємо уроки по дитині

    const childrenMap = new Map<string, IChildrensRespons>();

    for (const lesson of lessons) {
      const childId = lesson.child.toString();
      const childInfo = await this.getChildInfo(childId);

      if (!childrenMap.has(childId)) {
        childrenMap.set(childId, {
          child: childId,
          childName: childInfo.name,
          childSurname: childInfo.surname || '',
          start: { price: 0, sum: 0, balance: 0 },
          period: { price: 0, sum: 0, balance: 0 },
          end: { balance: 0 },
        });
      }

      const childData = childrenMap.get(childId);
      const totalSum =
        lesson.sum.reduce((acc, payment) => acc + payment.amount, 0) || 0;

      childData.period.price += lesson.price || 0;
      childData.period.sum += totalSum;
      childData.period.balance = childData.period.sum - childData.period.price;
    }

    // Отримуємо уроки за попередній період (з початку року)
    const previousLessons = await this.lessonModule
      .find({
        dateLesson: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod },
        isHappend: 'Відпрацьоване',
      })
      .exec();

    previousLessons.forEach((lesson) => {
      const childId = lesson.child.toString();
      if (childrenMap.has(childId)) {
        const childData = childrenMap.get(childId);
        const totalSum =
          lesson.sum.reduce((acc, payment) => acc + payment.amount, 0) || 0;

        childData.start.price += lesson.price || 0;
        childData.start.sum += totalSum;
        childData.start.balance = childData.start.sum - childData.start.price;
      }
    });

    // Розраховуємо кінцевий баланс
    childrenMap.forEach((childData) => {
      childData.end.balance =
        childData.start.balance + childData.period.balance;
    });

    // Перетворюємо Map у масив і сортуємо за ім’ям дитини
    const sortedChildren = Array.from(childrenMap.values()).sort((a, b) =>
      a.childName.localeCompare(b.childName),
    );

    return sortedChildren;
  }

  async getChildDetailReport(id: string, dto: CreateChildPerioZvitDto) {
    const startOfDay = new Date(dto.startDate);
    const endOfDay = new Date(dto.endDate);

    // Отримуємо всі уроки за вказаний період зі статусом "Відпрацьоване"
    const lessons = await this.lessonModule
      .find({
        child: id,
        dateLesson: { $gte: startOfDay, $lte: endOfDay },
        isHappend: 'Відпрацьоване',
      })
      .sort({ dateLesson: 1 })
      .exec();

    let totalBalance = 0;
    const details = lessons.map((lesson) => {
      // Підраховуємо всі платежі за урок
      const totalSum =
        lesson.sum.reduce((acc, payment) => acc + payment.amount, 0) || 0;
      const balance = totalSum - (lesson.price || 0);
      totalBalance += balance;

      return {
        dateLesson: lesson.dateLesson,
        lessonId: lesson._id,
        office: lesson.office,
        price: lesson.price || 0,
        sum: totalSum,
        balance,
        payments: lesson.sum,
        salaryData: {
          isHappend: lesson.isHappend,
          teacher: lesson.teacher,
          dateLesson: lesson.dateLesson,
          timeLesson: lesson.timeLesson,
          office: lesson.office,
        },
      };
    });

    const startOfCurrentYear = startOfYear(startOfDay);
    const endOfPreviousPeriod = subDays(startOfDay, 1);

    // Отримуємо всі уроки до початку періоду (щоб порахувати початковий баланс)
    const previousPeriodLessons = await this.lessonModule
      .find({
        child: id,
        dateLesson: { $gte: startOfCurrentYear, $lte: endOfPreviousPeriod },
        isHappend: 'Відпрацьоване',
      })
      .exec();

    let totalPreviousBalance = 0;
    previousPeriodLessons.forEach((lesson) => {
      const totalSum =
        lesson.sum.reduce((acc, payment) => acc + payment.amount, 0) || 0;
      totalPreviousBalance += totalSum - (lesson.price || 0);
    });

    return {
      childName: lessons[0]?.childName || '',
      childSurname: lessons[0]?.childSurname || '',
      child: id,
      totalBalance,
      totalPreviousBalance,
      details,
    };
  }
}
