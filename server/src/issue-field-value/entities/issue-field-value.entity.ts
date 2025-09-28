import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('issueFieldValue')
export class IssueFieldValue {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') issue_id: string; // uuid
  @Column('uuid') field_def_id: string; // uuid
  @Column({ type: 'text', nullable: true }) value_text: string;
  @Column({ type: 'decimal', nullable: true }) value_number: number;
  @Column({ type: 'boolean', nullable: true }) value_bool: boolean;
  @Column({ type: 'date', nullable: true }) value_date: Date;
  @Column({ type: 'date', nullable: true }) value_datetime: Date;
  @Column({ type: 'uuid', nullable: true }) value_user_id: string;
  @Column({ type: 'jsonb', nullable: true }) value_json: object;
  @UpdateDateColumn({ type: 'timestamp' }) updated_at: Date;
}
