import type {UUID} from "node:crypto";

export type ID = UUID;

export type User = {
    id: ID;
    name: string;
    email: string;
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

export type IssueStatus = { category: "TODO" | "INPROGRESS" | "DONE", name: string, id: ID };
export type IssuePriority = { rank: number, name: string, id: ID };
export type UserValue = ModDates & {
    id: ID;
    name: string;
    email: string;
}

export type IssueType = {
    id: ID;
    name: string;
    key: string;
    description?: string;
}

export type Attachment = {
    id: string;
    fileName: string;
    mimeType: string;
    size: string;
    uploadedBy: string;
    createdAt: string; // ISO
    url: string; // signed/relative
}

export type Comment = {
    id: string;
    author: User;
    body: string;
    createdAt: string; // ISO
    updatedAt?: string | null;
}

export type IssueLink = {
    id: string;
    linkType: { id: string; name: string; inward: string; outward: string };
    direction: 'OUT' | 'IN';
    otherIssue: {
        id: string;
        key: string;
        summary: string;
        status: { id: string; name: string, category: "TODO" | "INPROGRESS" | "DONE" };
    };
}


export type Issue = {
    id: ID;
    key: string;
    projectId: ID;
    summary: string;
    description?: string;
    project: Project;
    status: IssueStatus;
    priority: IssuePriority;
    links: Array<IssueLink>,
    reporter: UserValue;
    assignee?: UserValue;
    issueType: IssueType;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    attachments: Array<Attachment>
    comments: Array<Comment>
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
