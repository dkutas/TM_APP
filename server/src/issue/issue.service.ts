import { Injectable } from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
  ) {}

  create(createIssueDto: CreateIssueDto) {
    return this.issueRepository.create(createIssueDto);
  }

  findAll() {
    return this.issueRepository.find();
  }

  findOne(id: string) {
    return this.issueRepository.findOne({ where: { id: id } });
  }

  update(id: string, updateIssueDto: UpdateIssueDto) {
    return this.issueRepository.update(id, updateIssueDto);
  }

  remove(id: string) {
    return this.issueRepository.delete(id);
  }
}
