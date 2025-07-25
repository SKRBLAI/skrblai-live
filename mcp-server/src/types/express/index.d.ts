import { OrchestrationService } from '../../services/orchestrationService';
import { QueueService } from '../../services/queueService';
import { WorkflowService } from '../../services/workflowService';

declare global {
  namespace Express {
    export interface Request {
      id: string;
      services: {
        orchestration: OrchestrationService;
        queue: QueueService;
        workflow: WorkflowService;
      };
    }
  }
}
