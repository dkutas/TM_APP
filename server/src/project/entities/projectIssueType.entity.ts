// src/projects/project-issue-type.entity.ts
import { Project } from './project.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IssueType } from '../../issue-type/entities/issue-type.entity';
import { Workflow } from '../../workflow/entities/workflow.entity';

@Entity('project_issue_types')
@Index(['project', 'issueType'], { unique: true })
export class ProjectIssueType {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Project, (p) => p.projectIssueTypes, { onDelete: 'CASCADE' })
  project: Project;
  @ManyToOne(() => IssueType, { onDelete: 'CASCADE' }) issueType: IssueType;
  @ManyToOne(() => Workflow, { onDelete: 'RESTRICT' }) workflow: Workflow;
  @Column({ length: 20 }) keyPrefix: string;
}
