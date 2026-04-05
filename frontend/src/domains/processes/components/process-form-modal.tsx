import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Process, Step } from '../types';

interface ProcessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (process: Partial<Process>) => Promise<void>;
}

export const ProcessFormModal: React.FC<ProcessFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate 
}) => {
  const [newProcess, setNewProcess] = useState<{name: string, description: string, steps: Partial<Step>[]}>({ 
    name: '', 
    description: '', 
    steps: [{ type: 'shell', command: 'echo "Hello from Navbe AI"' }] 
  });

  const addStep = () => {
    setNewProcess({
      ...newProcess,
      steps: [...newProcess.steps, { type: 'shell', command: 'echo "New Step"' }]
    });
  };

  const removeStep = (index: number) => {
    if (newProcess.steps.length <= 1) return;
    const steps = [...newProcess.steps];
    steps.splice(index, 1);
    setNewProcess({ ...newProcess, steps });
  };

  const updateStep = (index: number, updates: Partial<Step>) => {
    const steps = [...newProcess.steps];
    steps[index] = { ...steps[index], ...updates };
    setNewProcess({ ...newProcess, steps });
  };

  const handleCreate = async () => {
    await onCreate(newProcess as any);
    setNewProcess({ 
      name: '', 
      description: '', 
      steps: [{ type: 'shell', command: 'echo "Hello from Navbe AI"' }] 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">New Process</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
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
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-400">Process Steps</label>
                  <button 
                    onClick={addStep}
                    className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Step</span>
                  </button>
                </div>

                {newProcess.steps.map((step, index) => (
                  <div key={index} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Step {index + 1}</span>
                      {newProcess.steps.length > 1 && (
                        <button 
                          onClick={() => removeStep(index)}
                          className="text-slate-500 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Step Type</label>
                      <select 
                        value={step.type}
                        onChange={(e) => {
                          const type = e.target.value as Step['type'];
                          let updates: any = { type };
                          if (type === 'shell') updates.command = 'echo "Hello"';
                          if (type === 'python') updates.code = 'print("Hello")';
                          if (type === 'resend') {
                            updates.from_email = 'onboarding@resend.dev';
                            updates.to = '';
                            updates.subject = '';
                            updates.body = '';
                          }
                          updateStep(index, updates);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="shell">Shell Command</option>
                        <option value="python">Python Code</option>
                        <option value="resend">Resend Email</option>
                      </select>
                    </div>

                    {step.type === 'shell' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Command</label>
                        <input 
                          type="text" 
                          value={step.command || ''}
                          onChange={(e) => updateStep(index, { command: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    )}

                    {step.type === 'python' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Python Code</label>
                        <textarea 
                          value={step.code || ''}
                          onChange={(e) => updateStep(index, { code: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all h-20"
                        />
                      </div>
                    )}

                    {step.type === 'resend' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From</label>
                          <input 
                            type="email" 
                            value={step.from_email || 'onboarding@resend.dev'}
                            onChange={(e) => updateStep(index, { from_email: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="sender@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To</label>
                          <input 
                            type="email" 
                            value={step.to || ''}
                            onChange={(e) => updateStep(index, { to: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="recipient@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject</label>
                          <input 
                            type="text" 
                            value={step.subject || ''}
                            onChange={(e) => updateStep(index, { subject: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Email Subject"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Body (HTML)</label>
                          <textarea 
                            value={step.body || ''}
                            onChange={(e) => updateStep(index, { body: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all h-20"
                            placeholder="<h1>Hello</h1>"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                onClick={handleCreate}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/10"
              >
                Create Process
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
