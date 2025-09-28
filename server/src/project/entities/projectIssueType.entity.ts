import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('projectIssueType')
export class ProjectIssueType {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') project_id: string;

  @Column('uuid') issue_type_id: string;

  @Column('uuid') workflow_id: string;

  @Column() key_prefix: string;
}
