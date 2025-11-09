import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MembershipService } from '../membership/membership.service';

import { ProjectMembership } from '../membership/entity/project-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ProjectMembership])],
  providers: [UserService, MembershipService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
