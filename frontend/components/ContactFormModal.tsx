
import React, { useState, useEffect } from 'react';
import { Contact, ContactData } from '../types';

interface ContactFormModalProps {
  onClose: () => void;
  onSave: (clientId: string, contactData: ContactData | Contact) => void;
  contact?: Contact;
  clientId: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ onClose, onSave, contact, clientId }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    isPrimary: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        isPrimary: !!contact.isPrimary,
      });
    }
  }, [contact]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Contact name is required.';
    if (!formData.role) newErrors.role = 'Role is required.';
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
        if (contact) {
            onSave(clientId, { ...contact, ...formData });
        } else {
            onSave(clientId, formData);
        }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const isEditing = !!contact;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit Contact' : 'Add New Contact'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role/Title</label>
              <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input id="isPrimary" name="isPrimary" type="checkbox" checked={formData.isPrimary} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="isPrimary" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">Set as primary contact</label>
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
            {isEditing ? 'Save Changes' : 'Save Contact'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactFormModal;
