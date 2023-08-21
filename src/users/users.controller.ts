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
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import { UsersService } from './users.service';
import { Public } from 'src/auth/public.decorator';

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

  @Public()
  @Put('update')
  async update(@Request() req) {
    const updatedUser = await this.usersService.update(req);

    if (updatedUser === null) {
      return { message: 'Nothing changed' };
    }

    return updatedUser;
  }

  @Get()
  async getAll() {
    return await this.usersService.getUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Patch('update/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUserById(id);
  }
}
