import useSWR from 'swr';
import { getProcesses, createProcess } from '../services/process-service';
import { Process } from '../types';

export function useProcesses() {
  const { data: processes, error, mutate, isLoading } = useSWR('processes', getProcesses);

  const addProcess = async (newProcess: Partial<Process>) => {
    try {
      const res = await createProcess(newProcess);
      await mutate();
      return res;
    } catch (err) {
      console.error('Failed to create process', err);
      throw err;
    }
  };

  return {
    processes: processes || [],
    isLoading,
    error,
    mutate,
    addProcess
  };
}
