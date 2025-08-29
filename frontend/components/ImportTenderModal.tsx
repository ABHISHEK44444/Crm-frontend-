

import React, { useState, useCallback } from 'react';
import { ImportedTenderData } from '../types';
import { extractTenderDetailsFromDocument } from '../services/geminiService';
import { UploadCloudIcon, SparklesIcon } from '../constants';

interface ImportTenderModalProps {
  onClose: () => void;
  onSave: (tenderData: ImportedTenderData, file: File | null) => void;
}

interface FormInputProps {
    label: string;
    name: keyof ImportedTenderData;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input 
            type={type} 
            id={name} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
        />
    </div>
);

const ReadOnlyDisplay: React.FC<{ label: string; value: boolean | undefined }> = ({ label, value }) => {
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'N/A';
    const valueClass = typeof value === 'boolean'
        ? value
            ? 'px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        : 'text-slate-500 dark:text-slate-400';
    
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <div className="mt-1 p-2 min-h-[40px] flex items-center">
                <span className={valueClass}>{displayValue}</span>
            </div>
        </div>
    );
};


const ImportTenderModal: React.FC<ImportTenderModalProps> = ({ onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ImportedTenderData | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid image (PNG, JPG) or PDF file.');
      }
    }
  };

  const handleProcessFile = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const data = await extractTenderDetailsFromDocument(file);
      setExtractedData({
        ...data,
        mseExemption: data.mseExemption ?? false,
        startupExemption: data.startupExemption ?? false,
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  }, [file]);
  
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!extractedData) return;
      const { name, value, type } = e.target;
      
      let processedValue: any = value;
      if (type === 'number') {
        processedValue = value === '' ? undefined : Number(value);
      }
      
      setExtractedData({ 
        ...extractedData, 
        [name]: processedValue
      });
  };
  
  const handleSave = () => {
    if (extractedData) {
      onSave(extractedData, file);
    }
  };

  const renderContent = () => {
    if (isProcessing) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-lg">AI is analyzing your document...</p>
                <p className="text-sm">This may take a few moments.</p>
            </div>
        );
    }
    
    if (extractedData) {
        return (
             <div className="p-6 overflow-y-auto flex-grow space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-indigo-500" /> Review Extracted Data</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Please verify the information extracted by the AI and make any necessary corrections before saving.</p>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Tender Title" name="title" value={extractedData.title} onChange={handleDataChange} />
                        <FormInput label="Tender Number" name="tenderNumber" value={extractedData.tenderNumber} onChange={handleDataChange} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Client Name" name="clientName" value={extractedData.clientName} onChange={handleDataChange} />
                        <FormInput label="Department" name="department" value={extractedData.department} onChange={handleDataChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormInput label="Submission Deadline" name="deadline" value={extractedData.deadline ? extractedData.deadline.slice(0, 16) : ''} onChange={handleDataChange} type="datetime-local" />
                         <FormInput label="Opening Date" name="openingDate" value={extractedData.openingDate ? extractedData.openingDate.slice(0, 16) : ''} onChange={handleDataChange} type="datetime-local" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Jurisdiction" name="jurisdiction" value={extractedData.jurisdiction} onChange={handleDataChange} />
                        <FormInput label="Total Quantity" name="totalQuantity" value={extractedData.totalQuantity} onChange={handleDataChange} type="number"/>
                    </div>
                </div>

                <div>
                     <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Financial & Experience Requirements</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Min. Bidder Turnover" name="minAvgTurnover" value={extractedData.minAvgTurnover} onChange={handleDataChange} />
                            <FormInput label="Min. OEM Turnover" name="oemAvgTurnover" value={extractedData.oemAvgTurnover} onChange={handleDataChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="EMD Amount (₹)" name="emdAmount" value={extractedData.emdAmount} onChange={handleDataChange} type="number"/>
                            <FormInput label="Past Experience (Years)" name="pastExperienceYears" value={extractedData.pastExperienceYears} onChange={handleDataChange} type="number"/>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="ePBG (%)" name="epbgPercentage" value={extractedData.epbgPercentage} onChange={handleDataChange} type="number"/>
                            <FormInput label="ePBG Duration (Months)" name="epbgDuration" value={extractedData.epbgDuration} onChange={handleDataChange} type="number"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyDisplay label="MSE Exemption" value={extractedData.mseExemption} />
                            <ReadOnlyDisplay label="Startup Exemption" value={extractedData.startupExemption} />
                        </div>
                     </div>
                </div>
                 
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Item Category</label>
                    <textarea id="description" name="description" value={extractedData.description || ''} onChange={handleDataChange} rows={3} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"></textarea>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 flex-grow flex flex-col justify-center items-center">
            <div className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-700/50">
                <UploadCloudIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
                <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {file ? `File selected: ${file.name}` : 'Drag & drop your tender document here'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">or</p>
                <label htmlFor="file-upload" className="mt-2 inline-block cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                    Browse for a file
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept="image/png, image/jpeg, application/pdf" />
                </label>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Supports: PNG, JPG, PDF</p>
            </div>
             {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
             <button
                onClick={handleProcessFile}
                disabled={!file}
                className="mt-6 w-full bg-indigo-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                <SparklesIcon className="w-5 h-5"/>
                <span>Analyze with AI</span>
            </button>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Import New Tender</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a document to automatically extract tender details.</p>
        </div>
        
        {renderContent()}

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
           <button 
            type="button"
            onClick={handleSave}
            disabled={!extractedData}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Save Tender
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTenderModal;
