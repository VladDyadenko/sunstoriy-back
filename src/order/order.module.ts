import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildSchema } from 'src/child/child.models';
import { TeacherSchema } from 'src/teacher/teacher.models';
import { LessonSchema } from 'src/lesson/lesson.models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
    MongooseModule.forFeature([{ name: 'Teacher', schema: TeacherSchema }]),
    MongooseModule.forFeature([{ name: 'Lesson', schema: LessonSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
