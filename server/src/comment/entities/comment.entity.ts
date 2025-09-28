import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') issue_id: string;
  @Column('uuid') author_id: string;
  @Column('text') content: string;
  @Column('timestamp') created_at: Date;
  @Column('timestamp') updated_at: Date;
}
