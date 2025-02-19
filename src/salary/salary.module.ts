import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SalarySchema } from './salary.models';
import { TeacherSchema } from 'src/teacher/teacher.models';
// import { UserExistsMiddleware } from 'src/middleware/auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Salary', schema: SalarySchema }]),
    MongooseModule.forFeature([{ name: 'Teacher', schema: TeacherSchema }]),
  ],
  providers: [SalaryService],
  controllers: [SalaryController],
  exports: [SalaryService],
})
export class SalaryModule {}
