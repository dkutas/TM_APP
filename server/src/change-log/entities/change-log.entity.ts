// src/audit/changelog.entity.ts
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

@Entity('change_items')
export class ChangeItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => ChangeLog, (l) => l.items, { onDelete: 'CASCADE' })
  changeLog: ChangeLog;
  @Column({ length: 120 }) fieldKey: string;
  @Column({ type: 'text', nullable: true }) fromDisplay?: string;
  @Column({ type: 'text', nullable: true }) toDisplay?: string;
  @Column({ type: 'uuid', nullable: true }) fromId?: string;
  @Column({ type: 'uuid', nullable: true }) toId?: string;
}
