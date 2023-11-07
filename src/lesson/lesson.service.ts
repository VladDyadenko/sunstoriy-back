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

  async getLessons() {
    const lessons = await this.lessonModule.find().exec();
    return lessons;
  }

  async getLessonById(id: string) {
    const lesson = await this.lessonModule.findById({ _id: id });
    return lesson;
  }

  async getLessonByOfficeAndDate(dto: GetLessonByOfficeAndDateDto) {
    const numericDate = dto.dateLesson;
    const dateObject = new Date(numericDate);
    const formattedDate = dateObject.toISOString();

    const lessons = await this.lessonModule
      .find(
        {
          $and: [{ office: dto.offices }, { dateLesson: formattedDate }],
        },
        { createdAt: 0, updatedAt: 0 },
      )
      .sort({ timeLesson: 1 });
    return lessons;
  }
}
