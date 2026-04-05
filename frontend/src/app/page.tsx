'use client';

import { useState } from 'react';
import { Terminal, History } from 'lucide-react';
import { Header } from '@/shared/components/layout/header';
import { ProcessList } from '@/domains/processes/components/process-list';
import { ProcessDetails } from '@/domains/processes/components/process-details';
import { ProcessFormModal } from '@/domains/processes/components/process-form-modal';
import { ExecutionViewer } from '@/domains/executions/components/execution-viewer';
import { ExecutionHistoryTable } from '@/domains/executions/components/execution-history-table';
import { ScheduleModal } from '@/domains/schedules/components/ScheduleModal';
import { useProcesses } from '@/domains/processes/hooks/use-processes';
import { useExecutions, useAllExecutions } from '@/domains/executions/hooks/use-executions';
import { Process } from '@/domains/processes/types';
import { Execution } from '@/domains/executions/types';

export default function Home() {
  const { processes, addProcess, isLoading: isProcessesLoading } = useProcesses();
  const { startExecution } = useExecutions();
  const { executions: allExecutions, isLoading: isHistoryLoading } = useAllExecutions(20, 5000);

  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [runningExecution, setRunningExecution] = useState<Execution | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [schedulingProcess, setSchedulingProcess] = useState<Process | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(1000);
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');

  const handleRunProcess = async (processId: number) => {
    try {
      const execution = await startExecution(processId);
      setRunningExecution(execution);
    } catch (err) {
      // Error is handled in hook/service, but we could add a toast here
      console.error('Execution failed to start', err);
    }
  };

  const handleCreateProcess = async (newProcess: Partial<Process>) => {
    try {
      await addProcess(newProcess);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create process', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header 
          onNewProcess={() => setShowAddModal(true)} 
          view={view}
          onViewChange={setView}
        />

        {view === 'history' ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase text-xs tracking-wider">
              <History className="w-4 h-4 text-emerald-500" />
              <span>Global Execution History</span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <ExecutionHistoryTable 
                executions={allExecutions} 
                isLoading={isHistoryLoading} 
                onViewLogs={(execution) => {
                  setRunningExecution(execution);
                  setView('dashboard');
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <ProcessList 
              processes={processes} 
              selectedProcessId={selectedProcess?.id}
              onSelect={setSelectedProcess}
              onRun={handleRunProcess}
              onSchedule={setSchedulingProcess}
            />

            <section className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  <Terminal className="w-4 h-4" />
                  <span>Execution & Logs</span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 uppercase tracking-tighter font-bold">Refresh:</span>
                  <select 
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value={1000}>Real-time (1s)</option>
                    <option value={5000}>Normal (5s)</option>
                    <option value={10000}>Slow (10s)</option>
                    <option value={0}>Manual (Off)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl min-h-[500px] flex flex-col overflow-hidden shadow-2xl">
                {runningExecution ? (
                  <ExecutionViewer 
                    executionId={runningExecution.id} 
                    onComplete={() => setRunningExecution(null)}
                    refreshInterval={refreshInterval}
                  />
                ) : selectedProcess ? (
                  <ProcessDetails 
                    process={selectedProcess} 
                    onRun={() => handleRunProcess(selectedProcess.id)} 
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <Terminal className="w-16 h-16 opacity-20" />
                    <p>Select a process or start a new execution to view details</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        <ProcessFormModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onCreate={handleCreateProcess} 
        />

        {schedulingProcess && (
          <ScheduleModal
            isOpen={!!schedulingProcess}
            onClose={() => setSchedulingProcess(null)}
            processId={schedulingProcess.id}
            processName={schedulingProcess.name}
          />
        )}
      </div>
    </main>
  );
}
