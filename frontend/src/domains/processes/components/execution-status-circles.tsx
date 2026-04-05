import React from 'react';
import { cn } from '@/shared/utils/cn';
import { ExecutionStatus } from '../types';

interface ExecutionStatusCirclesProps {
  executions: ExecutionStatus[] | undefined;
  limit?: number;
}

export const ExecutionStatusCircles: React.FC<ExecutionStatusCirclesProps> = ({ 
  executions = [], 
  limit = 5 
}) => {
  // Pad the executions array to the limit
  // We want to show the dots from oldest (left) to newest (right)
  const paddedExecutions = Array.from({ length: limit }, (_, i) => executions[i]);

  return (
    <div className="flex items-center space-x-1.5" aria-label="Recent executions">
      {paddedExecutions.map((exec, idx) => {
        if (!exec) {
          return (
            <div 
              key={`empty-${idx}`}
              className="w-3 h-3 rounded-full border border-slate-700 bg-transparent"
              title="No execution"
            />
          );
        }

        return (
          <div
            key={exec.id}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              exec.status === 'completed' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
              exec.status === 'failed' && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
              exec.status === 'running' && "bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.3)]",
              exec.status === 'pending' && "bg-slate-500"
            )}
            title={`Execution #${exec.id}: ${exec.status}${exec.started_at ? ` at ${new Date(exec.started_at).toLocaleString()}` : ''}`}
          />
        );
      })}
    </div>
  );
};
