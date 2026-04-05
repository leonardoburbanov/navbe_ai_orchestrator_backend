import { apiClient } from '@/shared/lib/api-client';
import { Execution } from '../types';

export const createExecution = async (processId: number, params?: Record<string, unknown>): Promise<Execution> => {
  const { data } = await apiClient.post('/executions', params, { params: { process_id: processId } });
  return data;
};

export const getExecution = async (executionId: number): Promise<Execution> => {
  const { data } = await apiClient.get(`/executions/${executionId}`);
  return data;
};

export const getProcessExecutions = async (processId: number): Promise<Execution[]> => {
  const { data } = await apiClient.get(`/processes/${processId}/executions`);
  return data;
};

export interface GlobalExecution extends Execution {
  process_name: string;
}

export const getAllExecutions = async (limit: number = 20): Promise<GlobalExecution[]> => {
  const { data } = await apiClient.get('/executions', { params: { limit } });
  return data;
};
