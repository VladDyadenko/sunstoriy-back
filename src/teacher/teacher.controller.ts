import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  Body,
  NotFoundException,
  HttpStatus,
  Put,
  Param,
  UnauthorizedException,
  Get,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@Controller('/teacher')
@UseGuards(RolesGuard)
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Post()
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('teacherImage'))
  async create(
    @Request() req,
    @Res() res,
    @Body() createTeacherDto: CreateTeacherDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const teacher = await this.teacherService.createTeacher(
        createTeacherDto,
        file,
      );
      return res.status(HttpStatus.CREATED).json(teacher);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Put(':id')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('teacherImage'))
  async updateTeacher(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updateTeacher = await this.teacherService.updateTeacher(
        id,
        updateTeacherDto,
        file,
      );
      return res.status(HttpStatus.OK).json(updateTeacher);
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
    const teachers = await this.teacherService.getTeachers();
    if (!teachers) {
      throw new NotFoundException('Teacher not found');
    }

    return teachers;
  }

  @Get('teacher/:id')
  @Roles(Role.Admin, Role.Teacher, Role.User)
  async getTeacherById(@Request() req, @Param('id') id: string) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Неавторизований користувач',
      });
    }
    const teacher = await this.teacherService.getTeacherById(id);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  @Get('/search')
  @Roles(Role.Admin, Role.Teacher, Role.User)
  async getTeacherByName(
    @Query('query') query: string,
    @Request() req,
    @Res() res,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      if (!query || query.length < 1) {
        throw new NotFoundException('Invalid query');
      }

      const letters = query.split('');
      let results = [];
      let partialQuery = '';

      for (let i = 0; i < letters.length; i++) {
        partialQuery += letters[i];

        const data = await this.teacherService.getTeacherByPartialName([
          partialQuery,
        ]);

        if (data.teacher.length > 0) {
          results.push(data.teacher);
        } else {
          results = [];
        }
      }

      const teacher = results.length > 0 ? results[results.length - 1] : [];

      return res.status(HttpStatus.OK).json({
        teacher,
      });
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
  async deleteChild(@Param('id') id: string, @Request() req) {
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.teacherService.deleteTeacherById(id);
  }
}
