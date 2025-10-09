// src/fields/field-option.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldDefinition } from '../../field-definition/entities/field-definition.entity';

@Entity('field_options')
@Index(['fieldDef', 'key'], { unique: true })
export class FieldOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => FieldDefinition, (fd) => fd.options, { onDelete: 'CASCADE' })
  fieldDef: FieldDefinition;
  @Column({ length: 50 }) key: string;
  @Column({ length: 200 }) value: string;
  @Column({ type: 'int', default: 0 }) order: number;
}
