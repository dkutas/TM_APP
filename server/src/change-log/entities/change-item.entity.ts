import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChangeLog } from './change-log.entity';

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