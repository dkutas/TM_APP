// src/links/link-type.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LinkCategory } from '../../common/enums';

@Entity('link_types')
export class LinkType {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 80 }) name: string;
  @Column({ type: 'enum', enum: LinkCategory }) category: LinkCategory;
  @Column({ default: false }) directed: boolean;
  @Column({ length: 40 }) inwardLabel: string;
  @Column({ length: 40 }) outwardLabel: string;
  @Column({ default: true }) allowsCycles: boolean;
}
