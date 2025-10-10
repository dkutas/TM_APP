// src/auth/role.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';
import { RoleEnum } from '../../common/enums';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: RoleEnum })
  name: RoleEnum; // pl. PROJECT_ADMIN
  @Column({ length: 40 }) scope: string; // 'project' | 'global'
}

@Entity('permissions')
@Index(['key'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 120 }) key: string; // pl. issue.create
  @Column({ type: 'text', nullable: true }) description?: string;
}

@Entity('role_permissions')
@Index(['role', 'permission'], { unique: true })
export class RolePermission {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Role, { onDelete: 'CASCADE' }) role: Role;
  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  permission: Permission;
}

@Entity('project_memberships')
@Index(['project', 'user'], { unique: true })
export class ProjectMembership {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Project, { onDelete: 'CASCADE' }) project: Project;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @ManyToOne(() => Role, { onDelete: 'RESTRICT' }) role: Role;
}
