import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RolesModule } from './roles/roles.module';
import { config } from 'dotenv';
import { ChildModule } from './child/child.module';
import { FileModule } from './file/file.module';
import { TeacherModule } from './teacher/teacher.module';
import { LessonModule } from './lesson/lesson.module';
import { SmsModule } from './sms/sms.module';

config();

@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.DB_HOST}`),
    UsersModule,
    AuthModule,
    CloudinaryModule,
    RolesModule,
    ChildModule,
    FileModule,
    TeacherModule,
    LessonModule,
    SmsModule,
  ],
  controllers: [AuthController],
})
export class AppModule {}
