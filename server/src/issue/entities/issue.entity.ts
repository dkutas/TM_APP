import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('issue')
export class Issue {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') project_id: string;

  @Column('uuid') project_issue_type_id: string;

  @Column('uuid') issue_type_id: string;

  @Column({ unique: true }) key: string;

  @Column({ length: 100 }) summary: string;

  @Column({ length: 255, nullable: true }) description: string;
  @Column({ length: 50, nullable: true }) status: string;

  @Column({ length: 50, nullable: true }) priority: string;
  @Column({ length: 50, nullable: true }) resolution: string;

  @Column('uuid', { nullable: true }) assignee_id: string;
  @Column('uuid', { nullable: true }) reporter_id: string;

  @Column('jsonb', { nullable: true }) due_date: Date;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
