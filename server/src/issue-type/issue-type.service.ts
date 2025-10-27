import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async create(createIssueTypeDto: CreateIssueTypeDto) {
    const issueType = await this.issueTypeRepository.findOne({
      where: { key: createIssueTypeDto.key },
    });
    if (issueType) {
      throw new HttpException(
        { message: 'IssueType already exists' },
        HttpStatus.CONFLICT,
      );
    }
    return this.issueTypeRepository.save(
      this.issueTypeRepository.create(createIssueTypeDto),
    );
  }

  findAll() {
    return this.issueTypeRepository.find({ order: { name: 1 } });
  }

  findOne(id: string) {
    return this.issueTypeRepository.findOne({ where: { id } });
  }

  async update(id: string, updateIssueTypeDto: UpdateIssueTypeDto) {
    if (!(await this.issueTypeRepository.findOne({ where: { id } }))) {
      throw new HttpException(
        `No IssueType exist with ID: ${id}`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return this.issueTypeRepository.update(id, updateIssueTypeDto);
  }

  remove(id: string) {
    return this.issueTypeRepository.delete(id);
  }
}
