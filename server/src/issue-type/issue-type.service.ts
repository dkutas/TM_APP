import { Injectable } from '@nestjs/common';
import { CreateIssueTypeDto } from './dto/create-issue-type.dto';
import { UpdateIssueTypeDto } from './dto/update-issue-type.dto';

@Injectable()
export class IssueTypeService {
  create(createIssueTypeDto: CreateIssueTypeDto) {
    return 'This action adds a new issueType';
  }

  findAll() {
    return `This action returns all issueType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} issueType`;
  }

  update(id: number, updateIssueTypeDto: UpdateIssueTypeDto) {
    return `This action updates a #${id} issueType`;
  }

  remove(id: number) {
    return `This action removes a #${id} issueType`;
  }
}
