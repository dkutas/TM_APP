// src/workflows/workflow.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

const StatusCategory = ['DONE', 'INPROGRESS', 'TODO'];

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ default: true }) isActive: boolean;

  @OneToMany(() => WorkflowStatus, (s) => s.workflow, { cascade: ['insert'] })
  statuses: WorkflowStatus[];

  @OneToMany(() => WorkflowTransition, (t) => t.workflow, {
    cascade: ['insert'],
  })
  transitions: WorkflowTransition[];
}

@Entity('workflow_statuses')
@Index(['workflow', 'key'], { unique: true })
export class WorkflowStatus {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Workflow, (w) => w.statuses, { onDelete: 'CASCADE' })
  workflow: Workflow;

  @Column({ length: 40 }) key: string;
  @Column({ length: 80 }) name: string;
  @Column({ default: false }) isTerminal: boolean;
  @Column({ length: 40, nullable: true }) category: string; // TODO/INPROGRESS/DONE
  @Column({ type: 'jsonb', nullable: true }) position: { x: number; y: number };
}

@Entity('workflow_transitions')
@Index(['workflow', 'fromStatus', 'toStatus'], { unique: true })
export class WorkflowTransition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Workflow, (w) => w.transitions, { onDelete: 'CASCADE' })
  workflow: Workflow;

  @ManyToOne(() => WorkflowStatus, { onDelete: 'CASCADE' })
  fromStatus: WorkflowStatus;
  @ManyToOne(() => WorkflowStatus, { onDelete: 'CASCADE' })
  toStatus: WorkflowStatus;

  @Column({ length: 100 }) name: string;
  @Column({ type: 'text', nullable: true }) guard?: string; // pl. szerep, mezőfeltétel
}
