import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/create-sms.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@Controller('sms')
@UseGuards(RolesGuard)
export class SmsController {
  constructor(private smsService: SmsService) {}
  @Post('/send')
  @Roles(Role.Admin)
  async createSms(@Res() res, @Request() req, @Body() dto: SendSmsDto) {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const newSms = await this.smsService.sendSms(dto);
      return res.status(HttpStatus.CREATED).json(newSms);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
