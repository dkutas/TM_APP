import { Module } from '@nestjs/common';
import { LinkTypeService } from './link-type.service';
import { LinkTypeController } from './link-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkType } from './entities/link-type.entity';
import { IssueLink } from './entities/issue-link.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LinkType, IssueLink])],
  controllers: [LinkTypeController],
  providers: [LinkTypeService],
})
export class LinkTypeModule {}
