import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectIssueType } from '../project/entities/projectIssueType.entity';

@Injectable()
export class ProjectIssueTypeRepository extends Repository<ProjectIssueType> {
  constructor(ds: DataSource) {
    super(ProjectIssueType, ds.createEntityManager());
  }

  async findWorkflow(projectId: string, issueTypeId: string) {
    return this.createQueryBuilder('pit')
      .innerJoinAndSelect('pit.workflow', 'wf')
      .innerJoin('pit.project', 'p')
      .innerJoin('pit.issueType', 'it')
      .where('p.id = :projectId', { projectId })
      .andWhere('it.id = :issueTypeId', { issueTypeId })
      .getOne();
  }
}
