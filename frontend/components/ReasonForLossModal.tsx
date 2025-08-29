import React, { useState } from 'react';
import { Tender } from '../types';

interface ReasonForLossModalProps {
  onClose: () => void;
  onSave: (reason: Tender['reasonForLoss'], notes?: string) => void;
}

const reasons = ['Price', 'Technical', 'Timeline', 'Relationship', 'Other'] as const;

const ReasonForLossModal: React.FC<ReasonForLossModalProps> = ({ onClose, onSave }) => {
  const [selectedReason, setSelectedReason] = useState<Tender['reasonForLoss']>();
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (selectedReason) {
      onSave(selectedReason, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reason for Loss</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please select the primary reason this tender was lost.</p>
        </div>
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {reasons.map(reason => (
                     <button
                        key={reason}
                        onClick={() => setSelectedReason(reason)}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                            selectedReason === reason
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
                        }`}
                    >
                        {reason}
                    </button>
                ))}
            </div>
            {selectedReason === 'Other' && (
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Please specify:</label>
                    <textarea 
                        id="notes" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        rows={3} 
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"
                    />
                </div>
            )}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button type="button" onClick={handleSave} disabled={!selectedReason} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed">Confirm Loss</button>
        </div>
      </div>
    </div>
  );
};

export default ReasonForLossModal;