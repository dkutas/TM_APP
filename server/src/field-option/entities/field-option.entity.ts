import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fieldOption')
export class FieldOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') field_def_id: string;
  @Column({ length: 100 }) key: string;
  @Column({ length: 100 }) value: string;
  @Column('int') order: number;
}
