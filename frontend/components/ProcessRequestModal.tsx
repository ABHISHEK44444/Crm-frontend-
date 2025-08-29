
import React, { useState } from 'react';
import { FinancialRequest } from '../types';

interface ProcessRequestModalProps {
  request: FinancialRequest;
  onClose: () => void;
  onSave: (instrumentDetails: FinancialRequest['instrumentDetails']) => void;
}

const ProcessRequestModal: React.FC<ProcessRequestModalProps> = ({ request, onClose, onSave }) => {
  const [details, setDetails] = useState<FinancialRequest['instrumentDetails']>({
    mode: 'Online',
    processedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    issuingBank: '',
    documentUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(details);
  };

  return (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Process Request: {request.type}</h2>
          <p className="text-sm text-slate-500">Log the details for this transaction.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Mode</label>
                    <select name="mode" value={details?.mode} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2">
                        <option>Online</option><option>DD</option><option>BG</option><option>Cash</option><option>N/A</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Processed Date</label>
                    <input type="date" name="processedDate" value={details?.processedDate} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2" />
                </div>
            </div>
             {request.type !== 'Tender Fee' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                        <input type="date" name="expiryDate" value={details?.expiryDate} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2" />
                    </div>
                    {request.type === 'PBG' && (
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issuing Bank</label>
                            <input type="text" name="issuingBank" value={details?.issuingBank} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2" />
                        </div>
                    )}
                </div>
            )}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document URL (Optional)</label>
                <input type="text" name="documentUrl" value={details?.documentUrl} onChange={handleChange} placeholder="Link to scanned document" className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2" />
            </div>
        </form>
         <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">Mark as Processed</button>
        </div>
      </div>
    </div>
  );
};

export default ProcessRequestModal;
