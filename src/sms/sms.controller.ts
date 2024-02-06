import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/create-sms.dto';

@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}
  @Post('/send')
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
