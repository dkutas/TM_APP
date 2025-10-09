import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Issue } from '../../issue/entities/issue.entity';
import { FieldDefinition } from '../../field-definition/entities/field-definition.entity';
import { FieldOption } from '../../field-option/entities/field-option.entity';

// src/fields/issue-field-value.entity.ts
@Entity('issue_field_values')
@Index(['issue', 'fieldDef'], { unique: true })
export class IssueFieldValue {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' }) issue: Issue;
  @ManyToOne(() => FieldDefinition, { onDelete: 'CASCADE' })
  fieldDef: FieldDefinition;

  // típusfüggő oszlopok (csak egyet használunk ténylegesen)
  @Column({ type: 'text', nullable: true }) valueText?: string;
  @Column({ type: 'numeric', nullable: true }) valueNumber?: string; // decimal
  @Column({ type: 'boolean', nullable: true }) valueBool?: boolean;
  @Column({ type: 'date', nullable: true }) valueDate?: string;
  @Column({ type: 'timestamptz', nullable: true }) valueDatetime?: Date;
  @Column({ type: 'uuid', nullable: true }) valueUserId?: string; // User FK-t migrációval adhatod
  @Column({ type: 'jsonb', nullable: true }) valueJson?: any; // multi-option vagy komplex

  @Column({ type: 'timestamptz', default: () => 'now()' }) updatedAt: Date;

  @OneToMany(() => IssueFieldValueOption, (m) => m.issueFieldValue, {
    cascade: true,
  })
  options: IssueFieldValueOption[];
}

@Entity('issue_field_value_options')
@Index(['issueFieldValue', 'option'], { unique: true })
export class IssueFieldValueOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => IssueFieldValue, (v) => v.options, {
    onDelete: 'CASCADE',
  })
  issueFieldValue: IssueFieldValue;

  @ManyToOne(() => FieldOption, { onDelete: 'CASCADE' })
  option: FieldOption;
}
