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
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetLessonByOfficeAndDateDto } from './dto/get-lesson-office.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@Controller('/lesson')
@UseGuards(RolesGuard)
export class LessonController {
  constructor(private lessonService: LessonService) {}

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
  @Roles(Role.Admin, Role.Teacher, Role.User)
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
  @Roles(Role.Admin, Role.Teacher, Role.User)
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
  @Roles(Role.Admin, Role.Teacher, Role.User)
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
      if (!query.dateCurrentLesson) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Виберіть дату або період!' });
      }

      let lessons = [];

      if (typeof query.dateCurrentLesson === 'string') {
        query.dateCurrentLesson = parseInt(query.dateCurrentLesson, 10);
        lessons = await Promise.all(
          query.offices.map(async (office: string) => {
            return await this.lessonService.getLessonByOfficeAndDate({
              ...query,
              offices: office,
            });
          }),
        );
      } else if (Array.isArray(query.dateCurrentLesson)) {
        lessons = await Promise.all(
          query.dateCurrentLesson.map(async (date: string) => {
            return await Promise.all(
              query.offices.map(async (office: string) => {
                return await this.lessonService.getLessonByOfficeAndDate({
                  offices: office,
                  dateCurrentLesson: parseInt(date, 10),
                });
              }),
            ).then((resultArray) => {
              const lessons = resultArray.filter((result) => result.length > 0);
              return lessons;
            });
          }),
        );
      }

      // const isNotEmpty = lessons.some((lessonArray) => lessonArray.length > 0);

      // if (!isNotEmpty) {
      //   return res
      //     .status(HttpStatus.NOT_FOUND)
      //     .json({ message: 'Заняття на цей день не заплановані!' });
      // }

      function flattenDeep(arr: string[]): string[] {
        return arr.reduce(
          (acc, val) =>
            Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
          [],
        );
      }

      lessons = flattenDeep(lessons);

      lessons = lessons.sort((a, b) => {
        if (a && b) {
          const dateA = new Date(a.timeLesson[0]).getTime();
          const dateB = new Date(b.timeLesson[0]).getTime();
          return dateA - dateB;
        } else {
          return 0;
        }
      });

      return res.status(HttpStatus.CREATED).json(lessons.flat());
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
