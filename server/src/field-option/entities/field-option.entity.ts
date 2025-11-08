// src/fields/field-option.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldContext } from '../../field-context/entities/field-context.entity';

@Entity('field_options')
@Index(['fieldCtx', 'key'], { unique: true })
export class FieldOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => FieldContext, (fc) => fc.options, { onDelete: 'CASCADE' })
  fieldCtx: FieldContext;
  @Column({ length: 50 }) key: string;
  @Column({ length: 200 }) value: string;
  @Column({ type: 'int' }) order: number;
}
