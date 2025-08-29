import React from 'react';
import { Tender, BidWorkflowStage, User } from '../types';
import { CheckCircleIcon } from '../constants';

interface WorkflowStepperProps {
  tender: Tender;
  onUpdateTender: (tender: Tender) => void;
  currentUser: User;
}

const ALL_STAGES = Object.values(BidWorkflowStage);

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ tender, onUpdateTender, currentUser }) => {
  const currentStageIndex = ALL_STAGES.indexOf(tender.workflowStage);
  
  const handleStageClick = (index: number) => {
    const clickedStage = ALL_STAGES[index];
    if (clickedStage !== tender.workflowStage) {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Manually Set Workflow Stage',
        timestamp: new Date().toISOString(),
        details: `Stage changed from ${tender.workflowStage} to ${clickedStage}.`
      };
      onUpdateTender({ ...tender, workflowStage: clickedStage, history: [...(tender.history || []), newHistoryEntry] });
    }
  };


  return (
    <div className="py-4">
        <div className="relative flex items-start">
            {ALL_STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                <div key={stage} className="relative flex-1 flex flex-col items-center group cursor-pointer" onClick={() => handleStageClick(index)}>
                    {/* Connecting Line */}
                    {index > 0 && 
                        <div className={`absolute top-2 right-1/2 w-full h-0.5 ${isCompleted || isCurrent ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    }
                    {/* Stage Dot */}
                    <div className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                        isCompleted ? 'bg-indigo-600' : 
                        isCurrent ? 'bg-indigo-600 ring-4 ring-indigo-200 dark:ring-indigo-500/30' : 
                        'bg-slate-300 dark:bg-slate-600 group-hover:bg-indigo-400'
                    }`}>
                        {isCompleted && <CheckCircleIcon className="w-4 h-4 text-white" />}
                    </div>
                    {/* Stage Label */}
                    <p className={`absolute top-6 text-center w-full px-1 text-xs font-medium transition-all duration-300
                    ${isCurrent ? 'text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                    {stage.replace(' (LOI) / Purchase Order (PO)', '').replace(' (POT) / Installation', '')}
                    </p>
                </div>
                );
            })}
        </div>
    </div>
  );
};

export default WorkflowStepper;
