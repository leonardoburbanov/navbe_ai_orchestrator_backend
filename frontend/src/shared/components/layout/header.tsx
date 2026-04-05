import React from 'react';
import { Plus, History, LayoutDashboard } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import Image from 'next/image';

interface HeaderProps {
  onNewProcess: () => void;
  view: 'dashboard' | 'history';
  onViewChange: (view: 'dashboard' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewProcess, view, onViewChange }) => {
  return (
    <header className="flex justify-between items-center border-b border-slate-800 pb-6">
      <div className="flex items-center space-x-4 text-left">
        <div className="bg-white p-2 px-3 rounded-xl shadow-lg shadow-white/5 cursor-pointer hover:scale-105 transition-all" onClick={() => onViewChange('dashboard')}>
          <Image src="/navbe-icon.svg" alt="Navbe Logo" width={112} height={40} className="h-8 w-auto" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navbe AI Orchestrator</h1>
          <p className="text-xs text-slate-400 font-medium">Local AI-compatible process management</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex bg-slate-900/50 border border-slate-800 p-1 rounded-xl mr-2">
          <button 
            onClick={() => onViewChange('dashboard')}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold uppercase tracking-wider",
              view === 'dashboard' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => onViewChange('history')}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold uppercase tracking-wider",
              view === 'history' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        <button 
          onClick={onNewProcess}
          className="flex items-center space-x-2 bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Process</span>
        </button>
      </div>
    </header>
  );
};
