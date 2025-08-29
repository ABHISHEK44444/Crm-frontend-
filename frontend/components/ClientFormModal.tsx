

import React, { useState, useEffect } from 'react';
import { NewClientData, Client, ClientStatus, ClientAcquisitionSource } from '../types';

interface ClientFormModalProps {
  onClose: () => void;
  onSave: (clientData: Client | NewClientData) => void;
  client?: Client;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    gstin: '',
    category: '',
    status: ClientStatus.Lead,
    notes: '',
    potentialValue: 0,
    source: undefined as ClientAcquisitionSource | undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        industry: client.industry,
        gstin: client.gstin,
        category: client.category,
        status: client.status,
        notes: client.notes || '',
        potentialValue: client.potentialValue || 0,
        source: client.source,
      });
    }
  }, [client]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Client name is required.';
    if (!formData.industry) newErrors.industry = 'Industry is required.';
    if (!formData.category) newErrors.category = 'Category is required.';
    if (formData.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(formData.gstin.toUpperCase())) {
      newErrors.gstin = 'Please enter a valid GSTIN format or leave blank.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const dataToSave = { ...formData, gstin: formData.gstin.toUpperCase() };
      if (!dataToSave.potentialValue) {
          delete (dataToSave as any).potentialValue;
      }

      if (client) {
        onSave({ ...client, ...dataToSave });
      } else {
        onSave(dataToSave);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const isEditing = !!client;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isEditing ? 'Update the details for this client.' : 'Enter the details for the new client.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200"/>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
              <input type="text" id="industry" name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200"/>
              {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., High-Value, Government, SMB" className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200"/>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
             <div>
              <label htmlFor="source" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Acquisition Source</label>
              <select id="source" name="source" value={formData.source || ''} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200">
                <option value="">Select a source</option>
                {Object.values(ClientAcquisitionSource).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gstin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                <input type="text" id="gstin" name="gstin" value={formData.gstin} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200"/>
                {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin}</p>}
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200">
                    {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
          </div>
          
          {formData.status === ClientStatus.Lead && (
             <div>
                <label htmlFor="potentialValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Potential Value (₹)</label>
                <input type="number" id="potentialValue" name="potentialValue" value={formData.potentialValue} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200"/>
            </div>
          )}

           <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200"></textarea>
          </div>
        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
          >
            Cancel
          </button>
           <button 
            type="submit"
            onClick={handleSubmit}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            {isEditing ? 'Save Changes' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientFormModal;