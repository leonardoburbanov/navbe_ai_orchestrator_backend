import React, { useState } from 'react';
import { X, Clock, Plus, Trash2, Power } from 'lucide-react';
import { useProcessSchedules } from '../hooks/use-schedules';
import { cn } from '@/shared/utils/cn';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  processId: number;
  processName: string;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  processId,
  processName
}) => {
  const { 
    schedules, 
    isLoading, 
    addSchedule, 
    removeSchedule, 
    switchSchedule 
  } = useProcessSchedules(isOpen ? processId : null);

  const [expression, setExpression] = useState('');
  const [expressionType, setExpressionType] = useState<'cron' | 'interval'>('cron');

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expression) return;
    
    try {
      await addSchedule({
        process_id: processId,
        expression,
        expression_type: expressionType,
        params: {},
        is_active: true
      });
      setExpression('');
    } catch (err) {
      alert('Failed to add schedule. Check expression format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Schedules</span>
            </h2>
            <p className="text-sm text-slate-400">{processName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex bg-slate-800/50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setExpressionType('cron')}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                  expressionType === 'cron' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Cron
              </button>
              <button
                type="button"
                onClick={() => setExpressionType('interval')}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                  expressionType === 'interval' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Interval
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {expressionType === 'cron' ? 'Cron Expression (e.g. */5 * * * *)' : 'Interval in Seconds (e.g. 60)'}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder={expressionType === 'cron' ? "*/5 * * * *" : "60"}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={!expression}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Schedules</h3>
            {isLoading ? (
              <div className="text-center py-4 text-slate-500 text-sm">Loading...</div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
                No schedules defined for this process.
              </div>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <div className="text-sm font-medium flex items-center space-x-2">
                        <span className="text-blue-400">{schedule.expression}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 uppercase font-bold tracking-tighter">
                          {schedule.expression_type}
                        </span>
                      </div>
                      {schedule.next_run_at && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Next run: {new Date(schedule.next_run_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => switchSchedule(schedule.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          schedule.is_active ? "text-green-400 hover:bg-green-400/10" : "text-slate-500 hover:bg-slate-800"
                        )}
                        title={schedule.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeSchedule(schedule.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
