import {
  Body,
  Patch,
  Param,
  Controller,
  Post,
  Res,
  Put,
  HttpStatus,
  Request,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import { UsersService } from './users.service';
import { UserResponse } from './responses/user.response';
import { CurrentUser } from '@common/decorators';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post()
  create(@Res() res, @Body() createUserDto: CreateUserDto) {
    try {
      const newUser = this.usersService.createUser(createUserDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'User has been created successfully',
        newUser,
      });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        error: 'Bad Request',
      });
    }
  }

  // @Public()
  // @Put('update')
  // async update(@Request() req) {
  //   const updatedUser = await this.usersService.update(req);

  //   if (updatedUser === null) {
  //     return { message: 'Nothing changed' };
  //   }

  //   return updatedUser;
  // }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return new UserResponse(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return new UserResponse(user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return await this.usersService.deleteUserById(id, user);
  }

  @Get()
  async getAll() {
    return await this.usersService.getUsers();
  }
}
