
import React, { useState, useEffect } from 'react';
import { BiddingTemplate, Tender, Client, User } from '../types';

interface GenerateDocumentModalProps {
  tender: Tender;
  client: Client;
  currentUser: User;
  templates: BiddingTemplate[];
  onClose: () => void;
}

const renderTemplate = (content: string, tender: Tender, client: Client, currentUser: User): string => {
    let rendered = content;
    const today = new Date();
    
    // Simple placeholder replacement
    rendered = rendered.replace(/{{currentDate}}/g, today.toLocaleDateString('en-IN'));

    const replacePlaceholders = (prefix: string, data: object) => {
        for(const key in data) {
            const regex = new RegExp(`{{${prefix}.${key}}}`, 'g');
            rendered = rendered.replace(regex, (data as any)[key] || '');
        }
    }
    
    replacePlaceholders('tender', tender);
    replacePlaceholders('client', client);
    replacePlaceholders('currentUser', currentUser);

    return rendered;
};


const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({ tender, client, currentUser, templates, onClose }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
    const [renderedContent, setRenderedContent] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    
    useEffect(() => {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        if (selectedTemplate) {
            setRenderedContent(renderTemplate(selectedTemplate.content, tender, client, currentUser));
        } else {
            setRenderedContent('Please select a template.');
        }
    }, [selectedTemplateId, templates, tender, client, currentUser]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(renderedContent).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Generate Document</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a template to generate a document for "{tender.title}".</p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-4">
            <div>
                <label htmlFor="template-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Template</label>
                <select 
                    id="template-select" 
                    value={selectedTemplateId} 
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2"
                >
                    <option value="" disabled>Choose a template</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Generated Document Preview</h3>
                <pre className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 text-sm whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                    {renderedContent}
                </pre>
            </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
          >
            Close
          </button>
           <button 
            type="button"
            onClick={handleCopy}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            {copySuccess || 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocumentModal;
