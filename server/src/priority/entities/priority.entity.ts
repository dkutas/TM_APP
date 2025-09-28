import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('priority')
export class Priority {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() rank: number;
}
