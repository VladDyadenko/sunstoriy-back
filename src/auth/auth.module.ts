import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { config } from 'dotenv';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.models';
import { AuthGuard } from './auth.guard';
config();

@Module({
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: `${process.env.PRIVATE_KEY}`,
      signOptions: {
        expiresIn: '24h',
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
