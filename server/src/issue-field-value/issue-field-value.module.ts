import { Module } from '@nestjs/common';
import { IssueFieldValueService } from './issue-field-value.service';
import { IssueFieldValueController } from './issue-field-value.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IssueFieldValue,
  IssueFieldValueOption,
} from './entities/issue-field-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IssueFieldValue, IssueFieldValueOption])],
  controllers: [IssueFieldValueController],
  providers: [IssueFieldValueService],
})
export class IssueFieldValueModule {}
