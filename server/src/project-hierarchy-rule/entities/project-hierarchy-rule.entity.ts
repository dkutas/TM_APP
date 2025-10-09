// src/projects/project-hierarchy-rule.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { IssueType } from '../../issue-type/entities/issue-type.entity';
import { LinkType } from '../../link-type/entities/link-type.entity';

@Entity('project_hierarchy_rules')
@Index(['project', 'parentIssueType', 'childIssueType', 'linkType'], {
  unique: true,
})
export class ProjectHierarchyRule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Project, { onDelete: 'CASCADE' }) project: Project;
  @ManyToOne(() => IssueType, { onDelete: 'CASCADE' })
  parentIssueType: IssueType;
  @ManyToOne(() => IssueType, { onDelete: 'CASCADE' })
  childIssueType: IssueType;
  @ManyToOne(() => LinkType, { onDelete: 'RESTRICT' }) linkType: LinkType;

  @Column({ type: 'int', default: 0 }) minChildren: number;
  @Column({ type: 'int', nullable: true }) maxChildren?: number; // null = nincs limit
  @Column({ default: true }) enforceSingleParent: boolean;
}
