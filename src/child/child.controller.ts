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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { Express } from 'express';
import { CreateChildDto } from './dto/create-child.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateChildDto } from './dto/update-child.dto';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { Role } from 'src/roles/role.enum';
import { CurrentUser } from '@common/decorators';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

@Controller('/child')
@UseGuards(RolesGuard)
export class ChildController {
  constructor(private childService: ChildService) {}

  @Post()
  @Roles(Role.Admin)
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
  @Roles(Role.Admin)
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
  @Roles(Role.Admin, Role.Teacher)
  async getAll(@Request() req, @Res() res) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }

      const page = +req.query.page || 1;
      const query = {};

      const data = await this.childService.getChildren(page, query);
      if (!data) {
        throw new NotFoundException('Children not found');
      }

      return res.status(HttpStatus.OK).json(data);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('children/:id')
  @Roles(Role.Admin, Role.Teacher)
  async getChildById(@Request() req, @Param('id') id: string, @Res() res) {
    try {
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
      return res.status(HttpStatus.OK).json(child);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Get('/search')
  @Roles(Role.Admin, Role.Teacher)
  async getChildByName(
    @Query('query') query: string,
    @Request() req,
    @Res() res,
  ) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException({
          message: 'Неавторизований користувач',
        });
      }
      if (!query || query.length < 1) {
        throw new NotFoundException('Invalid query');
      }

      const letters = query.split('');
      let results = [];
      let partialQuery = '';
      let pagination = {};

      for (let i = 0; i < letters.length; i++) {
        partialQuery += letters[i];

        const data = await this.childService.getChildrenByPartialName([
          partialQuery,
        ]);

        if (data.child.length > 0) {
          results.push(data.child);
          pagination = data.pagination;
        } else {
          results = [];
          pagination = {};
        }
      }

      const children = results.length > 0 ? results[results.length - 1] : [];

      return res.status(HttpStatus.OK).json({
        pagination,
        children,
      });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  @Patch('delete/:id')
  @Roles(Role.Admin)
  async deleteChild(@Param('id') id: string, @Request() req, @Res() res) {
    try {
      const user = req.user;

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const result = await this.childService.deleteChildById(id, user);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 401,
        message: err.message,
        error: 'Bad Request',
      });
    }
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
