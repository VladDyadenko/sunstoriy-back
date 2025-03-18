import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child } from '../child/child.models';
import { Storage } from '@google-cloud/storage';
import { CreateFileDto } from './dto/create-file.dto';
import { IChild } from 'src/child/interface/child.intarface';
import { join } from 'path';

@Injectable()
export class FileService {
  private storage: Storage;
  private bucket: string = process.env.BUCKET_NAME;

  constructor(@InjectModel(Child.name) private childModule: Model<IChild>) {
    this.storage = new Storage({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      projectId: process.env.PROJECT_ID,
    });
  }

  async downloadFile(filename: string) {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const file = bucket.file(filename);
      const [exists] = await file.exists();

      if (!exists) {
        throw new NotFoundException('Файл не знайдено');
      }

      return file.createReadStream();
    } catch (error) {
      throw new NotFoundException('Файл не знайдено');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    childId: string,
  ): Promise<CreateFileDto> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const blob = bucket.file(file.originalname);

      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => reject(error));
        blobStream.on('finish', async () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket}/${blob.name}`;

          await this.childModule.findByIdAndUpdate(
            { _id: childId },
            { $push: { childFiles: file.originalname } },
            { new: true },
          );

          resolve({
            filename: file.originalname,
            path: publicUrl,
            mimetype: file.mimetype,
          });
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      throw new Error('Помилка при завантаженні файлу');
    }
  }

  async deleteFile(filename: string, childId: string): Promise<IChild> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const file = bucket.file(filename);
      const [exists] = await file.exists();

      if (!exists) {
        throw new NotFoundException('Файл не знайдено');
      }

      await file.delete();

      const updatedChild = await this.childModule.findByIdAndUpdate(
        { _id: childId },
        { $pull: { childFiles: filename } },
        { new: true },
      );

      if (!updatedChild) {
        throw new NotFoundException('Дитину не знайдено');
      }

      return updatedChild;
    } catch (error) {
      throw new NotFoundException(
        'Файл не знайдено або не може бути видалений',
      );
    }
  }
}
