
import React, { useMemo } from 'react';
import { Tender, Product, TenderDocument } from '../types';
import { PackageIcon } from '../constants';

interface PrepareBidPacketModalProps {
  tender: Tender;
  product?: Product;
  onClose: () => void;
}

const PrepareBidPacketModal: React.FC<PrepareBidPacketModalProps> = ({ tender, product, onClose }) => {
  const allDocuments = useMemo(() => {
    const docMap = new Map<string, TenderDocument & { source: 'Tender' | 'Product' }>();
    
    (tender.documents || []).forEach(doc => {
      docMap.set(doc.name, { ...doc, source: 'Tender' });
    });

    if (product) {
      (product.documents || []).forEach(doc => {
        // Product documents don't override tender documents if names conflict
        if (!docMap.has(doc.name)) {
          docMap.set(doc.name, { ...doc, source: 'Product' });
        }
      });
    }

    return Array.from(docMap.values());
  }, [tender, product]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <PackageIcon className="w-6 h-6 text-indigo-500"/>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Bid Packet Checklist</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consolidated documents for: <span className="font-semibold text-slate-700 dark:text-slate-300">{tender.title}</span>
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                This is a checklist of all documents required for submission. Please ensure each item is prepared, signed, and stamped as necessary before final compilation.
            </p>
             <div className="space-y-3">
                {allDocuments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <input id={`doc-check-${index}`} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0" />
                        <label htmlFor={`doc-check-${index}`} className="flex-grow">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${doc.source === 'Product' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                                Source: {doc.source}
                            </span>
                        </label>
                    </div>
                ))}
                {allDocuments.length === 0 && (
                    <p className="text-center py-8 text-slate-500">No documents available for this bid packet.</p>
                )}
             </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-right">
          <button 
            onClick={onClose}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrepareBidPacketModal;
