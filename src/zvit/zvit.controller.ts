import {
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { CreateChildPerioZvitDto } from './dto/create-children-period.dto';

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

      const totalData = await this.zvitService.createZviForSelectedPeriod(
        query,
      );
      return res.status(HttpStatus.OK).json({ totalData });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/childrens_period')
  @Roles(Role.Admin)
  async createReportChildrens(
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

      const totalData = await this.zvitService.createReportChildrens(query);
      return res.status(HttpStatus.OK).json({ totalData });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/children_period/:id')
  @Roles(Role.Admin)
  async createReportChildFromPeriod(
    @Request() req,
    @Res() res,
    @Param('id') id: string,
    @Query() dto: CreateChildPerioZvitDto,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      if (!dto.startDate || !dto.endDate) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Виберіть дату або період!' });
      }

      const totalData = await this.zvitService.getChildDetailReport(id, dto);

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
