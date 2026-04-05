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
          <h2 className="text-3xl font-bold mb-2">{process.name}</h2>
          <p className="text-slate-400 text-lg">{process.description || "No description provided."}</p>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Configured Steps</h4>
          <div className="space-y-2">
            {process.steps.map((step, i) => (
              <div key={i} className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-600 font-mono text-sm">{i + 1}.</span>
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{step.type}</span>
                <code className="text-slate-300 text-sm truncate">
                  {step.type === 'resend' ? `From: ${step.from_email || 'onboarding@resend.dev'} | To: ${step.to}` : (step.command || step.code)}
                </code>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={onRun}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/10"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch Process Now</span>
        </button>
      </div>
    </div>
  );
};
