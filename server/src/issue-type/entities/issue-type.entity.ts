import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issue_types')
@Index(['key'], { unique: true })
export class IssueType {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 50 }) key: string;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'text', nullable: true }) description?: string;
}
