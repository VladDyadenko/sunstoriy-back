import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RolesModule } from './roles/roles.module';
import { config } from 'dotenv';
config();

@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.DB_HOST}`),
    UsersModule,
    AuthModule,
    CloudinaryModule,
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AppModule {}
