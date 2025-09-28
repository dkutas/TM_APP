import { Injectable } from '@nestjs/common';
import { CreateLinkTypeDto } from './dto/create-link-type.dto';
import { UpdateLinkTypeDto } from './dto/update-link-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkType } from './entities/link-type.entity';

@Injectable()
export class LinkTypeService {
  constructor(
    @InjectRepository(LinkType)
    private linkTypeRepository: Repository<LinkType>,
  ) {}

  create(createLinkTypeDto: CreateLinkTypeDto) {
    return this.linkTypeRepository.create(createLinkTypeDto);
  }

  findAll() {
    return this.linkTypeRepository.find();
  }

  findOne(id: string) {
    return this.linkTypeRepository.findOne({ where: { id } });
  }

  update(id: string, updateLinkTypeDto: UpdateLinkTypeDto) {
    return this.linkTypeRepository.update(id, updateLinkTypeDto);
  }

  remove(id: string) {
    return this.linkTypeRepository.delete(id);
  }
}
