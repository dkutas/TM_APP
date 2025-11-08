import {
  WorkflowStatus,
  WorkflowTransition,
} from '../entities/workflow.entity';

export class CreateWorkflowDto {
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
