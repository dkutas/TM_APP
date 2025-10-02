# Követelmény specifikáció (MVP Ticketing System)

Ez a dokumentum a szakdolgozat keretében megvalósítandó Jira-szerű ticketing rendszer **funkcionális követelményeit**
írja le.  
Az MVP a biztosan szállítható minimumot tartalmazza (értesítések, Kanban, haladó jogosultságok és komplex keresés
nélkül).

---

## Use-case diagram

A fő funkciókat és aktorokat az alábbi PlantUML ábra szemlélteti.  
Az ábra tartalmazza a nagyobb **alrendszerek téglalapokkal** való elkülönítését, az **aktorokat**, és a köztük lévő *
*relációkat**.

```plantuml
@startuml
left to right direction
skinparam defaultFontName "Inter"
skinparam PackageStyle rectangle
skinparam usecase {
  BackgroundColor<<sub>> #f5f7fb
  BorderColor<<sub>> #aab3c5
}

actor "Anonymous\n(nincs login)" as A
actor "Project Member\n(bejelentkezett)" as M
actor "Admin / Owner\n(projekt tulaj)" as O

rectangle "AUTH & IDENTITY" <<sub>> {
  usecase "Login" as UC_LOGIN
  usecase "Refresh token" as UC_REFRESH
  usecase "Me (profil)" as UC_ME
}

rectangle "PROJECT ADMIN" <<sub>> {
  usecase "Projekt létrehozás" as UC_PRJ_CREATE
  usecase "Projekt szerkesztés/archiválás" as UC_PRJ_EDIT
  usecase "Tagok kezelése" as UC_MEMBER_MGMT
  usecase "IssueType + Workflow hozzárendelés" as UC_ASSIGN_PIT
  usecase "Hierarchy szabályok" as UC_HIER_RULES
}

rectangle "ISSUE TRACKING" <<sub>> {
  usecase "Issue létrehozás" as UC_ISSUE_CREATE
  usecase "Issue megtekintés" as UC_ISSUE_READ
  usecase "Issue módosítás" as UC_ISSUE_UPDATE
  usecase "Issue törlés" as UC_ISSUE_DELETE
  usecase "Státuszváltás" as UC_TRANSITION
  usecase "Lista + Szűrés + Lapozás" as UC_ISSUE_LIST
}

rectangle "FIELD / EAV" <<sub>> {
  usecase "FieldDefinition kezelés" as UC_FD_MGMT
  usecase "FieldContext beállítás" as UC_FC_MGMT
  usecase "Mezőértékek mentése" as UC_EAV_SET
}

rectangle "COLLABORATION" <<sub>> {
  usecase "Komment kezelés" as UC_COMMENT
  usecase "Csatolmány kezelés" as UC_ATTACH
  usecase "Label kezelés" as UC_LABEL
}

rectangle "LINKING & HIERARCHY" <<sub>> {
  usecase "Issue link" as UC_LINK
  usecase "Parent/Child beállítás" as UC_PARENT_CHILD
}

rectangle "SEARCH & VIEW" <<sub>> {
  usecase "Gyors keresés" as UC_SEARCH
}

rectangle "AUDIT" <<sub>> {
  usecase "ChangeLog megtekintés" as UC_HISTORY
}

A --> UC_LOGIN
A --> UC_REFRESH
A --> UC_ME

O --> UC_PRJ_CREATE
O --> UC_PRJ_EDIT
O --> UC_MEMBER_MGMT
O --> UC_ASSIGN_PIT
O --> UC_HIER_RULES

M --> UC_ISSUE_CREATE
M --> UC_ISSUE_READ
M --> UC_ISSUE_UPDATE
M --> UC_ISSUE_DELETE
M --> UC_TRANSITION
M --> UC_ISSUE_LIST
M --> UC_EAV_SET
M --> UC_COMMENT
M --> UC_ATTACH
M --> UC_LABEL
M --> UC_LINK
M --> UC_PARENT_CHILD
M --> UC_SEARCH
M --> UC_HISTORY

UC_ISSUE_CREATE --> UC_EAV_SET : <<include>>
UC_ISSUE_CREATE --> UC_HISTORY : <<include>>
UC_ISSUE_UPDATE --> UC_EAV_SET : <<include>>
UC_TRANSITION --> UC_HISTORY : <<include>>
UC_COMMENT --> UC_HISTORY : <<include>>
UC_ATTACH --> UC_HISTORY : <<include>>
UC_LINK --> UC_HISTORY : <<include>>
UC_PARENT_CHILD -u-> UC_LINK : <<extend>>
@enduml
```

Követelmények
-------------
