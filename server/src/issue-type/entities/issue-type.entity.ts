import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issueType')
export class IssueType {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() key: string;
  @Column({ length: 255, nullable: true }) description: string;
}
