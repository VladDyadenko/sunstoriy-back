import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonSchema } from './lesson.models';
import { ChildSchema } from 'src/child/child.models';
import { TeacherSchema } from 'src/teacher/teacher.models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
    MongooseModule.forFeature([{ name: 'Teacher', schema: TeacherSchema }]),
    MongooseModule.forFeature([{ name: 'Lesson', schema: LessonSchema }]),
  ],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
