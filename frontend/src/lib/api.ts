import axios from 'axios';
import { Process, Execution } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

const api = axios.create({
  baseURL: API_URL,
});

export const getProcesses = async (): Promise<Process[]> => {
  const { data } = await api.get('/processes');
  return data;
};

export const createProcess = async (process: Partial<Process>): Promise<Process> => {
  const { data } = await api.post('/processes', process);
  return data;
};

export const createExecution = async (processId: number, params?: Record<string, any>): Promise<Execution> => {
  const { data } = await api.post('/executions', params, { params: { process_id: processId } });
  return data;
};

export const getExecution = async (executionId: number): Promise<Execution> => {
  const { data } = await api.get(`/executions/${executionId}`);
  return data;
};

export const getProcessExecutions = async (processId: number): Promise<Execution[]> => {
  const { data } = await api.get(`/processes/${processId}/executions`);
  return data;
};
