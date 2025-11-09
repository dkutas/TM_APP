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
  name: RoleEnum;
  @Column({ length: 40, enum: ['project', 'system'] }) scope:
    | 'project'
    | 'system';
}

@Entity('project_memberships')
@Index(['project', 'user'], { unique: true })
export class ProjectMembership {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Project, { onDelete: 'CASCADE' }) project: Project;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @ManyToOne(() => Role, { onDelete: 'RESTRICT' }) role: Role;
}
