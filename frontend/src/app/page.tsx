'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getProcesses, createExecution, createProcess, getExecution } from '../lib/api';
import { Process, Execution } from '../lib/types';
import { Play, Plus, List, Activity, Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { data: processes, error, mutate } = useSWR('processes', getProcesses);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [runningExecution, setRunningExecution] = useState<Execution | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProcess, setNewProcess] = useState({ name: '', description: '', steps: [{ type: 'shell', command: 'echo "Hello from Navbe AI"' }] });

  const handleStartProcess = async (processId: number) => {
    try {
      const execution = await createExecution(processId);
      setRunningExecution(execution);
      mutate();
    } catch (err) {
      console.error('Failed to start process', err);
    }
  };

  const handleCreateProcess = async () => {
    try {
      await createProcess(newProcess as any);
      mutate();
      setShowAddModal(false);
      setNewProcess({ name: '', description: '', steps: [{ type: 'shell', command: 'echo "Hello from Navbe AI"' }] });
    } catch (err) {
      console.error('Failed to create process', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Navbe AI Orchestrator</h1>
              <p className="text-slate-400">Local AI-compatible process management</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-5 h-5" />
            <span>New Process</span>
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Process List */}
          <section className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase text-xs tracking-wider">
              <List className="w-4 h-4" />
              <span>Processes</span>
            </div>
            
            <div className="space-y-3">
              {processes?.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProcess(p)}
                  className={clsx(
                    "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                    selectedProcess?.id === p.id 
                      ? "bg-slate-900 border-blue-500/50 ring-1 ring-blue-500/20" 
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStartProcess(p.id); }}
                      className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg text-blue-400 transition-colors"
                      title="Run Process"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{p.description || "No description provided."}</p>
                </div>
              ))}
              {processes?.length === 0 && (
                <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl text-slate-500">
                  No processes found. Create one to get started.
                </div>
              )}
            </div>
          </section>

          {/* Details / Logs Area */}
          <section className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase text-xs tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>Execution & Logs</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl min-h-[500px] flex flex-col overflow-hidden shadow-2xl">
              {runningExecution ? (
                <ExecutionViewer executionId={runningExecution.id} onComplete={() => setRunningExecution(null)} />
              ) : selectedProcess ? (
                <ProcessDetails process={selectedProcess} onRun={() => handleStartProcess(selectedProcess.id)} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Terminal className="w-16 h-16 opacity-20" />
                  <p>Select a process or start a new execution to view details</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Add Process Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl space-y-6 shadow-2xl"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">New Process</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Process Name</label>
                    <input 
                      type="text" 
                      value={newProcess.name}
                      onChange={(e) => setNewProcess({...newProcess, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="e.g. Data Sync Pipeline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <textarea 
                      value={newProcess.description}
                      onChange={(e) => setNewProcess({...newProcess, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"
                      placeholder="What does this process do?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Initial Step (Shell Command)</label>
                    <input 
                      type="text" 
                      value={newProcess.steps[0].command}
                      onChange={(e) => {
                        const steps = [...newProcess.steps];
                        steps[0].command = e.target.value;
                        setNewProcess({...newProcess, steps});
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={handleCreateProcess}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/10"
                  >
                    Create Process
                  </button>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ExecutionViewer({ executionId, onComplete }: { executionId: number, onComplete: () => void }) {
  const { data: execution, mutate } = useSWR(`execution-${executionId}`, () => getExecution(executionId), {
    refreshInterval: 1000
  });

  useEffect(() => {
    if (execution?.status === 'completed' || execution?.status === 'failed') {
      // Keep it visible for a moment then allow onComplete
    }
  }, [execution]);

  if (!execution) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {execution.status === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
          {execution.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          {execution.status === 'failed' && <XCircle className="w-5 h-5 text-rose-500" />}
          <span className="font-bold">Execution #{execution.id}</span>
          <span className={clsx(
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
}

function ProcessDetails({ process, onRun }: { process: Process, onRun: () => void }) {
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
                <code className="text-slate-300 text-sm truncate">{step.command || step.code}</code>
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
}
