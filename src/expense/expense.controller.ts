import {
  Body,
  Controller,
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
  constructor(private ExpenseService: ExpenseService) {}

  @Post()
  @Roles(Role.Admin)
  async create(
    @Request() req,
    @Res() res,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const expense = this.ExpenseService.createExpense(createExpenseDto);

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

      const expense = await this.ExpenseService.updateExpense(id, dto);

      return res.status(HttpStatus.CREATED).json(expense);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
