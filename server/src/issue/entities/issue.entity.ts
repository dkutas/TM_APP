// src/issues/issue.entity.ts
import { Project } from '../../project/entities/project.entity';
import { ProjectIssueType } from '../../project/entities/projectIssueType.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IssueType } from '../../issue-type/entities/issue-type.entity';
import { WorkflowStatus } from '../../workflow/entities/workflow.entity';
import { Priority } from '../../priority/entities/priority.entity';
import { User } from '../../user/entities/user.entity';

@Entity('issues')
@Index(['key'], { unique: true })
@Index(['project', 'createdAt'])
export class Issue {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Project, (p) => p.issues, { onDelete: 'CASCADE' })
  project: Project;
  @ManyToOne(() => ProjectIssueType, { onDelete: 'RESTRICT' })
  projectIssueType: ProjectIssueType;
  @ManyToOne(() => IssueType, { onDelete: 'RESTRICT' }) issueType: IssueType;

  @Column({ length: 30 }) key: string; // PROJ-123
  @Column({ length: 255 }) summary: string;
  @Column({ type: 'text', nullable: true }) description: string;

  @ManyToOne(() => WorkflowStatus, { onDelete: 'RESTRICT' })
  status: WorkflowStatus;
  @ManyToOne(() => Priority, { onDelete: 'SET NULL' })
  priority: Priority;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) reporter: User;
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  assignee?: User;

  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
  @Column({ type: 'timestamptz', default: () => 'now()' }) updatedAt: Date;
  @Column({ type: 'date', nullable: true }) dueDate?: string;
}
