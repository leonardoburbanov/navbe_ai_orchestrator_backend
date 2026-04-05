import { apiClient } from '@/shared/lib/api-client';

export interface Schedule {
  id: number;
  process_id: number;
  expression: string;
  expression_type: 'cron' | 'interval';
  params: Record<string, any>;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
}

export const getProcessSchedules = async (processId: number): Promise<Schedule[]> => {
  const { data } = await apiClient.get(`/processes/${processId}/schedules`);
  return data;
};

export const createSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
  const { data } = await apiClient.post('/schedules', schedule);
  return data;
};

export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  await apiClient.delete(`/schedules/${scheduleId}`);
};

export const toggleSchedule = async (scheduleId: number): Promise<Schedule> => {
  const { data } = await apiClient.patch(`/schedules/${scheduleId}/toggle`);
  return data;
};
