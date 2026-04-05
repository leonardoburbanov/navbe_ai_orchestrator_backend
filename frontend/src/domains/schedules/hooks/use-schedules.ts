import useSWR from 'swr';
import { 
  getProcessSchedules, 
  createSchedule, 
  deleteSchedule, 
  toggleSchedule,
  Schedule 
} from '../services/schedule-service';

export function useProcessSchedules(processId: number | null) {
  const { 
    data: schedules, 
    error, 
    mutate, 
    isLoading 
  } = useSWR(
    processId ? `schedules-${processId}` : null, 
    () => processId ? getProcessSchedules(processId) : []
  );

  const addSchedule = async (newSchedule: Omit<Schedule, 'id'>) => {
    try {
      const res = await createSchedule(newSchedule);
      await mutate();
      return res;
    } catch (err) {
      console.error('Failed to create schedule', err);
      throw err;
    }
  };

  const removeSchedule = async (scheduleId: number) => {
    try {
      await deleteSchedule(scheduleId);
      await mutate();
    } catch (err) {
      console.error('Failed to delete schedule', err);
      throw err;
    }
  };

  const switchSchedule = async (scheduleId: number) => {
    try {
      await toggleSchedule(scheduleId);
      await mutate();
    } catch (err) {
      console.error('Failed to toggle schedule', err);
      throw err;
    }
  };

  return {
    schedules: schedules || [],
    isLoading,
    error,
    mutate,
    addSchedule,
    removeSchedule,
    switchSchedule
  };
}
