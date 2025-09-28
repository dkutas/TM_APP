@startuml

hide empty members
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam defaultFontName "Inter"

' ===== Enums
enum FieldScope {
CORE
CUSTOM
}

enum DataType {
TEXT
NUMBER
BOOL
DATE
DATETIME
USER
OPTION
MULTI_OPTION
LINK
}

enum LinkCategory {
HIERARCHY
RELATES
BLOCKS
DUPLICATES
}

' ===== Core domain
class Project {
+id: UUID
+key: string <<unique>>
+name: string
+description: text?
+created_at: datetime
+archived: bool
}

class IssueType {
+id: UUID
+key: string <<unique>>
+name: string
+description: text?
}

class Workflow {
+id: UUID
+name: string
+description: text?
+is_active: bool
}

class WorkflowStatus {
+id: UUID
+workflow_id: UUID
+key: string
+name: string
+is_terminal: bool
+category: string?  ' e.g. TODO/INPROGRESS/DONE
}

class WorkflowTransition {
+id: UUID
+workflow_id: UUID
+from_status_id: UUID
+to_status_id: UUID
+name: string
+guard: text?       ' pl. szerep, mezőfeltétel
}

class ProjectIssueType {
+id: UUID
+project_id: UUID
+issue_type_id: UUID
+workflow_id: UUID
+key_prefix: string  ' pl. PROJ-BUG -> PROJ
+active: bool
}

class Priority {
+id: UUID
+name: string
+rank: int
}

class Issue {
+id: UUID
+project_id: UUID
+project_issue_type_id: UUID
+issue_type_id: UUID
+key: string <<unique>>  ' pl. PROJ-123
+summary: string
+description: text?
+status_id: UUID        ' -> WorkflowStatus
+priority_id: UUID?
+reporter_id: UUID
+assignee_id: UUID?
+created_at: datetime
+updated_at: datetime
+due_date: date?
}

' ===== Linking & hierarchy
class LinkType {
+id: UUID
+name: string
+category: LinkCategory
+directed: bool
+inward_label: string
+outward_label: string
+allows_cycles: bool
}

class IssueLink {
+id: UUID
+link_type_id: UUID
+src_issue_id: UUID
+dst_issue_id: UUID
+created_at: datetime
}

class ProjectHierarchyRule {
+id: UUID
+project_id: UUID
+parent_issue_type_id: UUID
+child_issue_type_id: UUID
+link_type_id: UUID
+min_children: int = 0
+max_children: int?   ' null = nincs limit
+enforce_single_parent: bool
}

' ===== Fields (definitions, context, values)
class FieldDefinition {
+id: UUID
+key: string <<unique>>   ' pl. system.summary, custom.foo
+name: string
+scope: FieldScope        ' CORE vagy CUSTOM
+data_type: DataType
+is_system: bool          ' CORE esetén true
+description: text?
+created_at: datetime
}

class FieldOption {
+id: UUID
+field_def_id: UUID
+key: string
+value: string
+order: int
}

class FieldContext {
+id: UUID
+field_def_id: UUID
+project_id: UUID?       ' null = globális
+issue_type_id: UUID?    ' null = minden issueType
+required: bool
+visible: bool
+editable: bool
+order: int
+default_option_id: UUID?
+min: decimal?
+max: decimal?
+regex: string?
}

class IssueFieldValue {
+id: UUID
+issue_id: UUID
+field_def_id: UUID
+value_text: text?
+value_number: decimal?
+value_bool: bool?
+value_date: date?
+value_datetime: datetime?
+value_user_id: UUID?
+value_json: jsonb?      ' struktúrált / többértékű tároláshoz
+updated_at: datetime
}

class IssueFieldValueOption {
+issue_field_value_id: UUID
+option_id: UUID
}

' ===== Users & permissions
class User {
+id: UUID
+email: string <<unique>>
+name: string
+active: bool
+created_at: datetime
}

class ProjectMembership {
+id: UUID
+project_id: UUID
+user_id: UUID
+role_id: UUID
}

class Role {
+id: UUID
+name: string
+scope: string  ' project/global
}

class Permission {
+id: UUID
+key: string <<unique>>
+description: text?
}

class RolePermission {
+role_id: UUID
+permission_id: UUID
}

' ===== Collaboration & audit
class Comment {
+id: UUID
+issue_id: UUID
+author_id: UUID
+body: text
+created_at: datetime
}

class Attachment {
+id: UUID
+issue_id: UUID
+uploader_id: UUID
+file_name: string
+mime_type: string
+size: bigint
+url: string
+created_at: datetime
}


class ChangeLog {
+id: UUID
+issue_id: UUID
+actor_id: UUID
+created_at: datetime
}

class ChangeItem {
+id: UUID
+changelog_id: UUID
+field_key: string
+from_display: string?
+to_display: string?
+from_id: UUID?
+to_id: UUID?
}

' ===== Relationships
Project "1" o-- "*" Issue
Project "1" o-- "*" ProjectIssueType
IssueType "1" o-- "*" ProjectIssueType
ProjectIssueType "*" --> "1" Workflow
Workflow "1" o-- "*" WorkflowStatus
Workflow "1" o-- "*" WorkflowTransition
WorkflowStatus "1" <-- "*" WorkflowTransition : to
WorkflowStatus "1" --> "*" WorkflowTransition : from

Issue "*" --> "1" Project
Issue "*" --> "1" IssueType
Issue "*" --> "1" ProjectIssueType
Issue "*" --> "0..1" Priority
Issue "*" --> "1" WorkflowStatus : status

LinkType "1" o-- "*" IssueLink
Issue "1" <-- "*" IssueLink : src
Issue "1" <-- "*" IssueLink : dst

Project "1" o-- "*" ProjectHierarchyRule
IssueType "1" <-- "*" ProjectHierarchyRule : parent
IssueType "1" <-- "*" ProjectHierarchyRule : child
LinkType "1" <-- "*" ProjectHierarchyRule

FieldDefinition "1" o-- "*" FieldOption
FieldDefinition "1" o-- "*" FieldContext
FieldDefinition "1" o-- "*" IssueFieldValue
Issue "1" o-- "*" IssueFieldValue
IssueFieldValue "1" o-- "*" IssueFieldValueOption
FieldOption "1" <-- "*" IssueFieldValueOption

User "1" o-- "*" ProjectMembership
Project "1" o-- "*" ProjectMembership
Role "1" o-- "*" ProjectMembership
Role "1" o-- "*" RolePermission
Permission "1" o-- "*" RolePermission

Issue "1" o-- "*" Comment
User "1" o-- "*" Comment : author
Issue "1" o-- "*" Attachment
User "1" o-- "*" Attachment : uploader

Issue "1" o-- "*" ChangeLog
ChangeLog "1" o-- "*" ChangeItem
User "1" o-- "*" ChangeLog : actor


note top of ProjectIssueType
Projektenként megadja:
- mely IssueType engedélyezett
- mely Workflow van hozzárendelve
- kulcs prefix (KEY-123)
  end note

note right of Issue
status_id az adott IssueType-hoz rendelt WorkflowStatusból
származhat (ProjectIssueType.workflow_id).
Ennek konzisztenciája app-szintű vagy
DB CHECK/trigger biztosítással tartható fenn.
end note

note bottom of FieldContext
FieldDefinition -> FieldContext
határozza meg, hogy egy adott projektben és/vagy
issueType-on a mező látszik-e, kötelező-e stb.
CORE mezőknek implicit globális FieldContext is lehet.
end note

note bottom of ProjectHierarchyRule
Tipikus használat: HIERARCHY kategóriájú LinkType
- parent/child típusú kapcsolatok definiálása
- min/max gyerekszám
- egy-szülős korlátozás
  end note

@enduml