import type {UUID} from "node:crypto";

export type ID = UUID;

export type User = {
    id: ID;
    name: string;
    email: string;
    avatarUrl?: string;
};

export type UserProject = {
    projectId: ID;
    projectKey: string;
    projectName: string;
    role: ProjectRole;
};
export type Project = ModDates & {
    id: string, key: string, description: string, name: string
};

export type ProjectRole = {
    id: UUID;
    name: string;
}

export type IssueStatus = { category: "To Do" | "In Progress" | "Done", name: string, id: ID };
export type IssuePriority = { rank: number, name: string, id: ID };

export type Issue = {
    id: ID;
    key: string;
    projectId: ID;
    summary: string;
    description?: string;
    status: IssueStatus;
    priority: IssuePriority;
    reporterId: ID;
    assigneeId?: ID;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
};

export type QueryParams = {
    limit: number,
    page: 1,
    total: number
}

export type ModDates = { createdAt: Date, updatedAt: Date } // ISO 8601 format

export type UserIssue = ModDates & {
    id: ID,
    key: string,
    summary: string,
    status: IssueStatus,
    project: Project,
    priority: 'Low' | 'Medium' | 'High'
};
