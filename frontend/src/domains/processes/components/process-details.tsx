import React from 'react';
import { Play } from 'lucide-react';
import { Process } from '../types';

interface ProcessDetailsProps {
  process: Process;
  onRun: () => void;
}

export const ProcessDetails: React.FC<ProcessDetailsProps> = ({ process, onRun }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{process.name}</h2>
          <p className="text-slate-400 text-base leading-relaxed">{process.description || "No description provided."}</p>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Configured Steps</h4>
          <div className="space-y-2">
            {process.steps.map((step, i) => (
              <div key={i} className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-600 font-mono text-xs">{i + 1}.</span>
                <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">{step.type}</span>
                <code className="text-slate-300 text-xs truncate font-mono">
                  {step.type === 'resend' ? `From: ${step.from_email || 'onboarding@resend.dev'} | To: ${step.to}` : (step.command || step.code)}
                </code>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={onRun}
          className="flex items-center space-x-2 bg-white hover:bg-slate-200 text-black px-6 py-3 rounded-xl transition-all text-sm font-bold shadow-lg shadow-white/5"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Process Now</span>
        </button>
      </div>
    </div>
  );
};
