import React, { useState, useEffect } from 'react';
import { User, NewUserData, Role, Department, Designation } from '../types';

interface UserFormModalProps {
  onClose: () => void;
  onSave: (userData: NewUserData | User) => void;
  user?: User;
  departments: Department[];
  designations: Designation[];
  error?: string;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ onClose, onSave, user, departments, designations, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: Role.Viewer,
    avatarUrl: '',
    department: '',
    designation: '',
    specializations: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        department: user.department || '',
        designation: user.designation || '',
        specializations: user.specializations?.join(', ') || '',
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'User name is required.';
    if (!formData.role) newErrors.role = 'Role is required.';
    try {
        if(formData.avatarUrl) new URL(formData.avatarUrl);
    } catch (_) {
        newErrors.avatarUrl = 'Please enter a valid URL.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const specializationsArray = formData.specializations
        ? formData.specializations.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const commonData = {
        name: formData.name,
        role: formData.role,
        avatarUrl: formData.avatarUrl,
        department: formData.department || undefined,
        designation: formData.designation || undefined,
        specializations: specializationsArray,
      };

      if (user) { // Editing
        onSave({
            ...user,
            ...commonData,
        });
      } else { // Adding new user
        onSave(commonData);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isEditing = !!user;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit User' : 'Add New User'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4">
           {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
              <p className="font-bold">Could not save user</p>
              <p>{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar URL</label>
                <input type="text" id="avatarUrl" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://ui-avatars.com/api/?name=John+Doe" className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                {errors.avatarUrl && <p className="text-red-500 text-xs mt-1">{errors.avatarUrl}</p>}
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select id="department" name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <select id="designation" name="designation" value={formData.designation} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2">
                <option value="">Select Designation</option>
                {designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>
           <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2">
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
            <div>
                <label htmlFor="specializations" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specializations / Product Focus</label>
                <input type="text" id="specializations" name="specializations" value={formData.specializations} onChange={handleChange} placeholder="e.g. Cloud, Printers, AI" className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"/>
                 <p className="text-xs text-slate-500 mt-1">Comma-separated list of product categories or skills.</p>
            </div>
        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">{isEditing ? 'Save Changes' : 'Add User'}</button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
