// src/fields/field-definition.entity.ts
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DataType } from '../../common/enums';
import { FieldContext } from '../../field-context/entities/field-context.entity';

@Entity('field_definitions')
@Index(['key'], { unique: true }) // pl. system.summary, custom.foo
export class FieldDefinition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 120 }) key: string;
  @Column({ length: 120 }) name: string;

  @Column({ type: 'enum', enum: DataType }) dataType: DataType;

  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;

  @OneToMany(() => FieldContext, (c) => c.fieldDef) contexts: FieldContext[];
}
