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
import { ExpenseModule } from './expense/expense.module';
import { ZvitModule } from './zvit/zvit.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    ExpenseModule,
    ZvitModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
