import React, { useState, useMemo } from 'react';
import { User, Role, UserStatus, Department, Designation, BiddingTemplate, Product } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, SearchIcon } from '../constants';
import { getUserStatusBadgeClass } from '../utils/formatting';

interface AdminViewProps {
    users: User[];
    departments: Department[];
    designations: Designation[];
    biddingTemplates: BiddingTemplate[];
    products: Product[];
    currentUser: User;
    onAddUser: () => void;
    onEditUser: (user: User) => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    onDeleteUser: (user: User) => void;
    onSaveDepartment: (name: string) => void;
    onDeleteDepartment: (id: string) => void;
    onSaveDesignation: (name: string) => void;
    onDeleteDesignation: (id: string) => void;
    onSaveTemplate: (template: BiddingTemplate) => void;
    onDeleteTemplate: (id: string) => void;
    onAddOrUpdateProduct: (product: Product) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
}

const AdminListManager: React.FC<{
    title: string;
    items: {id: string; name: string}[];
    onSave: (name: string) => void;
    onDelete: (id: string) => void;
    itemType: string;
}> = ({ title, items, onSave, onDelete, itemType }) => {
    const [newItem, setNewItem] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim()) {
            onSave(newItem.trim());
            setNewItem('');
        }
    };
    
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h3>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                 <div className="p-4 space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                            <button onClick={() => onDelete(item.id)} className="p-1 text-slate-500 hover:text-red-600">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-sm text-center text-slate-500 py-4">No {itemType}s defined.</p>}
                 </div>
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSave} className="flex space-x-3">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={`Add new ${itemType}...`}
                            className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">Add</button>
                    </form>
                 </div>
            </div>
        </div>
    );
};

const RolePermissions: React.FC = () => {
    const permissions = [
        { role: Role.Admin, description: 'Full access to all modules, including user and system management.' },
        { role: Role.Sales, description: 'Access to Dashboard, CRM, Tenders, My Feed, OEMs, and Reporting. Cannot access Finance or Admin panels.' },
        { role: Role.Finance, description: 'Access to Dashboard, Tenders, and Finance modules. Read-only access to CRM. Cannot access Admin panels.' },
        { role: Role.Viewer, description: 'Read-only access to most modules. Cannot perform actions like creating, editing, or assigning.' },
    ];
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Role Permissions Overview</h3>
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                {permissions.map(p => (
                    <div key={p.role} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{p.role}</h4>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{p.description}</p>
                    </div>
                ))}
             </div>
        </div>
    );
};

const TemplateEditor: React.FC<{
    template: BiddingTemplate;
    onSave: (template: BiddingTemplate) => void;
    onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
    const [currentTemplate, setCurrentTemplate] = useState(template);
    
    const handleSave = () => {
        if(currentTemplate.name && currentTemplate.content) {
            onSave(currentTemplate);
        }
    }

    return (
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{template.id.startsWith('temp_') ? 'Create New Template' : 'Edit Template'}</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                    <input 
                        type="text" 
                        value={currentTemplate.name}
                        onChange={(e) => setCurrentTemplate(t => ({...t, name: e.target.value}))}
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Content</label>
                    <textarea 
                        value={currentTemplate.content}
                        onChange={(e) => setCurrentTemplate(t => ({...t, content: e.target.value}))}
                        rows={15}
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 font-mono text-sm"
                        placeholder="Use placeholders like {{tender.title}} or {{client.name}}"
                    />
                     <p className="text-xs text-slate-500 mt-1">{"Available placeholders: `{{tender.*}}`, `{{client.*}}`, `{{currentUser.*}}`, `{{currentDate}}`"}</p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">Save Template</button>
                </div>
            </div>
        </div>
    )
};

const TemplateManager: React.FC<{
    templates: BiddingTemplate[];
    onSave: (template: BiddingTemplate) => void;
    onDelete: (id: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}> = ({ templates, onSave, onDelete, searchTerm, setSearchTerm }) => {
    const [editingTemplate, setEditingTemplate] = useState<BiddingTemplate | null>(null);

    const handleSave = (template: BiddingTemplate) => {
        onSave(template);
        setEditingTemplate(null);
    };
    
    const handleAddNew = () => {
        setEditingTemplate({ id: `temp_${Date.now()}`, name: '', content: '' });
    };

    const filteredTemplates = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return templates;
        return templates.filter(t => t.name.toLowerCase().includes(lowercasedTerm));
    }, [templates, searchTerm]);

    if (editingTemplate) {
        return <TemplateEditor template={editingTemplate} onSave={handleSave} onCancel={() => setEditingTemplate(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Bidding Templates</h3>
                <div className="flex items-center space-x-4">
                     <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                    <button onClick={handleAddNew} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center space-x-2">
                        <PlusCircleIcon className="w-5 h-5"/>
                        <span>New Template</span>
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-3">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{template.name}</span>
                        <div className="space-x-2">
                             <button onClick={() => setEditingTemplate(template)} className="p-1 text-slate-500 hover:text-indigo-600"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDelete(template.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
                {filteredTemplates.length === 0 && <p className="text-sm text-center text-slate-500 py-4">No bidding templates found.</p>}
            </div>
        </div>
    );
};


const AdminView: React.FC<AdminViewProps> = (props) => {
    const { users, currentUser, onAddUser, onEditUser, onUpdateUserStatus, onDeleteUser, departments, designations, onSaveDepartment, onDeleteDepartment, onSaveDesignation, onDeleteDesignation, biddingTemplates, onSaveTemplate, onDeleteTemplate, products, onAddOrUpdateProduct, onEditProduct, onDeleteProduct } = props;
    const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'designations' | 'products' | 'templates' | 'roles'>('users');
    const [searchTerm, setSearchTerm] = useState('');

    const handleTabChange = (tab: typeof activeTab) => {
        setSearchTerm('');
        setActiveTab(tab);
    };
    
    const filteredUsers = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(lowercasedTerm) ||
            user.role.toLowerCase().includes(lowercasedTerm) ||
            (user.department || '').toLowerCase().includes(lowercasedTerm) ||
            (user.designation || '').toLowerCase().includes(lowercasedTerm)
        );
    }, [users, searchTerm]);
    
    const filteredProducts = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(lowercasedTerm));
    }, [products, searchTerm]);

    const renderContent = () => {
        switch(activeTab) {
            case 'users':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">User Management</h3>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                    />
                                </div>
                                <button onClick={onAddUser} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center space-x-2">
                                    <PlusCircleIcon className="w-5 h-5"/>
                                    <span>Add New User</span>
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">User</th>
                                        <th scope="col" className="px-6 py-3">Department</th>
                                        <th scope="col" className="px-6 py-3">Designation</th>
                                        <th scope="col" className="px-6 py-3 text-center">Status</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{user.department || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.designation || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={getUserStatusBadgeClass(user.status)}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <button onClick={() => onEditUser(user)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                                        <PencilIcon className="w-4 h-4 inline-block mr-1"/>Edit
                                                    </button>
                                                    {user.status === 'Active' ? (
                                                        <button 
                                                            onClick={() => onUpdateUserStatus(user.id, 'Inactive')} 
                                                            className="font-medium text-orange-500 dark:text-orange-400 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                                                            disabled={user.id === currentUser.id || user.username === 'admin'}
                                                            title={user.id === currentUser.id ? "You cannot deactivate yourself." : user.username === 'admin' ? "Cannot deactivate primary admin." : "Deactivate user"}
                                                        >Deactivate</button>
                                                    ) : (
                                                        <button onClick={() => onUpdateUserStatus(user.id, 'Active')} className="font-medium text-green-600 dark:text-green-400 hover:underline">Activate</button>
                                                    )}
                                                    <button 
                                                        onClick={() => onDeleteUser(user)}
                                                        className="font-medium text-red-600 dark:text-red-400 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                                                        disabled={user.id === currentUser.id || user.username === 'admin'}
                                                        title={user.id === currentUser.id ? "You cannot delete yourself." : user.username === 'admin' ? "Cannot delete primary admin." : "Delete user"}
                                                    >
                                                        <TrashIcon className="w-4 h-4 inline-block mr-1"/>Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'departments':
                return <AdminListManager title="Manage Departments" items={departments} onSave={onSaveDepartment} onDelete={onDeleteDepartment} itemType="department" />;
            case 'designations':
                 return <AdminListManager title="Manage Designations" items={designations} onSave={onSaveDesignation} onDelete={onDeleteDesignation} itemType="designation" />;
            case 'products':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Product Library</h3>
                             <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                    />
                                </div>
                                <button onClick={() => onEditProduct({id: `prod_${Date.now()}`, name: '', documents: []})} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-2">
                                    <PlusCircleIcon className="w-5 h-5"/>
                                    <span>Add New Product</span>
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-3">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{product.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{product.documents.length} document(s)</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => onEditProduct(product)} className="p-1 text-slate-500 hover:text-indigo-600"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDeleteProduct(product.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            ))}
                            {filteredProducts.length === 0 && <p className="text-sm text-center text-slate-500 py-4">No products found.</p>}
                        </div>
                    </div>
                );
            case 'templates':
                return <TemplateManager templates={biddingTemplates} onSave={onSaveTemplate} onDelete={onDeleteTemplate} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
            case 'roles':
                return <RolePermissions />;
            default:
                return null;
        }
    };
    
    return (
        <div className="p-8 space-y-8">
            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8">
                     {(['users', 'departments', 'designations', 'products', 'templates', 'roles'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                            activeTab === tab
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminView;