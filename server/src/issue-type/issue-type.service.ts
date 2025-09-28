import { Injectable } from '@nestjs/common';
import { CreateIssueTypeDto } from './dto/create-issue-type.dto';
import { UpdateIssueTypeDto } from './dto/update-issue-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueType } from './entities/issue-type.entity';

@Injectable()
export class IssueTypeService {
  constructor(
    @InjectRepository(IssueType)
    private readonly issueTypeRepository: Repository<IssueType>,
  ) {}

  create(createIssueTypeDto: CreateIssueTypeDto) {
    return this.issueTypeRepository.create(createIssueTypeDto);
  }

  findAll() {
    return this.issueTypeRepository.find();
  }

  findOne(id: string) {
    return this.issueTypeRepository.findOne({ where: { id } });
  }

  update(id: string, updateIssueTypeDto: UpdateIssueTypeDto) {
    return this.issueTypeRepository.update(id, updateIssueTypeDto);
  }

  remove(id: string) {
    return this.issueTypeRepository.delete(id);
  }
}
