import React, { useState } from 'react';
import { Client, NewTenderData } from '../types';

interface AddTenderModalProps {
  clients: Client[];
  onClose: () => void;
  onSave: (tenderData: NewTenderData) => void;
}

const TENDER_SOURCES = ["GeM Portal", "eProc Portals", "Palladium", "IREPS", "Tender Tiger", "Cold Calling", "Existing Customer", "Referral", "Telephonic Outreach", "Social Platforms", "Other"];

const AddTenderModal: React.FC<AddTenderModalProps> = ({ clients, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    clientId: '',
    value: '0',
    deadline: '',
    description: '',
    source: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required.';
    if (!formData.department) newErrors.department = 'Department is required.';
    if (!formData.clientId) newErrors.clientId = 'Client is required.';
    if (!formData.source) newErrors.source = 'Tender source is required.';
    if (Number(formData.value) <= 0) newErrors.value = 'Value must be greater than zero.';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        value: Number(formData.value),
      });
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-[#30363d]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Tender</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill out the details below to create a new tender.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tender Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]" />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>
             <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
              <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]">
                <option value="" disabled>Select a client</option>
                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
              {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>}
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tender Source</label>
                  <select id="source" name="source" value={formData.source} onChange={handleChange} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]">
                    <option value="" disabled>Select a source</option>
                    {TENDER_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
                  </select>
                  {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value (₹)</label>
                  <input type="number" id="value" name="value" value={formData.value} onChange={handleChange} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]" />
                  {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]" />
                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
            </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-100 dark:bg-[#21262d] rounded-md p-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]"></textarea>
          </div>
        </form>

        <div className="p-4 border-t border-gray-200 dark:border-[#30363d] flex justify-end space-x-3 bg-gray-50 dark:bg-[#0d1117] rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="bg-gray-200 dark:bg-[#30363d] text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-[#444c56] transition-colors"
          >
            Cancel
          </button>
           <button 
            type="submit"
            onClick={handleSubmit}
            className="bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-sm"
          >
            Save Tender
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTenderModal;