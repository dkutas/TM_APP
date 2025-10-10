import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

export type SystemRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ length: 100 }) name: string;

  @Column({ length: 255, unique: true }) email: string;

  @Column({ name: 'password' }) password: string;

  @Column({ name: 'system_role', type: 'varchar', default: 'USER' })
  systemRole: SystemRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];
}
