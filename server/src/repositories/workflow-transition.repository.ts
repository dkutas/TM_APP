// repositories/workflow-transition.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { WorkflowTransition } from '../workflow/entities/workflow-transition.entity';

@Injectable()
export class WorkflowTransitionRepository extends Repository<WorkflowTransition> {
  constructor(ds: DataSource) {
    super(WorkflowTransition, ds.createEntityManager());
  }

  /**
   * Egy adott workflow-ban a megadott fromStatus-ból induló transition-ök.
   */
  findForWorkflowAndFromStatus(workflowId: string, fromStatusId: string) {
    return this.createQueryBuilder('t')
      .innerJoinAndSelect('t.fromStatus', 'from')
      .innerJoinAndSelect('t.toStatus', 'to')
      .innerJoin('t.workflow', 'wf')
      .where('wf.id = :workflowId', { workflowId })
      .andWhere('from.id = :fromStatusId', { fromStatusId })
      .orderBy('t.name', 'ASC')
      .getMany();
  }
}
