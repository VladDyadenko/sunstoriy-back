import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Model } from 'mongoose';
import { Teacher } from './teacher.models';
import { ITeacher } from './interface/teacher.interface';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModule: Model<ITeacher>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createTeacher(
    dto: CreateTeacherDto,
    teacherImagePreview: Express.Multer.File,
  ) {
    // const query = {
    //   surname: dto.surname,
    // };

    // const candidate = await this.teacherModule.find(query);
    // if (candidate.length > 0) {
    //   throw new HttpException(
    //     "Фахівець з таким ім'ям або фамілією вже існує",
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    const teacherUpload: Partial<CreateTeacherDto> = { ...dto };
    teacherUpload.specialization = dto.specialization.split(',');

    if (teacherImagePreview) {
      const folder = teacherImagePreview.fieldname;
      const publicId = path.parse(teacherImagePreview.originalname).name;

      const teacherImage = (
        await this.cloudinaryService.uploadFile(
          teacherImagePreview,
          folder,
          publicId,
        )
      ).secure_url;
      teacherUpload.teacherImage = teacherImage;
    }

    const teacher = await this.teacherModule.create(teacherUpload);

    return teacher;
  }

  async updateTeacher(
    _id: string,
    dto: UpdateTeacherDto,
    teacherImagePreview: Express.Multer.File,
  ) {
    const teacherUpload: Partial<UpdateTeacherDto> = { ...dto };
    teacherUpload.specialization = dto.specialization.split(',');

    if (teacherImagePreview) {
      const folder = teacherImagePreview.fieldname;
      const publicId = path.parse(teacherImagePreview.originalname).name;

      const teacherImage = (
        await this.cloudinaryService.uploadFile(
          teacherImagePreview,
          folder,
          publicId,
        )
      ).secure_url;
      teacherUpload.teacherImage = teacherImage;
    }
    const updateTeacher = await this.teacherModule.findByIdAndUpdate(
      _id,
      teacherUpload,
      { new: true },
    );
    if (!updateTeacher) {
      throw new Error('Teacher not found');
    }

    return updateTeacher;
  }

  async getTeacherByPartialName(letters: string[]) {
    const collation = {
      locale: 'uk',
      caseLevel: true,
    };

    const regexArray = letters.map((letter) => new RegExp(`^${letter}`, 'i'));

    const teacher = await this.teacherModule
      .find({ name: { $in: regexArray } }, { name: 1, surname: 1, color: 1 })
      .collation(collation)
      .sort({ name: 1 });

    return {
      teacher,
    };
  }

  async getTeachers() {
    const teachers = await this.teacherModule.find().exec();
    return teachers;
  }

  async getTeacherById(id: string) {
    const teacher = await this.teacherModule.findById({ _id: id });
    return teacher;
  }

  async deleteTeacherById(id: string) {
    await this.teacherModule.deleteOne({ _id: id });

    return `Successful delete`;
  }
}
