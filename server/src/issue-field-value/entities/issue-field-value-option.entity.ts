import { Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FieldOption } from '../../field-option/entities/field-option.entity';
import { IssueFieldValue } from './issue-field-value.entity';

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