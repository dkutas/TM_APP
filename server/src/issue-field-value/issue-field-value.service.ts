import { Injectable } from '@nestjs/common';
import { CreateIssueFieldValueDto } from './dto/create-issue-field-value.dto';
import { UpdateIssueFieldValueDto } from './dto/update-issue-field-value.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IssueFieldValue } from './entities/issue-field-value.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IssueFieldValueService {
  constructor(
    @InjectRepository(IssueFieldValue)
    private issueFieldValueRepository: Repository<IssueFieldValue>,
  ) {}
  create(createIssueFieldValueDto: CreateIssueFieldValueDto) {
    return this.issueFieldValueRepository.create(createIssueFieldValueDto);
  }

  findAll() {
    return this.issueFieldValueRepository.find();
  }

  findOne(id: string) {
    return this.issueFieldValueRepository.findOne({ where: { id } });
  }

  update(id: string, updateIssueFieldValueDto: UpdateIssueFieldValueDto) {
    return this.issueFieldValueRepository.update(id, updateIssueFieldValueDto);
  }

  remove(id: string) {
    return this.issueFieldValueRepository.delete(id);
  }
}
