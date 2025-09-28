import { Module } from '@nestjs/common';
import { IssueTypeService } from './issue-type.service';
import { IssueTypeController } from './issue-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueType } from './entities/issue-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IssueType])],
  controllers: [IssueTypeController],
  providers: [IssueTypeService],
})
export class IssueTypeModule {}
