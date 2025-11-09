import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';

@Entity('workflow_statuses')
@Index(['workflow', 'key'], { unique: true })
export class WorkflowStatus {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Workflow, (w) => w.statuses, { onDelete: 'CASCADE' })
  workflow: Workflow;

  @Column({ length: 40 }) key: string;
  @Column({ length: 80 }) name: string;
  @Column({ default: false }) isTerminal: boolean;
  @Column({ length: 40, nullable: true }) category: string;
  @Column({ type: 'jsonb', nullable: true }) position: { x: number; y: number };
}
