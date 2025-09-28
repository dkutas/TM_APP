import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

export type SystemRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 100 }) name: string;

  @Column({ length: 255, unique: true }) email: string;

  @Column({ name: 'password' }) password: string;

  @Column({ name: 'system_role', type: 'varchar', default: 'USER' })
  systemRole: SystemRole;

  @ManyToOne(() => User, { cascade: true })
  @JoinTable()
  projects: Project[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];
}
