import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildSchema } from './child.models';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserSchema } from 'src/users/user.models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [ChildService, CloudinaryService],
  controllers: [ChildController],
})
export class ChildModule {}
