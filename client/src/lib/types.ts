
export type ID = string;

export type User = {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type Project = {
  id: ID;
  key: string;
  name: string;
  description?: string;
  users: User[];
};

export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Issue = {
  id: ID;
  key: string;
  projectId: ID;
  summary: string;
  description?: string;
  status: IssueStatus;
  priority: 'Low' | 'Medium' | 'High';
  reporterId: ID;
  assigneeId?: ID;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
};
