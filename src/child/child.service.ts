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
    folder: string,
    user: IUser,
  ) {
    const publicId = path.parse(childImagePreview.originalname).name;

    const childImage = (
      await this.cloudinaryService.uploadFile(
        childImagePreview,
        folder,
        publicId,
      )
    ).secure_url;

    const childUpload = {
      ...dto,
      childImage,
      owner: user._id,
    };

    const child = await this.childModule.create(childUpload);
    user = await this.userModule
      .findByIdAndUpdate(
        user._id,
        {
          $push: {
            children: child,
          },
        },
        { new: true },
      )
      .populate('children');

    return child;
  }
}
