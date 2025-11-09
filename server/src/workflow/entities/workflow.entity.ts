// src/workflows/workflow.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowStatus } from './workflow-status.entity';
import { WorkflowTransition } from './workflow-transition.entity';

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
