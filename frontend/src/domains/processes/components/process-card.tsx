import React from 'react';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Process } from '../types';
import { ExecutionStatusCircles } from './execution-status-circles';

interface ProcessCardProps {
  process: Process;
  isSelected: boolean;
  onSelect: (process: Process) => void;
  onRun: (processId: number) => void;
  onSchedule: (process: Process) => void;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ 
  process, 
  isSelected, 
  onSelect, 
  onRun,
  onSchedule
}) => {
  return (
    <div 
      onClick={() => onSelect(process)}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
        isSelected 
          ? "bg-slate-900 border-white/50 ring-1 ring-white/20" 
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-base">{process.name}</h3>
        <div className="flex items-center space-x-1">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onSchedule(process); 
            }}
            className="p-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Schedule Process"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onRun(process.id); 
            }}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Run Process"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {process.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Recent Runs</span>
          <ExecutionStatusCircles executions={process.recent_executions} />
        </div>
        
        {process.recent_executions && 
         process.recent_executions.length > 0 && 
         process.recent_executions[process.recent_executions.length - 1].started_at && (
          <span className="text-[10px] text-slate-500 font-medium">
            Last: {new Date(process.recent_executions[process.recent_executions.length - 1].started_at!).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};
