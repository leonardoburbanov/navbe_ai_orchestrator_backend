export interface Process {
  id: number;
  name: string;
  description?: string;
  steps: Step[];
  created_at: string;
}

export interface Step {
  type: 'shell' | 'python';
  command?: string;
  code?: string;
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
