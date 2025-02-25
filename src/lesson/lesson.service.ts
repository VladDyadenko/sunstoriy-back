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
import { AddSalaryOrder } from 'src/salary/dto/add-salary.dto';

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
    const isOnlySum =
      Object.keys(dto).length === 3 &&
      'sum' in dto &&
      'bank' in dto &&
      'paymentForm' in dto;

    if (!isOnlySum) {
      const availability = await checkLessonAvailability(
        this.lessonModule,
        dto,
        _id,
      );

      if (!availability.isAvailable) {
        throw new HttpException(availability.message, HttpStatus.BAD_REQUEST);
      }
    }

    // Отримуємо поточний урок перед оновленням
    const existingLesson = await this.lessonModule.findById(_id);
    if (!existingLesson) {
      throw new Error('Заняття не знайдено');
    }

    if ('sum' in dto) {
      const currentSum = existingLesson.sum || 0;
      if (currentSum !== 0) {
        dto.sum = currentSum + dto.sum;
      }
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

    const { child, teacher } = lesson;

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
    return `Successful delete`;
  }
}
