import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonSchema } from './lesson.models';
import { ChildSchema } from 'src/child/child.models';
import { TeacherSchema } from 'src/teacher/teacher.models';
import { SalarySchema } from 'src/salary/salary.models';
import { SalaryModule } from 'src/salary/salary.module';
// import { UserExistsMiddleware } from 'src/middleware/auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
    MongooseModule.forFeature([{ name: 'Teacher', schema: TeacherSchema }]),
    MongooseModule.forFeature([{ name: 'Lesson', schema: LessonSchema }]),
    MongooseModule.forFeature([{ name: 'Salary', schema: SalarySchema }]),
    SalaryModule,
  ],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
