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

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
    @InjectModel(Child.name) private childModule: Model<IChild>,
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
  ) {}

  async createLesson(dto: CreateLessonDto) {
    const queryLessonOffice = {
      dateLesson: dto.dateLesson,
      timeLesson: dto.timeLesson,
      office: dto.office,
    };
    const checkLesson = await this.lessonModule.find(queryLessonOffice);
    if (checkLesson.length > 0) {
      throw new HttpException(
        'Кабінет на цей час вже зайнятий',
        HttpStatus.BAD_REQUEST,
      );
    }
    const queryLessonTeacher = {
      dateLesson: dto.dateLesson,
      timeLesson: dto.timeLesson,
      teacher: dto.teacher,
    };
    const checkTeacher = await this.lessonModule.find(queryLessonTeacher);

    if (checkTeacher.length > 0) {
      throw new HttpException(
        'Фахівець на цей час вже зайнятий',
        HttpStatus.BAD_REQUEST,
      );
    }

    const lesson = await this.lessonModule.create(dto);
    return lesson;
  }

  async getLessons() {
    const lessons = await this.lessonModule.find().exec();
    return lessons;
  }
}
