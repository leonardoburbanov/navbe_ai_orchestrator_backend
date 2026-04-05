import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { GlobalExecution } from '../services/execution-service';

interface ExecutionHistoryTableProps {
  executions: GlobalExecution[];
  isLoading: boolean;
  onViewLogs: (execution: GlobalExecution) => void;
}

export const ExecutionHistoryTable: React.FC<ExecutionHistoryTableProps> = ({ 
  executions, 
  isLoading, 
  onViewLogs 
}) => {
  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return '-';
    
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Process</th>
            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Started</th>
            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</th>
            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Progress</th>
            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {executions.map((execution) => (
            <tr key={execution.id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  {execution.status === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                  {execution.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  {execution.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                  {execution.status === 'pending' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    execution.status === 'running' ? "text-white" :
                    execution.status === 'completed' ? "text-emerald-400" :
                    execution.status === 'failed' ? "text-rose-400" :
                    "text-slate-500"
                  )}>
                    {execution.status}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{execution.process_name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">#{execution.id}</span>
                </div>
              </td>
              <td className="p-4 text-[11px] text-slate-400 font-medium">
                {formatDate(execution.started_at)}
              </td>
              <td className="p-4 text-[11px] text-slate-400 font-mono font-medium">
                {formatDuration(execution.started_at, execution.finished_at)}
              </td>
              <td className="p-4">
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      execution.status === 'failed' ? "bg-rose-600" : "bg-white"
                    )}
                    style={{ width: `${execution.progress}%` }}
                  ></div>
                </div>
              </td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => onViewLogs(execution)}
                  className="p-1.5 bg-slate-800 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-white/50 shadow-sm"
                  title="View Logs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
          {executions.length === 0 && !isLoading && (
            <tr>
              <td colSpan={6} className="p-12 text-center text-slate-500">
                <div className="flex flex-col items-center space-y-2">
                  <Clock className="w-8 h-8 opacity-20" />
                  <p>No executions found.</p>
                </div>
              </td>
            </tr>
          )}
          {isLoading && executions.length === 0 && (
            <tr>
              <td colSpan={6} className="p-12 text-center">
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
