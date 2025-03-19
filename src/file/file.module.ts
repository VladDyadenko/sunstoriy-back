import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ChildModule } from 'src/child/child.module';
import { ChildSchema } from 'src/child/child.models';

@Module({
  imports: [
    ChildModule,
    MongooseModule.forFeature([{ name: 'Child', schema: ChildSchema }]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
