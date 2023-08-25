import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from './roles.models';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }])],
})
export class RolesModule {}
