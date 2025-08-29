
import React, { useState } from 'react';
import { ClipboardXIcon } from '../constants';

interface DeclineRequestModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const DeclineRequestModal: React.FC<DeclineRequestModalProps> = ({ onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('A reason for declining is required.');
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <ClipboardXIcon className="w-6 h-6 text-red-500"/>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Decline Financial Request</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please provide a reason for declining this request.</p>
        </div>
        <div className="p-6">
          <label htmlFor="decline-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reason for Decline <span className="text-red-500">*</span>
          </label>
          <textarea
            id="decline-reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            rows={4}
            className={`w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'focus:ring-indigo-500'}`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end space-x-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm">
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeclineRequestModal;
