import { Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('project_memberships')
@Index(['project', 'user'], { unique: true })
export class ProjectMembership {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Project, { onDelete: 'CASCADE' }) project: Project;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @ManyToOne(() => Role, { onDelete: 'RESTRICT' }) role: Role;
}
