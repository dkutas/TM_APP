// src/issues/priority.entity.ts
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('priorities')
@Index(['rank'], { unique: true })
export class Priority {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 50 }) name: string;
  @Column({ type: 'int' }) rank: number;
}
