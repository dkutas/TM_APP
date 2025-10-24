export type CFvalues = {
  fieldDefId: string;
  value: string | number | boolean | string[] | null;
  fieldName: string | undefined;
};

export type SystemValues = {
  summary: string;
  description?: string;
  priority: string;
  dueDate?: string | null;
  reporter?: string;
  assignee?: string | null;
};

export class CreateIssueDto {
  cFvalues: CFvalues;
  systemValues: SystemValues;
  projectId: string;
  issueTypeId: string;
}
