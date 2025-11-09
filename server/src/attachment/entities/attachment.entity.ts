import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from '../../issue/entities/issue.entity';
import { User } from '../../user/entities/user.entity';

@Entity('attachments')
@Index(['issue', 'createdAt'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) issue: Issue;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) uploader: User;

  @Column({ length: 255 }) fileName: string;
  @Column({ length: 120 }) mimeType: string;
  @Column({ type: 'bigint' }) size: string;
  @Column({ type: 'text' }) url: string;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
}
