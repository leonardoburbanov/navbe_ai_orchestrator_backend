export interface Execution {
  id: number;
  process_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  finished_at?: string;
  logs: string;
  progress: number;
}
