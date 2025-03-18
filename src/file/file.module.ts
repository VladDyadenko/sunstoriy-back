import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ChildModule } from 'src/child/child.module';
import { ChildSchema } from 'src/child/child.models';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ChildModule,
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
