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

      const lesson = await this.lessonService.createLesson(createLessonDto);
      return res.status(HttpStatus.CREATED).json(lesson);
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

      const lessonData = await this.lessonService.getLessonById(id);

      if (!lessonData) {
        throw new NotFoundException('Заняття не існує!');
      }

      return res.status(HttpStatus.CREATED).json(lessonData);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
  @Get('/lesson/office/office_date')
  async getLessonByOfice(
    @Request() req,
    @Res() res,
    @Body() dto: GetLessonByOfficeAndDateDto,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      const lesson = await this.lessonService.getLessonByOfficeAndDate(dto);

      if (!lesson.length) {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'Заняття не заплановані!' });
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
}
