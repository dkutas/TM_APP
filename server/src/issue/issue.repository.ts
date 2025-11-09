import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Issue } from './entities/issue.entity';

@Injectable()
export class IssueRepository extends Repository<Issue> {
  constructor(ds: DataSource) {
    super(Issue, ds.createEntityManager());
  }

  findOneWithCore(issueId: string) {
    return this.createQueryBuilder('i')
      .leftJoinAndSelect('i.status', 'st')
      .leftJoinAndSelect('i.project', 'p')
      .leftJoinAndSelect('i.issueType', 'it')
      .leftJoinAndSelect('i.priority', 'prio')
      .where('i.id = :issueId', { issueId })
      .getOne();
  }
}
