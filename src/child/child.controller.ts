import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Request,
} from '@nestjs/common';

import { ChildService } from './child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/child')
export class ChildController {
  constructor(private childService: ChildService) {}

  @Post()
  @UseInterceptors(FileInterceptor('childImage'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
    @Res() res,
    @Body() createChildDto: CreateChildDto,
  ) {
    try {
      const user = req.user;
      const folder: string = file.fieldname;
      const child = await this.childService.createChild(
        createChildDto,
        file,
        folder,
        user,
      );
      return res.status(HttpStatus.CREATED).json({
        message: 'Child has been created successfully',
        child: child,
      });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }
}
