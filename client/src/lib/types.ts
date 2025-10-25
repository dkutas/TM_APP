import type {UUID} from "node:crypto";

export type ID = UUID;

export type User = {
    id: ID;
    name: string;
    email: string;
};

/**
 * DataType enum kept in sync with backend (see UML2.md).
 */
export enum DataType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    BOOL = 'BOOL',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    USER = 'USER',
    OPTION = 'OPTION',
    MULTI_OPTION = 'MULTI_OPTION',
}

export type UserProject = {
    projectId: ID;
    projectKey: string;
    projectName: string;
    role: ProjectRole;
};
export type Project = ModDates & {
    id: string, key: string, description: string, name: string
};

export type ProjectIssueType = {
    id: ID,
    issueType: IssueType;
    keyPrefix: string;
    active: true
}
export type ProjectIssueTypeResponse = Project & {
    projectIssueTypes: ProjectIssueType[];
}

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

export type CustomFieldOption = {
    id: string;
    key: string;
    value: string;
    order: number;
}

type CustomFieldBase = {
    id: string;
    key: string;
    name: string;
    required: boolean;
    visible: boolean;
    editable: boolean;
    order: number;
    options?: CustomFieldOption[] | null;
}

export type IssueCustomField =
    | (CustomFieldBase & { dataType: 'TEXT'; value: string | null })
    | (CustomFieldBase & { dataType: 'NUMBER'; value: number | null })
    | (CustomFieldBase & { dataType: 'BOOL'; value: boolean | null })
    | (CustomFieldBase & { dataType: 'DATE'; value: string | null })
    | (CustomFieldBase & { dataType: 'DATETIME'; value: string | null })
    | (CustomFieldBase & { dataType: 'USER'; value: string | null })
    | (CustomFieldBase & { dataType: 'OPTION'; value: string | null })
    | (CustomFieldBase & { dataType: 'MULTI_OPTION'; value: string[] });

export type IssueSystemFields = {
    summary: string;
    description?: string;
    assignee?: ID;
    reporter: ID;
    priority: ID;
    dueDate?: string;
}

export type IssueCustomFieldDefs =
    | (CustomFieldBase & { dataType: DataType.TEXT })
    | (CustomFieldBase & { dataType: DataType.NUMBER })
    | (CustomFieldBase & { dataType: DataType.BOOL })
    | (CustomFieldBase & { dataType: DataType.DATE })
    | (CustomFieldBase & { dataType: DataType.DATETIME })
    | (CustomFieldBase & { dataType: DataType.USER })
    | (CustomFieldBase & { dataType: DataType.OPTION })
    | (CustomFieldBase & { dataType: DataType.MULTI_OPTION });

export type IssueCustomFieldContext = {
    fieldDef: IssueCustomFieldDefs,
    max: number,
    min: number,
    order: number,
    regexp?: string,
    visible: boolean,
    required: boolean,
    editable: boolean,
    defaultValue?: string | number | boolean | null | string[]
}

export type NormalizedFieldValue = { label: string, value: string | number | boolean | null | string[] }

export type IssueTransition = {
    id: string;
    name: string;
    from: {
        id: string; name: string; key: string
        category: IssueStatus["category"]
    };
    to: {
        id: string; name: string; key: string;
        category: IssueStatus["category"]
    };
}

export type HistoryLog = {
    id: string;
    authorId: ID;
    createdAt: string; // ISO
    items: Array<{
        fieldKey: string;
        fromId: string | null;
        fromDisplay: string | null;
        toId: string | null;
        toDisplay: string | null;
    }>;
}


export type Issue = {
    id: ID;
    key: string;
    projectId: ID;
    summary: string;
    description: string;
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
    comments: Array<Comment>;
    history: Array<HistoryLog>
    fields: Array<IssueCustomField>
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


export type IssueLinkType = {
    id: ID;
    name: string;
    category: string;
    directed: boolean;
    inwardLabel: string;
    outwardLabel: string;
    allowCycles: boolean;
}