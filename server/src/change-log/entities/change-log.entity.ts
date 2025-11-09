import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from '../../issue/entities/issue.entity';
import { User } from '../../user/entities/user.entity';
import { ChangeItem } from './change-item.entity';

@Entity('change_logs')
@Index(['issue', 'createdAt'])
export class ChangeLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) issue: Issue;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) actor: User;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;

  @OneToMany(() => ChangeItem, (i) => i.changeLog, { cascade: ['insert'] })
  items: ChangeItem[];
}
