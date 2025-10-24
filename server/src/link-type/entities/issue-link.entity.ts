import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from '../../issue/entities/issue.entity';
import { LinkType } from './link-type.entity';

@Entity('issue_links')
@Index(['linkType', 'srcIssue', 'dstIssue'], { unique: true })
export class IssueLink {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => LinkType, { onDelete: 'RESTRICT' }) linkType: LinkType;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) srcIssue: Issue;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) dstIssue: Issue;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
}