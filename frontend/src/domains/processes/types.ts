export interface ExecutionStatus {
  id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
}

export interface Process {
  id: number;
  name: string;
  description?: string;
  steps: Step[];
  created_at: string;
  recent_executions?: ExecutionStatus[];
}

export interface Step {
  type: 'shell' | 'python' | 'resend';
  command?: string;
  code?: string;
  to?: string;
  from_email?: string;
  subject?: string;
  body?: string;
}
