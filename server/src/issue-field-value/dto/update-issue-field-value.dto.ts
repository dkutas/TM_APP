import { PartialType } from '@nestjs/mapped-types';
import { CreateIssueFieldValueDto } from './create-issue-field-value.dto';

export class UpdateIssueFieldValueDto extends PartialType(CreateIssueFieldValueDto) {}
