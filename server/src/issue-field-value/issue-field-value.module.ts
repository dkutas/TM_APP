import { Module } from '@nestjs/common';
import { IssueFieldValueService } from './issue-field-value.service';
import { IssueFieldValueController } from './issue-field-value.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueFieldValue } from './entities/issue-field-value.entity';
import { IssueFieldValueOption } from './entities/issue-field-value-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IssueFieldValue, IssueFieldValueOption])],
  controllers: [IssueFieldValueController],
  providers: [IssueFieldValueService],
})
export class IssueFieldValueModule {}
