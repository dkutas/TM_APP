import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fieldContext')
export class FieldContext {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') field_def_id: string;
  @Column('uuid', { nullable: true }) project_id: string | null;
  @Column('uuid', { nullable: true }) issue_type_id: string | null;

  @Column('boolean', { default: false }) required: boolean;
  @Column('boolean', { default: true }) visible: boolean;
  @Column('boolean', { default: true }) editable: boolean;
  @Column('int') order: number;

  @Column('uuid', { nullable: true }) default_option_id: string | null;
  @Column('decimal', { nullable: true }) min: number | null;
  @Column('decimal', { nullable: true }) max: number | null;
  @Column('varchar', { nullable: true, length: 255 }) regex: string | null;
}
