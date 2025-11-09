import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Attachment } from '../attachment/entities/attachment.entity';

@Injectable()
export class AttachmentRepository extends Repository<Attachment> {
  constructor(ds: DataSource) {
    super(Attachment, ds.createEntityManager());
  }

  findByIssue(issueId: string) {
    return this.createQueryBuilder('a')
      .leftJoinAndSelect('a.issue', 'i')
      .leftJoinAndSelect('a.uploader', 'u')
      .where('i.id = :issueId', { issueId })
      .orderBy('a.createdAt', 'ASC')
      .getMany();
  }

  add(p: {
    issueId: string;
    uploadedBy: string;
    fileName: string;
    mimeType: string;
    size: number;
    storageKey: string;
  }) {
    const { issueId, uploadedBy, fileName, mimeType, size, storageKey } = p;
    return this.save(
      this.create({
        issue: { id: issueId },
        uploader: { id: uploadedBy },
        fileName,
        mimeType,
        size: String(size),
        url: storageKey,
      }),
    );
  }

  removeAttachment(id: string) {
    return this.delete(id);
  }
}
