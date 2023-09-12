import { Injectable } from '@nestjs/common';
import { Child } from './child.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChild } from './interface/child.intarface';
import { CreateChildDto } from './dto/create-child.dto';
import * as path from 'path';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { IUser } from 'src/users/interface/users.interface';
import { User } from 'src/users/user.models';
import uploadChildFiles from './common/uploadFileFunction';

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
    const folder = childImagePreview[0].fieldname;
    const publicId = path.parse(childImagePreview[0].originalname).name;

    const childImage = (
      await this.cloudinaryService.uploadFile(
        childImagePreview[0],
        folder,
        publicId,
      )
    ).secure_url;

    const childFileUrls = await uploadChildFiles(childFiles);

    const childUpload = {
      ...dto,
      childImage,
      childFiles: childFileUrls,
      owner: user._id,
    };

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

  async getChildren() {
    const children = await this.childModule.find().exec();

    return children;
  }
}
