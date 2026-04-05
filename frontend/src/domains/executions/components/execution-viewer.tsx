import React, { useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useExecutionPolling } from '../hooks/use-executions';

interface ExecutionViewerProps {
  executionId: number;
  onComplete: () => void;
  refreshInterval?: number;
}

export const ExecutionViewer: React.FC<ExecutionViewerProps> = ({ 
  executionId, 
  onComplete,
  refreshInterval
}) => {
  const { execution } = useExecutionPolling(executionId, refreshInterval);

  useEffect(() => {
    if (execution?.status === 'completed' || execution?.status === 'failed') {
      // Keep it visible for a moment then allow onComplete
    }
  }, [execution]);

  if (!execution) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {execution.status === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
          {execution.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          {execution.status === 'failed' && <XCircle className="w-5 h-5 text-rose-500" />}
          <span className="font-bold">Execution #{execution.id}</span>
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            execution.status === 'running' ? "bg-blue-500/20 text-blue-400" :
            execution.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
            "bg-rose-500/20 text-rose-400"
          )}>{execution.status}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-32 bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${execution.progress}%` }}></div>
          </div>
          <button onClick={onComplete} className="text-slate-400 hover:text-white text-sm">Close</button>
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-xs bg-slate-950 overflow-y-auto max-h-[500px]">
        {execution.logs ? (
          <pre className="whitespace-pre-wrap">{execution.logs}</pre>
        ) : (
          <p className="text-slate-600 italic">No logs available yet...</p>
        )}
      </div>
    </div>
  );
};
