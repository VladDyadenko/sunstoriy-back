import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/roles/roles.guard';
import { SalaryService } from './salary.service';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { AddSalaryOrder } from './dto/add-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { GetSalaryByDateDto } from './dto/get-salary_date.dto';

@Controller('salary')
@UseGuards(RolesGuard)
export class SalaryController {
  constructor(private salaryService: SalaryService) {}

  @Post()
  @Roles(Role.Admin)
  async create(
    @Request() req,
    @Res() res,
    @Body() createLessonDto: AddSalaryOrder,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const salary = await this.salaryService.addSalaryOrder(createLessonDto);
      return res.status(HttpStatus.CREATED).json(salary);
    } catch (err) {
      console.error('Помилка при додаванні ЗП:', err);
    }
  }
  @Put(':id')
  @Roles(Role.Admin)
  async updatSalary(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
    @Body() dto: UpdateSalaryDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const salary = await this.salaryService.updateSalary(id, dto);
      return res.status(HttpStatus.CREATED).json(salary);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
  @Get('/salary/:id')
  @Roles(Role.Admin)
  async getSalaryById(@Request() req, @Param('id') id: string, @Res() res) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const salary = await this.salaryService.getSalaryById(id);

      if (!salary) {
        throw new NotFoundException('Таке нарахування не існує!');
      }

      return res.status(HttpStatus.CREATED).json(salary);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/salary_by_date')
  @Roles(Role.Admin)
  async getSalaryByDate(
    @Request() req,
    @Res() res,
    @Query() query: GetSalaryByDateDto,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      const { startDate, endDate } = query;
      if (!startDate || !endDate) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Виберіть дату або період!' });
      }

      const salary = await this.salaryService.getSalaryByDate(query);

      return res.status(HttpStatus.OK).json(salary);
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
  async deleteExpense(@Param('id') id: string, @Request() req, @Res() res) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const result = await this.salaryService.deleteSalaryById(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
