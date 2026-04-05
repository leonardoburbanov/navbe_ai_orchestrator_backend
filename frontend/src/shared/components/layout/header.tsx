import React from 'react';
import { Activity, Plus, History, LayoutDashboard } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface HeaderProps {
  onNewProcess: () => void;
  view: 'dashboard' | 'history';
  onViewChange: (view: 'dashboard' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewProcess, view, onViewChange }) => {
  return (
    <header className="flex justify-between items-center border-b border-slate-800 pb-6">
      <div className="flex items-center space-x-4 text-left">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-110 transition-all" onClick={() => onViewChange('dashboard')}>
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Navbe AI Orchestrator</h1>
          <p className="text-slate-400">Local AI-compatible process management</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mr-2">
          <button 
            onClick={() => onViewChange('dashboard')}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
              view === 'dashboard' ? "bg-slate-800 text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => onViewChange('history')}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
              view === 'history' ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>

        <button 
          onClick={onNewProcess}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/10"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Process</span>
        </button>
      </div>
    </header>
  );
};
