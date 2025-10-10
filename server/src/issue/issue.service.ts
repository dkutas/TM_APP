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
    return this.issueRepository.find({
      relations: ['status', 'assignee', 'reporter', 'project'],
    });
  }

  findOne(id: string) {
    return this.issueRepository.findOne({
      where: { id },
      relations: ['status'],
    });
  }

  update(id: string, updateIssueDto: UpdateIssueDto) {
    return this.issueRepository.update(id, updateIssueDto);
  }

  remove(id: string) {
    return this.issueRepository.delete(id);
  }

  transition(id: string, statusId: string) {
    // Implement the logic to transition the issue to a new status
    console.log(statusId);
    return this.issueRepository.update(id, { status: { id: statusId } });
  }

  getComments(id: string) {
    return this.issueRepository.find({
      where: { id: id },
      relations: ['comments'],
    });
  }

  //Todo
  setValue(id: string, fieldKey: string, value: any) {
    // Implement the logic to set a specific field value of the issue
    // return this.issueRepository.update(id, { [fieldKey]: value });
  }
}
