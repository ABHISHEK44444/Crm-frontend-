

import React, { useState } from 'react';
import { BidWorkflowStage, StandardProcessState } from '../types';
import { STANDARD_WORKFLOW_CHECKLISTS, FileIcon } from '../constants';

interface ProcessesViewProps {
  standardProcessState: StandardProcessState;
  onUpdate: (newState: StandardProcessState) => void;
}

const ProcessesView: React.FC<ProcessesViewProps> = ({ standardProcessState, onUpdate }) => {
  const allStages = Object.values(BidWorkflowStage);
  const [selectedStage, setSelectedStage] = useState<BidWorkflowStage>(allStages[0]);

  const checklist = STANDARD_WORKFLOW_CHECKLISTS[selectedStage] || [];
  const completedInStage = standardProcessState[selectedStage] || [];
  
  const handleCheck = (itemId: string) => {
      const isCompleted = completedInStage.includes(itemId);
      const newCompleted = isCompleted
          ? completedInStage.filter(id => id !== itemId)
          : [...completedInStage, itemId];
          
      onUpdate({
          ...standardProcessState,
          [selectedStage]: newCompleted
      });
  };

  return (
    <div className="p-8 h-[calc(100vh-5rem)] flex flex-col">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Standard Operating Procedures</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Track company-wide adherence to standard processes for each stage of the tender lifecycle.</p>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-8 overflow-hidden">
        {/* Stages List */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 px-2">Workflow Stages</h3>
          <nav className="space-y-1">
            {allStages.map(stage => {
              const totalTasks = STANDARD_WORKFLOW_CHECKLISTS[stage]?.length || 0;
              const completedTasks = standardProcessState[stage]?.length || 0;
              const isComplete = totalTasks > 0 && completedTasks === totalTasks;
              
              return (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center ${
                    selectedStage === stage
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{stage}</span>
                    <div className="flex items-center space-x-2">
                      {isComplete && <span className="text-green-500 font-bold">✓</span>}
                      {totalTasks > 0 && !isComplete && completedTasks > 0 && <span className="text-xs text-slate-400">{completedTasks}/{totalTasks}</span>}
                    </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Checklist Details */}
        <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 overflow-y-auto">
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{selectedStage}</h3>
          
          <div className="space-y-4">
            {checklist.length > 0 ? (
              checklist.map((item) => {
                const isChecked = completedInStage.includes(item.id);
                return (
                  <label key={item.id} className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => handleCheck(item.id)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 flex-shrink-0" 
                    />
                    <div className="flex-grow">
                      <p className={`text-slate-800 dark:text-slate-200 ${isChecked ? 'line-through text-slate-500' : ''}`}>{item.text}</p>
                      {item.docType && (
                        <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <FileIcon className="w-4 h-4" />
                          <span>Document: <span className="font-semibold">{item.docType}</span></span>
                        </div>
                      )}
                    </div>
                  </label>
                )
              })
            ) : (
              <p className="text-center text-slate-500 py-10">No standard checklist defined for this stage.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessesView;
