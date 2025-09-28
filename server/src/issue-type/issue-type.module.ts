import { Module } from '@nestjs/common';
import { IssueTypeService } from './issue-type.service';
import { IssueTypeController } from './issue-type.controller';

@Module({
  controllers: [IssueTypeController],
  providers: [IssueTypeService],
})
export class IssueTypeModule {}
