import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Put,
  UseInterceptors,
  UnauthorizedException,
  UploadedFiles,
  Request,
  Param,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { Express } from 'express';
import { CreateChildDto } from './dto/create-child.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateChildDto } from './dto/update-child.dto';

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
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const child = await this.childService.createChild(
        createChildDto,
        files.childImage,
        files.childFiles,
        user,
      );
      return res.status(HttpStatus.CREATED).json(child);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'childImage', maxCount: 1 },
      {
        name: 'childFiles',
        maxCount: 20,
      },
    ]),
  )
  async updateChild(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
    @Body() updateChildDto: UpdateChildDto,
    @UploadedFiles()
    files?: {
      childImage?: Express.Multer.File;
      childFiles?: Express.Multer.File[];
    },
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedChild = await this.childService.updateChild(
        id,
        updateChildDto,
        files.childImage,
        files.childFiles,
      );
      return res.status(HttpStatus.OK).json(updatedChild);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get()
  async getAll(@Request() req) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Неавторизований користувач',
      });
    }
    const children = await this.childService.getChildren();
    if (!children) {
      throw new NotFoundException('Children not found');
    }

    return children;
  }

  @Get(':id')
  async getChildById(@Request() req, @Param('id') id: string) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Неавторизований користувач',
      });
    }
    const child = await this.childService.getChildById(id);
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    return child;
  }

  @Patch('delete/:id')
  async deleteChild(@Param('id') id: string, @Request() req) {
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.childService.deleteChildById(id, user);
  }

  // @Get('file')
  // async getUploadFile(@Request() req, @Body() filePath: string) {
  //   const user = req.user;

  //   if (!user) {
  //     throw new UnauthorizedException({
  //       message: 'Неавторизований користувач',
  //     });
  //   }

  //   const fileData = await this.childService.getUploadFile(filePath);
  //   return fileData;
  // }
}
