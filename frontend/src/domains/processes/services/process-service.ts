import { apiClient } from '@/shared/lib/api-client';
import { Process } from '../types';

export const getProcesses = async (): Promise<Process[]> => {
  const { data } = await apiClient.get('/processes');
  return data;
};

export const createProcess = async (process: Partial<Process>): Promise<Process> => {
  const { data } = await apiClient.post('/processes', process);
  return data;
};
