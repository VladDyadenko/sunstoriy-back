import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { config } from 'dotenv';
import { SendSmsDto } from './dto/create-sms.dto';
import { Lesson } from 'src/lesson/lesson.models';
import { Model } from 'mongoose';
import { ILesson } from 'src/lesson/interface/lesson.interface';
config();

@Injectable()
export class SmsService {
  private readonly smsClubUrl = 'https://im.smsclub.mobi/sms/send';
  private readonly isSendSms = 'https://im.smsclub.mobi/sms/status';

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Lesson.name) private lessonModule: Model<ILesson>,
  ) {}

  async sendSms(dto: SendSmsDto) {
    const { phone, message, src_addr, _id } = dto;
    const smsData = {
      phone: [phone],
      message: message,
      src_addr: src_addr,
    };

    const headers = {
      Authorization: `Bearer ${process.env.SMSCLUB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.smsClubUrl, smsData, { headers }),
      );
      const responseData = {
        status: '',
      };

      const responseSend = response.data?.success_request;
      const keysInfo = Object.keys(responseSend);
      const info = keysInfo[0];

      if (info === 'info') {
        const keys = Object.keys(responseSend.info);
        const firstKey = keys[0];

        const id = {
          id_sms: [`${firstKey}`],
        };

        const responseStatus = await firstValueFrom(
          this.httpService.post(this.isSendSms, id, { headers }),
        );

        const infoStatus = Object.keys(
          responseStatus.data?.success_request?.info,
        );
        const value = responseStatus.data?.success_request?.info[infoStatus[0]];

        if (value === 'ENROUTE' || value === 'DELIVRD') {
          await this.lessonModule.findByIdAndUpdate(
            _id,
            {
              isSendSms: true,
            },
            { new: true },
          );
        }
        responseData.status = value;
      } else if (info === 'add_info') {
        const keys: string[] = Object.values(responseSend.add_info);
        const value: string = keys[0];
        responseData.status = value;
      }

      return responseData;
    } catch (error) {
      throw error.response.data;
    }
  }
}
