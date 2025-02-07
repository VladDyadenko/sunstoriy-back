import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/roles/roles.guard';
import { ZvitService } from './zvit.service';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { CreateOneMonthTotalZvitDto } from './dto/create-oneMonse-zvit.dto';

@Controller('/zvit')
@UseGuards(RolesGuard)
export class ZvitController {
  constructor(private zvitService: ZvitService) {}

  @Get('/one_month_total')
  @Roles(Role.Admin)
  async createZvitOneMonthTotal(
    @Request() req,
    @Res() res,
    @Query() query: CreateOneMonthTotalZvitDto,
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
      //   console.log('query', query);

      const totalData = await this.zvitService.createZvitOneMonthTotal(query);

      //   console.log('totalIncome', totalIncome);

      return res.status(HttpStatus.OK).json({ totalData });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
