import { Module } from '@nestjs/common';
import { ZvitService } from './zvit.service';
import { ZvitController } from './zvit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildSchema } from 'src/child/child.models';
import { TeacherSchema } from 'src/teacher/teacher.models';
import { LessonSchema } from 'src/lesson/lesson.models';
import { ExpenseSchema } from 'src/expense/expense.models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
    MongooseModule.forFeature([{ name: 'Teacher', schema: TeacherSchema }]),
    MongooseModule.forFeature([{ name: 'Lesson', schema: LessonSchema }]),
    MongooseModule.forFeature([{ name: 'Expense', schema: ExpenseSchema }]),
  ],
  providers: [ZvitService],
  controllers: [ZvitController],
})
export class ZvitModule {}
