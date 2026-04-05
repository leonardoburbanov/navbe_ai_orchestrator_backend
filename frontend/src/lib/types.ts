export interface Process {
  id: number;
  name: string;
  description?: string;
  steps: Step[];
  created_at: string;
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

export interface Execution {
  id: number;
  process_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  finished_at?: string;
  logs: string;
  progress: number;
}
