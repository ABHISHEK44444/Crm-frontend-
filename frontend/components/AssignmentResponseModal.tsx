
import React, { useState } from 'react';
import { AssignmentStatus } from '../types';

interface AssignmentResponseModalProps {
  initialStatus: AssignmentStatus;
  onClose: () => void;
  onConfirm: (status: AssignmentStatus, notes: string) => void;
}

const AssignmentResponseModal: React.FC<AssignmentResponseModalProps> = ({ initialStatus, onClose, onConfirm }) => {
  const [notes, setNotes] = useState('');

  const isAccepting = initialStatus === AssignmentStatus.Accepted;

  const handleSubmit = () => {
    if (notes.trim() === '' && !isAccepting) {
        alert('Please provide a reason for declining.');
        return;
    }
    onConfirm(initialStatus, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isAccepting ? 'Confirm Participation' : 'Decline Participation'}
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            {isAccepting ? 'Optionally, add a note for your team.' : 'Please provide a reason for declining this assignment.'}
          </p>
        </div>
        <div className="p-6">
          <label htmlFor="response-notes" className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes / Reason { !isAccepting && <span className="text-red-500">*</span> }
          </label>
          <textarea
            id="response-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-base text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder={isAccepting ? "e.g., I have a good relationship with this client." : "e.g., Conflict of interest, workload too high."}
          />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`font-semibold px-4 py-2 rounded-lg shadow-sm ${
                isAccepting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentResponseModal;