import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { config } from 'dotenv';
import { SendSmsDto } from './dto/create-sms.dto';
config();

@Injectable()
export class SmsService {
  private readonly smsClubUrl = 'https://im.smsclub.mobi/sms/send';

  constructor(private readonly httpService: HttpService) {}

  async sendSms(dto: SendSmsDto) {
    const smsData = {
      phone: [dto.phone],
      message: dto.message,
      src_addr: dto.src_addr,
    };
    console.log(smsData);
    const headers = {
      Authorization: `Bearer ${process.env.SMSCLUB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.smsClubUrl, smsData, { headers }),
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}
