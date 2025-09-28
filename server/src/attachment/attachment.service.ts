import { Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  create(createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentRepository.create(createAttachmentDto);
  }

  findAll() {
    return this.attachmentRepository.find();
  }

  findOne(id: string) {
    return this.attachmentRepository.findOne({ where: { id } });
  }

  update(id: string, updateAttachmentDto: UpdateAttachmentDto) {
    return this.attachmentRepository.update(id, updateAttachmentDto);
  }

  remove(id: string) {
    return this.attachmentRepository.delete(id);
  }
}
