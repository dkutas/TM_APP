import { WorkflowStatus } from '../entities/workflow-status.entity';
import { WorkflowTransition } from '../entities/workflow-transition.entity';

export class UpdateWorkflowDto {
  name: string;
  description?: string;
  statuses: Array<
    Pick<
      WorkflowStatus,
      'id' | 'key' | 'name' | 'isTerminal' | 'category' | 'position'
    >
  >;
  transitions: Array<
    Pick<WorkflowTransition, 'id' | 'name'> & {
      fromStatusId: string;
      toStatusId: string;
    }
  >;
}
