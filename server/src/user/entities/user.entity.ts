import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SystemRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 100 }) name: string;

  @Column({ length: 255, unique: true }) email: string;

  @Column({ name: 'password' }) password: string;

  @Column({ name: 'system_role', type: 'varchar', default: 'USER' })
  systemRole: SystemRole;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
