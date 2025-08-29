import React, { useState, useEffect } from 'react';
import { OEM, NewOemData } from '../types';

interface OemFormModalProps {
  onClose: () => void;
  onSave: (oemData: NewOemData | OEM) => void;
  oem?: OEM;
}

const OemFormModal: React.FC<OemFormModalProps> = ({ onClose, onSave, oem }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    area: '',
    region: '',
    accountManager: '',
    accountManagerStatus: 'Active' as 'Active' | 'Inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (oem) {
      setFormData({
        name: oem.name,
        contactPerson: oem.contactPerson,
        email: oem.email,
        phone: oem.phone,
        website: oem.website || '',
        area: oem.area || '',
        region: oem.region || '',
        accountManager: oem.accountManager || '',
        accountManagerStatus: oem.accountManagerStatus || 'Active',
      });
    }
  }, [oem]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'OEM name is required.';
    if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const dataToSave = { 
          ...formData,
          website: formData.website || undefined,
          area: formData.area || undefined,
          region: formData.region || undefined,
          accountManager: formData.accountManager || undefined,
          accountManagerStatus: formData.accountManager ? formData.accountManagerStatus : undefined,
      };
      if (oem) {
        onSave({ ...oem, ...dataToSave });
      } else {
        onSave(dataToSave);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const isEditing = !!oem;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit OEM' : 'Add New OEM'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">OEM Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
             <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">Location Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Region</label>
                  <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Area</label>
                  <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                </div>
              </div>
          </div>
          
           <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                    {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
           </div>

           <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">Account Manager</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manager Name</label>
                        <input type="text" name="accountManager" value={formData.accountManager} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manager Status</label>
                        <select name="accountManagerStatus" value={formData.accountManagerStatus} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
           </div>
           
           <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website (optional)</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
           </div>

        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">{isEditing ? 'Save Changes' : 'Save OEM'}</button>
        </div>
      </div>
    </div>
  );
};

export default OemFormModal;