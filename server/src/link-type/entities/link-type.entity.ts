import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum LinkCategory {
  HIERARCHY = 'parent-child',
  RELATES = 'relates',
  BLOCKS = 'blocks',
  DUPLICATES = 'duplicates',
}

@Entity('linkType')
export class LinkType {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() inward_label: string;
  @Column('enum', { enum: LinkCategory }) category: LinkCategory;
  @Column() outward_label: string;
  @Column() directed: boolean;
}
