import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachment')
export class Attachment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') issue_id: string;
  @Column('uuid') uploader_id: string;
  @Column('varchar', { length: 255 }) filename: string;
  @Column('varchar', { length: 100 }) mime_type: string;
  @Column('bigint') size: number;
  @Column('varchar', { length: 500 }) url: string;
  @Column('timestamp') uploaded_at: Date;
}
