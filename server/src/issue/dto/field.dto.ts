import { User } from '../../user/entities/user.entity';
import { Issue } from '../entities/issue.entity';
import { DataType } from '../../common/enums';

import { WorkflowStatus } from '../../workflow/entities/workflow-status.entity';

export class FieldOptionDto {
  id: string;
  key: string;
  value: string;
}

export interface FieldDtoBase {
  id: string;
  key: string;
  name: string;
  required: boolean;
  options?: FieldOptionDto[] | null;
}

export type FieldDto =
  | (FieldDtoBase & { dataType: DataType.TEXT; value: string | null })
  | (FieldDtoBase & { dataType: DataType.NUMBER; value: number | null })
  | (FieldDtoBase & { dataType: DataType.BOOL; value: boolean | null })
  | (FieldDtoBase & { dataType: DataType.DATE; value: string | null })
  | (FieldDtoBase & { dataType: DataType.DATETIME; value: string | null })
  | (FieldDtoBase & { dataType: DataType.USER; value: string | null })
  | (FieldDtoBase & { dataType: DataType.OPTION; value: string | null })
  | (FieldDtoBase & { dataType: DataType.MULTI_OPTION; value: string[] });

export type FieldDefsDTO =
  | (FieldDtoBase & { dataType: DataType.TEXT })
  | (FieldDtoBase & { dataType: DataType.NUMBER })
  | (FieldDtoBase & { dataType: DataType.BOOL })
  | (FieldDtoBase & { dataType: DataType.DATE })
  | (FieldDtoBase & { dataType: DataType.DATETIME })
  | (FieldDtoBase & { dataType: DataType.USER })
  | (FieldDtoBase & { dataType: DataType.OPTION })
  | (FieldDtoBase & { dataType: DataType.MULTI_OPTION });

export interface IssueWithFieldsDto extends Issue {
  id: string;
  key: string;
  summary: string;
  links: IssueLinkDto[] | null;
  comments: IssueCommentDto[] | null;
  attachments: IssueAttachmentDto[] | null;
  history: IssueHistoryItemDto[] | null;
  fields: FieldDto[];
}

export interface IssueLinkDto {
  id: string;
  linkType: { id: string; name: string; inward: string; outward: string };
  direction: 'OUT' | 'IN';
  otherIssue: {
    id: string;
    key: string;
    summary: string;
    status: { id: string; name: string };
  };
}

export interface IssueCommentDto {
  id: string;
  author: User;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface IssueHistoryChangeItemDto {
  fieldKey: string;
  fromId?: string | null;
  toId?: string | null;
  fromDisplay?: string | null;
  toDisplay?: string | null;
}

export interface IssueHistoryItemDto {
  id: string;
  authorId: string;
  createdAt: string;
  items: IssueHistoryChangeItemDto[];
}

export interface IssueAttachmentDto {
  id: string;
  fileName: string;
  mimeType: string;
  size: string;
  uploadedBy: string;
  createdAt: string;
  url: string;
  issueId: string;
}

export interface IssueTransitionDto {
  id: string;
  name: string;
  from: {
    id: string;
    name: string;
    key: string;
    category: WorkflowStatus['category'];
  };
  to: {
    id: string;
    name: string;
    key: string;
    category: WorkflowStatus['category'];
  };
}
