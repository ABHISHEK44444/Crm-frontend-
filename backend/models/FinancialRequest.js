import React, { useState, useEffect } from 'react';
import { Tender, FinancialRequestType } from '../types';

interface FinancialRequestModalProps {
  tenders: Tender[];
  onClose: () => void;
  onSave: (tenderId: string, type: FinancialRequestType, amount: number, notes?: string, expiryDate?: string) => void;
  initialTenderId?: string | null;
}

const FinancialRequestModal: React.FC<FinancialRequestModalProps> = ({ tenders, onClose, onSave, initialTenderId }) => {
  const [tenderId, setTenderId] = useState(initialTenderId || '');
  const [type, setType] = useState<FinancialRequestType>(FinancialRequestType.EMD_BG);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenderId) {
        const selectedTender = tenders.find(t => t.id === tenderId);
        if (selectedTender) {
            if (type.startsWith('EMD')) {
                setAmount((selectedTender.emdAmount || selectedTender.emd?.amount || '').toString());
                setExpiryDate(selectedTender.emd?.expiryDate ? new Date(selectedTender.emd.expiryDate).toISOString().split('T')[0] : '');
            } else if (type === FinancialRequestType.TenderFee && selectedTender.tenderFee?.amount) {
                setAmount(selectedTender.tenderFee.amount.toString());
            } else if (type === FinancialRequestType.PBG) {
                const pbgAmount = selectedTender.pbg?.amount || (selectedTender.epbgPercentage && selectedTender.value ? selectedTender.value * (selectedTender.epbgPercentage / 100) : '');
                setAmount(pbgAmount.toString());
            } else {
                setAmount(''); // Clear if not applicable or data missing
            }
        }
    } else {
        setAmount('');
        setExpiryDate('');
    }
  }, [tenderId, type, tenders]);


  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!tenderId) newErrors.tenderId = 'Please select a tender.';
    if (Number(amount) <= 0) newErrors.amount = 'Amount must be a positive number.';
    if (type.startsWith('EMD') && !expiryDate) {
        newErrors.expiryDate = 'Expiry date is required for EMD requests.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(tenderId, type, Number(amount), notes, expiryDate || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Raise New Financial Request</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
          <div>
            <label htmlFor="tenderId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Tender</label>
            <select 
              id="tenderId" 
              value={tenderId} 
              onChange={e => setTenderId(e.target.value)} 
              className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"
              disabled={!!initialTenderId}
            >
              <option value="" disabled>-- Choose a tender --</option>
              {tenders.map(t => <option key={t.id} value={t.id}>{t.title} ({t.clientName})</option>)}
            </select>
            {errors.tenderId && <p className="text-red-500 text-xs mt-1">{errors.tenderId}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Request Type</label>
              <select id="type" value={type} onChange={e => setType(e.target.value as FinancialRequestType)} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2">
                {Object.values(FinancialRequestType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
              <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2" />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
          </div>
            {(type.startsWith('EMD') || type === FinancialRequestType.PBG) && (
                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date {type.startsWith('EMD') ? <span className="text-red-500">*</span> : '(Optional)'}
                    </label>
                    <input type="date" id="expiryDate" name="expiryDate" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2" />
                    {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                </div>
            )}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"></textarea>
          </div>
        </form>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">Submit Request</button>
        </div>
      </div>
    </div>
  );
};

export default FinancialRequestModal;
