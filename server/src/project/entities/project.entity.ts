import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ length: 100 }) name: string;

  @Column({ length: 20, unique: true }) key: string;

  @Column({ length: 255, nullable: true }) description: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
