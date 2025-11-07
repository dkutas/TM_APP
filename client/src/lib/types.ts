import type {UUID} from "node:crypto";

export type ID = UUID;

export type User = {
    id: ID;
    name: string;
    email: string;
};


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

export type MembershipWithRole = {
    id: ID;
    user: {
        id: string;
        name?: string | null;
        email?: string | null
    },
    role: ProjectRole
};

export type ProjectIssueType = {
    id: ID,
    issueType: IssueType;
    keyPrefix: string;
    active: true
}

export type FieldError = {
    field: string;
    message: string;
}

export type AxiosErrorResponse<T> = {
    response: {
        headers: any;
        status: number;
        message: string;
        data?: T;
    },
    request?: any;
}
export type ProjectIssueTypeResponse = Project & {
    projectIssueTypes: ProjectIssueType[];
}

export type CreateUserDto = {
    name: string;
    email: string;
    password: string;
}

export type PitWorkflow = {
    id: ID;
    name: string;
    description: string;
    isActive: boolean;
    statuses: WorkflowStatus[];
    transitions: Array<{ id: ID, name: string, fromStatusId: WorkflowStatus, toStatusId: WorkflowStatus }>;
}

export type Workflow = {
    id: ID;
    name: string;
    description?: string;
    isActive: boolean;
    statuses: WorkflowStatus[];
    transitions: Array<{ id: ID, name: string, fromStatus: WorkflowStatus, toStatus: WorkflowStatus }>;
}

export type PitCustomFieldContext = {
    id: ID;
    fieldDef: IssueCustomFieldDefs;
    max?: number;
    min?: number;
    order?: number;
    regex?: string;
    required?: boolean;
    defaultOption?: CustomFieldOption | null;
    defaultValue?: string | number | boolean | null | string[]
}

export type ProjectRole = {
    id: UUID;
    name: string;
}

export type IssueStatus = {
    category: "TODO" | "INPROGRESS" | "DONE",
    name: string,
    id: ID,
    position: { x: number, y: number }
};
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
    id: ID;
    key: string;
    value: string;
    order: number;
}

type CustomFieldBase = {
    id: string;
    key: string;
    name: string;
    description: string;
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

export type WorkflowStatus = IssueStatus & {
    key: string;
    isTerminal: boolean;
}

export type WorkflowTransition = {
    id: string;
    name: string;
    from: WorkflowStatus;
    to: WorkflowStatus;
}

export type CustomFieldDefinitionBase = {
    id: string;
    key?: string;
    name: string;
    dataType: DataType;
    description?: string;
}

export type CustomFieldContext = {
    id: ID,
    project: Project,
    issueType: IssueType,
    required: boolean,
    min: number,
    max: number,
    regex: string
}

export type CreateCustomFieldContextDto = {
    fieldDefId?: ID,
    projectId?: ID,
    issueTypeId?: ID,
    min?: number,
    max?: number,
    regex?: string
    required: boolean,
    defaultOption?: CustomFieldOption | null;
    defaultValue?: string | number | boolean | null | string[]
}

export type CustomFieldDefWithContexts = CustomFieldDefinitionBase & {
    contexts: CustomFieldContext[]
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
    defaultValue?: string | number | boolean | null | string[],
    defaultOption?: CustomFieldOption | null;
}

export type NormalizedFieldValue = { label: string, value: string | number | boolean | null | string[] }
export type NormalizedHistoryRecord = {
    id: ID,
    actorName: string,
    createdAt: string, // ISO
    items: { fieldLabel: string, value: string }[]
}

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
    id: ID;
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

export type ChangeLogHistory = ModDates & {
    id: ID;
    issue: UserIssue;
    items: Array<{
        fieldKey: string;
        fromDisplay: string | null;
        fromId: string | null;
        toDisplay: string | null;
        toId: string | null;
    }>;
}

export type IssueLinkType = {
    id: ID;
    name: string;
    category: string;
    directed: boolean;
    inwardLabel: string;
    outwardLabel: string;
    allowCycles: boolean;
}