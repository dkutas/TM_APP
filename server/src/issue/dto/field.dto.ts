// dto/field-option.dto.ts

import { User } from '../../user/entities/user.entity';
import { Issue } from '../entities/issue.entity';

export class FieldOptionDto {
  id: string;
  key: string;
  value: string;
  order: number;
}

export interface FieldDtoBase {
  id: string;
  key: string;
  name: string;
  required: boolean;
  visible: boolean;
  editable: boolean;
  order: number;
  options?: FieldOptionDto[] | null;
}

// Diszkriminált unió beágyazva
export type FieldDto =
  | (FieldDtoBase & { dataType: 'TEXT'; value: string | null })
  | (FieldDtoBase & { dataType: 'NUMBER'; value: number | null })
  | (FieldDtoBase & { dataType: 'BOOL'; value: boolean | null })
  | (FieldDtoBase & { dataType: 'DATE'; value: string | null })
  | (FieldDtoBase & { dataType: 'DATETIME'; value: string | null })
  | (FieldDtoBase & { dataType: 'USER'; value: string | null })
  | (FieldDtoBase & { dataType: 'OPTION'; value: string | null })
  | (FieldDtoBase & { dataType: 'MULTI_OPTION'; value: string[] })
  | (FieldDtoBase & {
      dataType: 'LINK';
      value: { issueId: string; linkTypeId: string } | null;
    });

// dto/issue-with-fields.dto.ts
export interface IssueWithFieldsDto extends Issue {
  id: string;
  key: string;
  summary: string;
  projectId: string;
  issueTypeId: string;
  links: IssueLinkDto[] | null;
  comments: IssueCommentDto[] | null;
  attachments: IssueAttachmentDto[] | null;
  fields: FieldDto[];
}

// dto/issue-extras.dto.ts
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
  createdAt: string; // ISO
  updatedAt?: string | null;
}

export interface IssueHistoryItemDto {
  id: string;
  authorId: string;
  changedAt: string; // ISO
  field: string; // pl. "status", "assignee", "custom.severity"
  from?: string | null;
  to?: string | null;
}

export interface IssueAttachmentDto {
  id: string;
  fileName: string;
  mimeType: string;
  size: string;
  uploadedBy: string;
  createdAt: string; // ISO
  url: string; // signed/relative
}
