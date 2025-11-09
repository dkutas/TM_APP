import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { ProjectMembership } from '../membership/entity/project-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, ProjectMembership])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
