import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workflow } from './entities/workflow.entity';
import { Repository } from 'typeorm';
import { ProjectIssueType } from '../project/entities/projectIssueType.entity';
import { WorkflowStatus } from './entities/workflow-status.entity';
import { WorkflowTransition } from './entities/workflow-transition.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowStatus)
    private readonly workflowStatusRepository: Repository<WorkflowStatus>,
    @InjectRepository(WorkflowTransition)
    private readonly workflowTransitionRepository: Repository<WorkflowTransition>,
    @InjectRepository(ProjectIssueType)
    private readonly projectIssueTypeRepository: Repository<ProjectIssueType>,
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto) {
    const workflow = await this.workflowRepository.save({
      name: createWorkflowDto.name,
      description: createWorkflowDto.description,
    });

    const { statuses, transitions } = createWorkflowDto;

    for (const status of statuses || []) {
      await this.workflowStatusRepository.save({
        ...status,
        position: { ...status.position },
        workflow: { id: workflow.id },
      });
    }

    for (const transition of transitions || []) {
      await this.workflowTransitionRepository.save({
        id: transition.id,
        name: transition.name,
        fromStatus: { id: transition.fromStatusId },
        toStatus: { id: transition.toStatusId },
        workflow: { id: workflow.id },
      });
    }

    return workflow;
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

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    const { statuses, transitions } = updateWorkflowDto;

    for (const status of statuses || []) {
      await this.workflowStatusRepository.save({
        ...status,
        position: { ...status.position },
        workflow: { id: id },
      });
    }

    for (const transition of transitions || []) {
      await this.workflowTransitionRepository.save({
        id: transition.id,
        name: transition.name,
        fromStatus: { id: transition.fromStatusId },
        toStatus: { id: transition.toStatusId },
        workflow: { id: id },
      });
    }

    return this.workflowRepository.save({
      id: id,
      name: updateWorkflowDto.name,
      description: updateWorkflowDto.description,
    });
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
