import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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
