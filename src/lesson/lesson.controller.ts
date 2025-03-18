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
  Put,
  Patch,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonByOfficeAndDateDto } from './dto/get-lesson-office.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { LessonByOfficeDateTeacherDto } from './dto/get-lesson-date-teacher.dto';

@Controller('/lesson')
@UseGuards(RolesGuard)
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @Post(':lessonId/payment')
  @Roles(Role.Admin, Role.Teacher)
  async addPayment(
    @Param('lessonId') lessonId: string,
    @Body() dto: AddPaymentDto,
    @Res() res,
  ) {
    try {
      const lesson = await this.lessonService.addPayment(lessonId, dto);
      return res.status(HttpStatus.CREATED).json(lesson);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Patch(':lessonId/payment/:paymentId')
  @Roles(Role.Admin, Role.Teacher)
  async updatePayment(
    @Param('lessonId') lessonId: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: UpdatePaymentDto,
    @Res() res,
  ) {
    try {
      const lesson = await this.lessonService.updatePayment(
        lessonId,
        paymentId,
        dto,
      );
      return res.status(HttpStatus.OK).json(lesson);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Delete(':lessonId/payment/:paymentId')
  @Roles(Role.Admin, Role.Teacher)
  async deletePayment(
    @Param('lessonId') lessonId: string,
    @Param('paymentId') paymentId: string,
    @Res() res,
  ) {
    try {
      const lesson = await this.lessonService.deletePayment(
        lessonId,
        paymentId,
      );
      return res.status(HttpStatus.OK).json(lesson);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Post()
  @Roles(Role.Admin, Role.Teacher)
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

  @Put(':id')
  @Roles(Role.Admin, Role.Teacher)
  async updateLesson(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
    @Body() dto: UpdateLessonDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const lesson = await this.lessonService.updateLesson(id, dto);

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
  @Roles(Role.Admin, Role.Teacher)
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
  @Roles(Role.Admin, Role.Teacher)
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

  @Post('/office_date_teachers')
  @Roles(Role.Admin, Role.Teacher)
  async getLessonByOfficeAndDateTeachers(
    @Request() req,
    @Res() res,
    @Body() dto: LessonByOfficeDateTeacherDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      if (!dto.dateCurrentLesson) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Виберіть дату або період!' });
      }

      const result = await this.lessonService.getLessonByOfficeAndDateTeachers(
        dto,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      console.error('Error processing request:', err);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/office/office_date')
  @Roles(Role.Admin, Role.Teacher)
  async getLessonByOffice(
    @Request() req,
    @Res() res,
    @Query('offices') offices: string[],
    @Query('dateCurrentLesson') dateCurrentLesson: string[],
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      if (!dateCurrentLesson) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Виберіть дату або період!' });
      }

      let lessons = [];
      if (typeof dateCurrentLesson === 'string') {
        const dateLesson = parseInt(dateCurrentLesson, 10);
        lessons = await Promise.all(
          offices.map((office: string) =>
            this.lessonService.getLessonByOfficeAndDate({
              offices: office,
              dateCurrentLesson: dateLesson,
            }),
          ),
        );
      } else if (Array.isArray(dateCurrentLesson)) {
        const results = await Promise.all(
          dateCurrentLesson.map(async (date: string) => {
            const dateLesson = parseInt(date, 10);
            const officeLessons = await Promise.all(
              offices.map((office: string) =>
                this.lessonService.getLessonByOfficeAndDate({
                  offices: office,
                  dateCurrentLesson: dateLesson,
                }),
              ),
            );
            return officeLessons.filter((result) => result.length > 0);
          }),
        );
        lessons = results.flat();
      }

      lessons = lessons.flat().sort((a, b) => {
        if (a?.timeLesson?.[0] && b?.timeLesson?.[0]) {
          return (
            new Date(a.timeLesson[0]).getTime() -
            new Date(b.timeLesson[0]).getTime()
          );
        }
        return 0;
      });

      return res.status(HttpStatus.OK).json(lessons);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Patch('delete/:id')
  @Roles(Role.Admin)
  async deleteLesson(@Param('id') id: string, @Request() req, @Res() res) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const result = await this.lessonService.deleteLessonById(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 401,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
