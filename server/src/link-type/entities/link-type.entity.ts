// src/links/link-type.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LinkCategory } from '../../common/enums';
import { Issue } from '../../issue/entities/issue.entity';

@Entity('link_types')
export class LinkType {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 80 }) name: string;
  @Column({ type: 'enum', enum: LinkCategory }) category: LinkCategory;
  @Column({ default: false }) directed: boolean;
  @Column({ length: 40 }) inwardLabel: string;
  @Column({ length: 40 }) outwardLabel: string;
  @Column({ default: true }) allowsCycles: boolean;
}

@Entity('issue_links')
@Index(['linkType', 'srcIssue', 'dstIssue'], { unique: true })
export class IssueLink {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => LinkType, { onDelete: 'RESTRICT' }) linkType: LinkType;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) srcIssue: Issue;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) dstIssue: Issue;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
}
