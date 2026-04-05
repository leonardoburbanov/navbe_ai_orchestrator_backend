import useSWR from 'swr';
import { createExecution, getExecution, getAllExecutions } from '../services/execution-service';

export function useExecutions() {
  const startExecution = async (processId: number) => {
    try {
      const execution = await createExecution(processId);
      return execution;
    } catch (err) {
      console.error('Failed to start process', err);
      throw err;
    }
  };

  return {
    startExecution
  };
}

export function useAllExecutions(limit: number = 20, refreshInterval: number = 5000) {
  const { data: executions, mutate, error, isLoading } = useSWR(
    ['all-executions', limit],
    () => getAllExecutions(limit),
    {
      refreshInterval
    }
  );

  return {
    executions: executions || [],
    mutate,
    error,
    isLoading
  };
}

export function useExecutionPolling(executionId: number | null, customRefreshInterval?: number) {
  const { data: execution, mutate, error } = useSWR(
    executionId ? `execution-${executionId}` : null,
    () => executionId ? getExecution(executionId) : null,
    {
      refreshInterval: executionId ? (customRefreshInterval ?? 1000) : 0
    }
  );

  return {
    execution,
    mutate,
    error
  };
}
