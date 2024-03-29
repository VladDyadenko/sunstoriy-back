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

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
    @InjectModel(Child.name) private childModule: Model<IChild>,
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
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
    const lesson = await this.lessonModule.findOneAndUpdate({ _id }, dto, {
      new: true,
      lean: true,
    });
    if (!lesson) {
      throw new Error('Заняття не знайдено');
    }

    lesson.childSurname = dto.childSurname || '';
    lesson.plan = dto.plan || '';
    lesson.review = dto.review || '';
    lesson.teacherSurname = dto.teacherSurname || '';
    lesson.mather = dto.mather || '';
    lesson.matherPhone = dto.matherPhone || '';

    await this.lessonModule.findByIdAndUpdate(_id, lesson);
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
