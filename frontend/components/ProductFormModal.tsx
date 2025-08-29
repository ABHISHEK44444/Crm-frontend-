
import React, { useState, useEffect } from 'react';
import { Product, TenderDocument, User, TenderDocumentType } from '../types';
import { TrashIcon, UploadCloudIcon } from '../constants';

interface ProductFormModalProps {
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
  currentUser: User;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave, currentUser }) => {
  const [name, setName] = useState('');
  const [documents, setDocuments] = useState<TenderDocument[]>([]);
  const isEditing = !!(product && product.name);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDocuments(product.documents);
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const newDoc: TenderDocument = {
                id: `doc_${Date.now()}`,
                name: file.name,
                url: reader.result as string, // This is a data URL
                type: TenderDocumentType.ProductBrochure,
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
                uploadedById: currentUser.id,
            };
            setDocuments(prev => [...prev, newDoc]);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: product?.id || `prod_${Date.now()}`,
      name: name.trim(),
      documents,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Reusable Documents</h3>
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
                  <span className="text-sm text-slate-800 dark:text-slate-200 truncate pr-2">{doc.name}</span>
                  <button onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <label htmlFor="product-doc-upload" className="mt-4 w-full flex items-center justify-center space-x-2 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <UploadCloudIcon className="w-5 h-5 text-slate-500 dark:text-slate-300"/>
              <span className="text-sm text-slate-600 dark:text-slate-200">Add Document</span>
              <input id="product-doc-upload" type="file" className="sr-only" onChange={handleFileChange} />
            </label>
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button onClick={handleSubmit} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">Save Product</button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;