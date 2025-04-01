import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson } from './lesson.models';
import { ILesson } from './interface/lesson.interface';
import { Model } from 'mongoose';
import { Child } from 'src/child/child.models';
import { IChild } from 'src/child/interface/child.intarface';
import { Teacher } from 'src/teacher/teacher.models';
import { ITeacher } from 'src/teacher/interface/teacher.interface';
import { checkLessonAvailability } from './lessonUtils';
import { GetLessonByOfficeAndDateDto } from './dto/get-lesson-office.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Salary } from 'src/salary/salary.models';
import { ISalary } from 'src/salary/interface/salary.interface';
import { SalaryService } from 'src/salary/salary.service';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { LessonByOfficeDateTeacherDto } from './dto/get-lesson-date-teacher.dto';

@Injectable()
export class LessonService {
  constructor(
    private readonly salaryService: SalaryService,
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
    @InjectModel(Child.name) private childModule: Model<IChild>,
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
    @InjectModel(Salary.name) private salaryModule: Model<ISalary>,
  ) {}

  async createLesson(dto: CreateLessonDto) {
    // Преобразуем timeLesson, чтобы дата совпадала с dateLesson
    const dateLesson = new Date(dto.dateLesson);
    dto.timeLesson = dto.timeLesson.map((time) => {
      const updatedTime = new Date(time);

      // Встановлюємо 1-й день місяця, щоб уникнути переповзання
      updatedTime.setDate(1);
      updatedTime.setFullYear(dateLesson.getFullYear());
      updatedTime.setMonth(dateLesson.getMonth());
      updatedTime.setDate(dateLesson.getDate()); // Повертаємо потрібний день

      return updatedTime;
    });
    const availability = await checkLessonAvailability(this.lessonModule, dto);

    if (!availability.isAvailable) {
      throw new HttpException(availability.message, HttpStatus.BAD_REQUEST);
    }

    const lesson = await this.lessonModule.create(dto);
    await this.childModule.findByIdAndUpdate(
      dto.child,
      {
        $push: {
          lesson: lesson._id,
        },
      },
      { new: true },
    );
    await this.teacherModule.findByIdAndUpdate(
      dto.teacher,
      {
        $push: {
          lesson: lesson._id,
        },
      },
      { new: true },
    );

    return lesson;
  }

  async updateLesson(_id: string, dto: UpdateLessonDto) {
    const availability = await checkLessonAvailability(
      this.lessonModule,
      dto,
      _id,
    );

    if (!availability.isAvailable) {
      throw new HttpException(availability.message, HttpStatus.BAD_REQUEST);
    }

    // Отримуємо поточний урок перед оновленням
    const existingLesson = await this.lessonModule.findById(_id);
    if (!existingLesson) {
      throw new Error('Заняття не знайдено');
    }

    // Обробка платежів (sum)
    if ('sum' in dto && Array.isArray(dto.sum)) {
      // Додаємо нові платежі до поточного масиву
      dto.sum = [...(existingLesson.sum || []), ...dto.sum];
    }

    // Оновлюємо урок
    const lesson = await this.lessonModule.findOneAndUpdate({ _id }, dto, {
      new: true,
      lean: true,
    });

    if (!lesson) {
      throw new Error('Заняття не знайдено');
    }

    if (!('isHappend' in lesson)) {
      return;
    }

    // Видаляємо зайві пробіли
    const isHappend = lesson.isHappend.trim();

    // Знаходимо дані вчителя
    const teacher = await this.teacherModule.findById({ _id: lesson.teacher });
    if (!teacher) throw new Error('Вчителя не знайдено');

    if (!teacher.salaryRate || teacher.salaryRate === 0) {
      return lesson;
    }

    // Перевіряємо, чи вже є зарплатний запис за цю дату і вчителя
    const isSalaryInThisDate = await this.salaryModule.findOne({
      date: lesson.dateLesson,
      teacherId: teacher._id,
    });

    if (!isSalaryInThisDate && isHappend === 'Відпрацьоване') {
      // Створюємо запис, якщо його немає
      await this.salaryService.addSalaryOrder({
        teacherId: teacher._id,
        name: teacher.name || '',
        surname: teacher.surname || '',
        date: lesson.dateLesson,
        amount_accrued: teacher.salaryRate,
        amount_debt: teacher.salaryRate,
        lessonId: lesson._id,
      });
    } else if (isSalaryInThisDate) {
      if (isHappend === 'Відпрацьоване') {
        // Додаємо урок до зарплати
        await this.salaryModule.updateOne(
          {
            teacherId: teacher._id,
            date: lesson.dateLesson,
            lessonId: { $nin: [lesson._id] },
          },
          {
            $push: { lessonId: lesson._id },
            $inc: {
              amount_accrued: teacher.salaryRate,
              amount_debt: teacher.salaryRate,
            },
          },
          { new: true },
        );
      } else if (isHappend === 'Заплановане') {
        // Видаляємо урок із зарплати
        const salary = await this.salaryModule.findOneAndUpdate(
          {
            teacherId: teacher._id,
            date: lesson.dateLesson,
            lessonId: { $in: [lesson._id] },
          },
          {
            $pull: { lessonId: lesson._id },
            $inc: {
              amount_accrued: -teacher.salaryRate,
              amount_debt: -teacher.salaryRate,
            },
          },
          { new: true },
        );

        // Якщо в зарплатному ордері не залишилось відпрацьованих уроків, його видаляють
        if (salary && salary.lessonId && salary.lessonId.length === 0) {
          await this.salaryModule.deleteOne({ _id: salary._id });
        }
      }
    }

    return lesson;
  }

  async getLessons() {
    const lessons = await this.lessonModule.find().exec();
    return lessons;
  }

  async getLessonById(id: string) {
    const lesson = await this.lessonModule.findById({ _id: id });
    return lesson;
  }

  async getLessonByOfficeAndDateTeachers(dto: LessonByOfficeDateTeacherDto) {
    const dates = Array.isArray(dto.dateCurrentLesson)
      ? dto.dateCurrentLesson
      : [dto.dateCurrentLesson];

    const formattedDates = dates.map((timestamp) => {
      const date = new Date(Number(timestamp));
      if (isNaN(date.getTime())) {
        throw new HttpException('Invalid time value', HttpStatus.BAD_REQUEST);
      }
      return date.toISOString();
    });

    // Получаем все уроки
    const lessons = await this.lessonModule
      .find({
        office: { $in: dto.offices },
        dateLesson: { $in: formattedDates },
      })
      .sort({ dateLesson: 1 })
      .lean();

    // Структурируем данные для графика
    const scheduleByDate = formattedDates.reduce((acc, date) => {
      // Получаем все уроки на эту дату
      const lessonsForDate = lessons.filter(
        (lesson) => new Date(lesson.dateLesson).toISOString() === date,
      );

      if (lessonsForDate.length === 0) return acc;

      // Получаем уникальные офисы с уроками на эту дату
      const officesWithLessons = [
        ...new Set(lessonsForDate.map((lesson) => lesson.office)),
      ];

      // Получаем уникальные временные слоты (массивы начала и конца занятия)
      const uniqueTimes = [
        ...new Set(
          lessonsForDate.map((lesson) =>
            JSON.stringify(
              lesson.timeLesson.map((time) => new Date(time).toISOString()),
            ),
          ),
        ),
      ]
        .map((timeStr) => JSON.parse(timeStr))
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

      // Группируем уроки по офисам
      const lessonsByOffice = officesWithLessons.reduce((officeAcc, office) => {
        const officeLessons = lessonsForDate
          .filter((lesson) => lesson.office === office)
          .sort((a, b) => {
            const timeA = new Date(a.timeLesson[0]).getTime();
            const timeB = new Date(b.timeLesson[0]).getTime();
            return timeA - timeB;
          });

        if (officeLessons.length > 0) {
          officeAcc[office] = officeLessons;
        }
        return officeAcc;
      }, {});

      acc[date] = {
        offices: officesWithLessons,
        uniqueTimePairs: uniqueTimes, // массив массивов времени [["start1", "end1"], ["start2", "end2"]]
        lessons: lessonsByOffice,
      };

      return acc;
    }, {});

    return scheduleByDate;
  }

  async getLessonByOfficeAndDate(dto: GetLessonByOfficeAndDateDto) {
    const numericDate = dto.dateCurrentLesson;
    const dateObject = new Date(numericDate);
    const formattedDate = dateObject.toISOString();

    const lessons = await this.lessonModule
      .find(
        {
          $and: [{ office: dto.offices }, { dateLesson: formattedDate }],
        },
        { createdAt: 0, updatedAt: 0 },
      )
      .sort({ dateLesson: 1, timeLesson: 1 });

    return lessons;
  }

  async deleteLessonById(id: string) {
    const lesson = await this.lessonModule.findById({ _id: id });

    const { child, teacher, office } = lesson;

    if (
      lesson.isHappend === 'Відпрацьоване' ||
      (lesson.sum && lesson.sum.length > 0)
    ) {
      throw new Error('Заняття відпрацьоване або має оплату!!!');
    }

    await this.childModule.findByIdAndUpdate(
      {
        _id: child,
      },
      {
        $pull: {
          lesson: id,
        },
      },
      { new: true },
    );
    await this.teacherModule.findByIdAndUpdate(
      {
        _id: teacher,
      },
      {
        $pull: {
          lesson: id,
        },
      },
      { new: true },
    );

    await this.lessonModule.deleteOne({ _id: id });
    return office;
  }

  //  Сервіси роботи з платежами

  async addPayment(lessonId: string, dto: AddPaymentDto) {
    const lesson = await this.lessonModule.findById(lessonId);
    if (!lesson) {
      throw new HttpException('Заняття не знайдено', HttpStatus.NOT_FOUND);
    }

    const { isHappend, ...paymentData } = dto;
    if (isHappend !== undefined) {
      lesson.isHappend = isHappend;
    }

    if (paymentData.paymentForm === 'noPayment') {
      await lesson.save();
      return lesson;
    }

    if (!lesson.sum || lesson.sum.length === 0) {
      lesson.sum = [paymentData];
      await lesson.save();
      return lesson;
    }

    const existingPayment = lesson.sum.find((p) => {
      const dtoDate = new Date(paymentData.date);
      return (
        p.date.getTime() === dtoDate.getTime() &&
        p.paymentForm === paymentData.paymentForm &&
        p.bank === paymentData.bank
      );
    });

    if (existingPayment) {
      existingPayment.amount += paymentData.amount;
    } else {
      lesson.sum.push(paymentData);
    }

    await lesson.save();
    return lesson;
  }

  async updatePayment(
    lessonId: string,
    paymentId: string,
    dto: UpdatePaymentDto,
  ) {
    const lesson = await this.lessonModule.findById(lessonId);
    if (!lesson) {
      throw new HttpException('Заняття не знайдено', HttpStatus.NOT_FOUND);
    }
    const { isHappend, ...paymentData } = dto;

    if (isHappend !== undefined) {
      lesson.isHappend = isHappend;
    }

    const paymentIndex = lesson.sum.findIndex(
      (p) => p._id.toString() === paymentId,
    );
    if (paymentIndex === -1) {
      await lesson.save();
      throw new HttpException('Платіж не знайдено', HttpStatus.NOT_FOUND);
    }

    Object.assign(lesson.sum[paymentIndex], paymentData);
    await lesson.save();
    return lesson;
  }

  async deletePayment(lessonId: string, paymentId: string) {
    const lesson = await this.lessonModule.findById(lessonId);
    if (!lesson) {
      throw new HttpException('Заняття не знайдено', HttpStatus.NOT_FOUND);
    }

    const newPayments = lesson.sum.filter(
      (p) => p._id.toString() !== paymentId,
    );
    if (newPayments.length === lesson.sum.length) {
      throw new HttpException('Платіж не знайдено', HttpStatus.NOT_FOUND);
    }

    lesson.sum = newPayments;
    await lesson.save();
    return lesson;
  }
}
