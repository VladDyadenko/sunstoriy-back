import {
  Body,
  Controller,
  Post,
  Res,
  Request,
  NotFoundException,
  HttpStatus,
  Get,
  UnauthorizedException,
  Param,
  Query,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonByOfficeAndDateDto } from './dto/get-lesson-office.dto';

@Controller('/lesson')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @Post()
  async create(
    @Request() req,
    @Res() res,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      let lessons = [];

      if (typeof createLessonDto.dateLesson === 'number') {
        const lesson = await this.lessonService.createLesson(createLessonDto);
        lessons.push(lesson);
      } else if (Array.isArray(createLessonDto.dateLesson)) {
        lessons = await Promise.all(
          createLessonDto.dateLesson.map((date) => {
            const lessonDto = { ...createLessonDto, dateLesson: date };
            return this.lessonService.createLesson(lessonDto);
          }),
        );
      }
      return res.status(HttpStatus.CREATED).json(lessons);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get()
  async getAll(@Request() req) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Неавторизований користувач',
      });
    }
    const lessons = await this.lessonService.getLessons();
    if (!lessons) {
      throw new NotFoundException('Teacher not found');
    }

    return lessons;
  }
  @Get('/lesson/:id')
  async getLessonById(@Request() req, @Param('id') id: string, @Res() res) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      const lesson = await this.lessonService.getLessonById(id);

      if (!lesson) {
        throw new NotFoundException('Заняття не існує!');
      }

      return res.status(HttpStatus.CREATED).json(lesson);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/office/office_date')
  async getLessonByOffice(
    @Request() req,
    @Res() res,
    @Query() query: GetLessonByOfficeAndDateDto,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      let lessons = [];

      if (typeof query.dateLesson === 'string') {
        query.dateLesson = parseInt(query.dateLesson, 10);
        lessons = await Promise.all(
          query.offices.map((office: string) => {
            return this.lessonService.getLessonByOfficeAndDate({
              ...query,
              offices: office,
            });
          }),
        );
      } else if (Array.isArray(query.dateLesson)) {
        lessons = await Promise.all(
          query.offices.map((office: string) => {
            return Promise.all(
              query.dateLesson.map((date: string) => {
                return this.lessonService.getLessonByOfficeAndDate({
                  offices: office,
                  dateLesson: parseInt(date, 10),
                });
              }),
            ).then((resultArray) => {
              return resultArray.filter((result) => result.length > 0);
            });
          }),
        );
      }

      const isNotEmpty = lessons.some((lessonArray) => lessonArray.length > 0);

      if (!isNotEmpty) {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'Заняття не заплановані!' });
      }

      return res.status(HttpStatus.CREATED).json(lessons.flat());
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
