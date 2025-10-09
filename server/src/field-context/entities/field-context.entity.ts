import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldDefinition } from '../../field-definition/entities/field-definition.entity';
import { Project } from '../../project/entities/project.entity';
import { IssueType } from '../../issue-type/entities/issue-type.entity';
import { FieldOption } from '../../field-option/entities/field-option.entity';

// src/fields/field-context.entity.ts
@Entity('field_contexts')
@Index(['fieldDef', 'project', 'issueType'], { unique: true })
export class FieldContext {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => FieldDefinition, (fd) => fd.contexts, {
    onDelete: 'CASCADE',
  })
  fieldDef: FieldDefinition;
  @ManyToOne(() => Project, { onDelete: 'CASCADE', nullable: true })
  project?: Project | null;
  @ManyToOne(() => IssueType, { onDelete: 'CASCADE', nullable: true })
  issueType?: IssueType | null;

  @Column({ default: true }) visible: boolean;
  @Column({ default: false }) required: boolean;
  @Column({ default: true }) editable: boolean;
  @Column({ type: 'int', default: 0 }) order: number;

  @ManyToOne(() => FieldOption, { onDelete: 'SET NULL', nullable: true })
  defaultOption?: FieldOption;

  @Column({ type: 'numeric', nullable: true }) min?: string;
  @Column({ type: 'numeric', nullable: true }) max?: string;
  @Column({ type: 'varchar', length: 200, nullable: true }) regex?: string;
}
