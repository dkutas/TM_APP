export class UpdateIssueDto {
  updates: Array<{ fieldDefId: string; value: any }>;
  systemUpdates: {
    assignee: string | null;
    summary?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    reporter?: string;
  };
}
