import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from '../../issue/entities/issue.entity';
import { User } from '../../user/entities/user.entity';

@Entity('comments')
@Index(['issue', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) issue: Issue;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) author: User;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
}
