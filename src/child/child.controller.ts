import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/child')
export class ChildController {
  constructor(private childService: ChildService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'childImage', maxCount: 1 },
      {
        name: 'childFiles',
        maxCount: 20,
      },
    ]),
  )
  async create(
    @Request() req,
    @Res() res,
    @Body() createChildDto: CreateChildDto,
    @UploadedFiles()
    files?: {
      childImage?: Express.Multer.File;
      childFiles?: Express.Multer.File[];
    },
  ) {
    try {
      const user = req.user;
      const child = await this.childService.createChild(
        createChildDto,
        files.childImage,
        files.childFiles,
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
