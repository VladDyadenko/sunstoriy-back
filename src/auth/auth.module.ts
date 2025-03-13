import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema, User, UserSchema } from 'src/users/user.models';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { config } from 'dotenv';
import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';

config();

@Module({
  controllers: [AuthController],
  providers: [AuthService, CloudinaryService, ...STRATEGIES, ...GUARDS],
  imports: [
    ConfigModule.forFeature(googleOauthConfig),
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    HttpModule,
    PassportModule,
    JwtModule.registerAsync(options()),
  ],
  exports: [AuthService],
})
export class AuthModule {}
