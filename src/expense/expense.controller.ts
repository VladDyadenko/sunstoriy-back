import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/roles/roles.guard';
import { ExpenseService } from './expense.service';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

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

  @Put('_id')
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
}
