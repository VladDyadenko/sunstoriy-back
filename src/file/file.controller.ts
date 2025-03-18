import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { IChild } from 'src/child/interface/child.intarface';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { memoryStorage } from 'multer';

@Controller('child/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':filename')
  @Roles(Role.Admin)
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const file = await this.fileService.downloadFile(filename);
    file.pipe(res);
  }

  @Post('upload/:childId')
  @Roles(Role.Admin)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        // Декодируем имя файла
        file.originalname = Buffer.from(file.originalname, 'binary').toString(
          'utf8',
        );

        if (!file.originalname.match(/\.(docx|pdf)$/)) {
          return cb(
            new BadRequestException(
              'Тільки файли формату .docx та .pdf дозволені',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('childId') childId: string,
  ): Promise<CreateFileDto> {
    return this.fileService.uploadFile(file, childId);
  }

  @Delete(':filename/:childId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Param('filename') filename: string,
    @Param('childId') childId: string,
  ): Promise<IChild> {
    return await this.fileService.deleteFile(filename, childId);
  }
}
