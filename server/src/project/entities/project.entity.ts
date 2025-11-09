import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectIssueType } from './projectIssueType.entity';
import { Issue } from '../../issue/entities/issue.entity';

@Entity('projects')
@Index(['key'], { unique: true })
export class Project {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'varchar', length: 20 }) key: string;
  @Column({ type: 'varchar', length: 255 }) name: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
  @Column({ type: 'boolean', default: false }) archived: boolean;

  @OneToMany(() => ProjectIssueType, (pit) => pit.project)
  projectIssueTypes: ProjectIssueType[];
  @OneToMany(() => Issue, (i) => i.project) issues: Issue[];
}
