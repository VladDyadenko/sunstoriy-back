import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonSchema } from 'src/lesson/lesson.models';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([{ name: 'Lesson', schema: LessonSchema }]),
  ],
  providers: [SmsService],
  controllers: [SmsController],
})
export class SmsModule {}
