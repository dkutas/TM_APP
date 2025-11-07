import { Module } from '@nestjs/common';
import { LinkTypeService } from './link-type.service';
import { LinkTypeController } from './link-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkType } from './entities/link-type.entity';
import { IssueLink } from './entities/issue-link.entity';
import { ChangeLogRepository } from '../repositories/change-log.repository';
import { Issue } from '../issue/entities/issue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LinkType, IssueLink, Issue])],
  controllers: [LinkTypeController],
  providers: [LinkTypeService, ChangeLogRepository],
})
export class LinkTypeModule {}
