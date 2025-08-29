

import React from 'react';
import { Tender, User, ChecklistItem } from '../types';
import { STANDARD_WORKFLOW_CHECKLISTS } from '../constants';
import { ClipboardListIcon } from '../constants';

interface WorkflowChecklistProps {
    tender: Tender;
    currentUser: User;
    onUpdateTender: (tender: Tender) => void;
}

const WorkflowChecklist: React.FC<WorkflowChecklistProps> = ({ tender, currentUser, onUpdateTender }) => {

    const currentChecklist = tender.checklists?.[tender.workflowStage] || [];

    const handleChecklistToggle = (itemId: string) => {
        const updatedItems = currentChecklist.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );

        if (!updatedItems) return;

        const itemToggled = currentChecklist.find(i => i.id === itemId);
        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: itemToggled?.completed ? 'Unchecked stage task' : 'Completed stage task',
            timestamp: new Date().toISOString(),
            details: `"${itemToggled?.text}" from ${tender.workflowStage}`
        };

        const updatedTender = {
            ...tender,
            checklists: {
                ...tender.checklists,
                [tender.workflowStage]: updatedItems,
            },
            history: [...(tender.history || []), newHistoryEntry]
        };
        onUpdateTender(updatedTender);
    };
    
    const handleLoadStandardChecklist = () => {
        const standardItems = STANDARD_WORKFLOW_CHECKLISTS[tender.workflowStage];
        if (!standardItems) return;

        const newChecklistItems: ChecklistItem[] = standardItems.map(item => ({
            id: `chk-${Date.now()}-${item.id}`,
            text: item.text,
            completed: false,
        }));

        const updatedTender = {
            ...tender,
            checklists: {
                ...tender.checklists,
                [tender.workflowStage]: newChecklistItems,
            },
            history: [...(tender.history || []), {
                userId: currentUser.id,
                user: currentUser.name,
                action: 'Loaded Standard Checklist',
                timestamp: new Date().toISOString(),
                details: `Loaded ${newChecklistItems.length} tasks for ${tender.workflowStage}.`
            }]
        };
        onUpdateTender(updatedTender);
    };
    
    const checklistProgress = currentChecklist.length > 0
        ? (currentChecklist.filter(i => i.completed).length / currentChecklist.length) * 100
        : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Stage Checklist</h3>
            </div>
            {(currentChecklist.length > 0) ? (
                <div className="space-y-3">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 overflow-hidden">
                        <div className="bg-indigo-600 h-2.5 rounded-full origin-left transition-transform duration-300" style={{ transform: `scaleX(${checklistProgress / 100})` }}></div>
                    </div>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                    {currentChecklist.map(item => (
                        <label key={item.id} className="flex items-start space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <input type="checkbox" checked={item.completed} onChange={() => handleChecklistToggle(item.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 flex-shrink-0" />
                            <span className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{item.text}</span>
                        </label>
                    ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400">No checklist for this stage.</p>
                    <div className="mt-2 space-x-4">
                        <button 
                            onClick={handleLoadStandardChecklist}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1"
                        >
                           <ClipboardListIcon className="w-4 h-4" />
                           <span>Load Standard Checklist</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowChecklist;