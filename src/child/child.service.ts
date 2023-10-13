import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Child } from './child.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Express } from 'express';
import { IChild } from './interface/child.intarface';
import { CreateChildDto } from './dto/create-child.dto';
import * as path from 'path';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { IUser } from 'src/users/interface/users.interface';
import { User } from 'src/users/user.models';
import uploadChildFiles from './common/uploadFileFunction';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildService {
  constructor(
    @InjectModel(Child.name) private childModule: Model<IChild>,
    private cloudinaryService: CloudinaryService,
    @InjectModel(User.name) private userModule: Model<IUser>,
  ) {}

  async createChild(
    dto: CreateChildDto,
    childImagePreview: Express.Multer.File,
    childFiles: Express.Multer.File[],
    user: IUser,
  ) {
    const query = {
      surname: dto.surname,
      name: dto.name,
    };

    const candidate = await this.childModule.find(query);
    if (candidate.length > 0) {
      throw new HttpException(
        'Дитина з такою фамілією вже існує',
        HttpStatus.BAD_REQUEST,
      );
    }
    const childUpload: Partial<CreateChildDto> = { ...dto, owner: user._id };

    if (childImagePreview) {
      const folder = childImagePreview[0].fieldname;
      const publicId = path.parse(childImagePreview[0].originalname).name;

      const childImage = (
        await this.cloudinaryService.uploadFile(
          childImagePreview[0],
          folder,
          publicId,
        )
      ).secure_url;
      childUpload.childImage = childImage;
    }

    if (childFiles && childFiles.length > 0) {
      const childFileUrls = await uploadChildFiles(childFiles);
      childUpload.childFiles = childFileUrls;
    }

    const child = await this.childModule.create(childUpload);

    user = await this.userModule.findByIdAndUpdate(
      user._id,
      {
        $push: {
          children: child._id,
        },
      },
      { new: true },
    );

    return child;
  }

  async updateChild(
    _id: string,
    dto: UpdateChildDto,
    childImagePreview: Express.Multer.File,
    childFiles: Express.Multer.File[],
  ) {
    const childUpload: Partial<UpdateChildDto> = { ...dto };

    if (childImagePreview) {
      const folder = childImagePreview[0].fieldname;
      const publicId = path.parse(childImagePreview[0].originalname).name;

      const childImage = (
        await this.cloudinaryService.uploadFile(
          childImagePreview[0],
          folder,
          publicId,
        )
      ).secure_url;

      childUpload.childImage = childImage;
    }

    if (childFiles && childFiles.length > 0) {
      const currentChild = await this.childModule.findById(_id);
      if (!currentChild) {
        throw new Error('Child not found');
      }

      const currentChildFiles = currentChild.childFiles || [];
      const newChildFileUrls = await uploadChildFiles(childFiles);
      childUpload.childFiles = [...currentChildFiles, ...newChildFileUrls];
    }

    const updatedChild = await this.childModule.findByIdAndUpdate(
      _id,
      childUpload,
      { new: true },
    );
    if (!updatedChild) {
      throw new Error('Child not found');
    }
    return updatedChild;
  }

  async getChildren() {
    const children = await this.childModule.find().exec();

    return children;
  }

  async getChildById(id: string) {
    const child = await this.childModule.findById({
      _id: id,
    });
    return child;
  }
  async deleteChildById(id: string, user: IUser) {
    await this.childModule.deleteOne({ _id: id });
    await this.userModule.findByIdAndUpdate(
      user._id,
      {
        $pull: {
          children: id,
        },
      },
      { new: true },
    );

    return `Successful delete`;
  }
  // async getUploadFile(filePath: string) {
  //   const fileData = await readUploadedFile(filePath);
  //   if (!fileData) {
  //     throw new Error('File not found!');
  //   }

  //   return fileData;
  // }
}
