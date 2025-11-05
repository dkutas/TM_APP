import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workflow } from './entities/workflow.entity';
import { Repository } from 'typeorm';
import { ProjectIssueType } from '../project/entities/projectIssueType.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(ProjectIssueType)
    private readonly projectIssueTypeRepository: Repository<ProjectIssueType>,
  ) {}

  create(createWorkflowDto: CreateWorkflowDto) {
    return this.workflowRepository.save(createWorkflowDto);
  }

  findAll() {
    return this.workflowRepository.find();
  }

  findOne(id: string) {
    return this.workflowRepository.findOne({
      where: { id },
      relations: {
        statuses: true,
        transitions: { fromStatus: true, toStatus: true },
      },
    });
  }

  update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowRepository.update(id, updateWorkflowDto);
  }

  remove(id: string) {
    return this.workflowRepository.delete(id);
  }

  getStatuses(id: string) {
    return this.workflowRepository.findOne({
      where: { id },
      relations: ['statuses'],
    });
  }

  async findByProjectAndIssueType(projectId: string, issueTypeId: string) {
    const pitWorkflow = await this.projectIssueTypeRepository
      .createQueryBuilder('pit')
      .leftJoinAndSelect('pit.workflow', 'workflow')
      .leftJoinAndSelect('workflow.statuses', 'statuses')
      .leftJoinAndSelect('workflow.transitions', 'transitions')
      .leftJoinAndSelect('transitions.fromStatus', 'fromStatus')
      .leftJoinAndSelect('transitions.toStatus', 'toStatus')
      .where('pit.project = :projectId', { projectId })
      .andWhere('pit.issue_type_id = :issueTypeId', { issueTypeId })
      .getOne();
    return pitWorkflow?.workflow ?? null;
  }

  getTransitions(id: string) {
    return this.workflowRepository.findOne({
      where: { id },
      relations: ['transitions'],
    });
  }

  getTransitionsForStatus(id: string, statusId: string) {
    return this.workflowRepository
      .createQueryBuilder('workflow')
      .leftJoinAndSelect('workflow.transitions', 'transition')
      .where('workflow.id = :id', { id })
      .andWhere('transition.from_status_id = :statusId', { statusId })
      .getOne();
  }
}
