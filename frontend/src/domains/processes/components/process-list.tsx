import React from 'react';
import { List } from 'lucide-react';
import { Process } from '../types';
import { ProcessCard } from './process-card';

interface ProcessListProps {
  processes: Process[];
  selectedProcessId?: number;
  onSelect: (process: Process) => void;
  onRun: (processId: number) => void;
  onSchedule: (process: Process) => void;
}

export const ProcessList: React.FC<ProcessListProps> = ({ 
  processes, 
  selectedProcessId, 
  onSelect, 
  onRun,
  onSchedule
}) => {
  return (
    <section className="md:col-span-1 space-y-4">
      <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
        <List className="w-3.5 h-3.5" />
        <span>Processes</span>
      </div>
      
      <div className="space-y-3">
        {processes.map((p) => (
          <ProcessCard 
            key={p.id}
            process={p}
            isSelected={selectedProcessId === p.id}
            onSelect={onSelect}
            onRun={onRun}
            onSchedule={onSchedule}
          />
        ))}
        {processes.length === 0 && (
          <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl text-slate-500">
            No processes found. Create one to get started.
          </div>
        )}
      </div>
    </section>
  );
};
