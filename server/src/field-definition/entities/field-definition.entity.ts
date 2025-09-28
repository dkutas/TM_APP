import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FieldScope {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}
export enum DataType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOL = 'bool',
  DATE = 'date',
  DATETIME = 'datetime',
  USER = 'user',
  OPTION = 'option',
  MULTI_OPTION = 'multi_option',
  LINK = 'link',
}

@Entity('fieldDefinition')
export class FieldDefinition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 50 }) key: string;
  @Column({ length: 255 }) name: string;
  @Column('enum', { enum: FieldScope }) scope: FieldScope;
  @Column('boolean', { default: false }) is_system: boolean;
  @Column('text', { nullable: true })
  description: string | null;
  @Column('enum', { enum: DataType }) data_type: DataType;
  @CreateDateColumn() created_at: Date;
}
