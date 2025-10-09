// src/fields/field-definition.entity.ts
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DataType, FieldScope } from '../../common/enums';
import { FieldOption } from '../../field-option/entities/field-option.entity';
import { FieldContext } from '../../field-context/entities/field-context.entity';

@Entity('field_definitions')
@Index(['key'], { unique: true }) // pl. system.summary, custom.foo
export class FieldDefinition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 120 }) key: string;
  @Column({ length: 120 }) name: string;

  @Column({ type: 'enum', enum: FieldScope }) scope: FieldScope;
  @Column({ type: 'enum', enum: DataType }) dataType: DataType;
  @Column({ default: false }) isSystem: boolean;

  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;

  @OneToMany(() => FieldOption, (o) => o.fieldDef) options: FieldOption[];
  @OneToMany(() => FieldContext, (c) => c.fieldDef) contexts: FieldContext[];
}
