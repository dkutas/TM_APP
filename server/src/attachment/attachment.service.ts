import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from '../issue/entities/issue.entity';
import { User } from '../user/entities/user.entity';
import { join } from 'path';
import * as fs from 'node:fs';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  create(createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentRepository.create(createAttachmentDto);
  }

  async listByIssue(issueId: string) {
    return this.attachmentRepository.find({
      where: { issue: { id: issueId } },
      order: { createdAt: 'DESC' },
    });
  }

  async createForIssue(params: {
    issueId: string;
    uploaderId: string;
    storedFiles: Array<{
      originalName: string;
      mimeType: string;
      size: number;
      relativeUrl: string; // /files/issues/<issueId>/<storedFileName>
    }>;
  }) {
    const issue = await this.issueRepository.findOne({
      where: { id: params.issueId },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    const uploader = await this.userRepo.findOne({
      where: { id: params.uploaderId },
    });
    if (!uploader) throw new NotFoundException('Uploader not found');

    const entities = params.storedFiles.map((f) =>
      this.attachmentRepository.create({
        issue,
        uploader,
        fileName: f.originalName,
        mimeType: f.mimeType,
        size: f.size.toString(),
        url: f.relativeUrl,
      }),
    );
    return this.attachmentRepository.save(entities);
  }

  async remove(id: string) {
    const a = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['issue'],
    });
    if (!a) throw new NotFoundException('Attachment not found');

    // lokális fájl törlése (best-effort)
    const absRoot = join(process.cwd(), 'uploads');
    const fileRel = a.url.replace(/^\/files\//, ''); // issues/...
    const absPath = join(absRoot, fileRel);
    fs.rm(absPath, (err) => {
      if (err) {
        console.error(
          `Failed to delete attachment file at ${absPath}: ${err.message}`,
        );
      }
    });

    await this.attachmentRepository.remove(a);
    return { ok: true };
  }

  findAll() {
    return this.attachmentRepository.find();
  }

  findOne(id: string) {
    return this.attachmentRepository.findOne({ where: { id } });
  }
}
