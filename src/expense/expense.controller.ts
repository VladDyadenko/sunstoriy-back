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
import { ExpenseService } from './expense.service';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetExpenseByDateDto } from './dto/get-expense-date.dto';

@Controller('expense')
@UseGuards(RolesGuard)
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  @Roles(Role.Admin)
  async createExpense(
    @Request() req,
    @Res() res,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const expense = await this.expenseService.createExpense(createExpenseDto);

      return res.status(HttpStatus.CREATED).json(expense);
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
  async updateExpense(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
    @Body() dto: UpdateExpenseDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const expense = await this.expenseService.updateExpense(id, dto);

      return res.status(HttpStatus.CREATED).json(expense);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get()
  @Roles(Role.Admin)
  async getAllExpenses(@Request() req, @Res() res) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const expenses = await this.expenseService.getExpenses();

      return res.status(HttpStatus.CREATED).json(expenses);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('expense/:id')
  @Roles(Role.Admin)
  async getExpenseById(@Request() req, @Param('id') id: string, @Res() res) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      const expense = await this.expenseService.getExpenseById(id);

      if (!expense) {
        throw new NotFoundException('Розход не існує!');
      }
      return res.status(HttpStatus.CREATED).json(expense);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/expenses_by_date')
  @Roles(Role.Admin)
  async getExpenseByDate(
    @Request() req,
    @Res() res,
    @Query() query: GetExpenseByDateDto,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      if (!query.startDate || !query.endDate) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Виберіть дату або період!' });
      }

      const expenses = await this.expenseService.getExpenseByDate(query);

      return res.status(HttpStatus.OK).json({ expenses });
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
      const result = await this.expenseService.deleteExpenseById(id);
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
