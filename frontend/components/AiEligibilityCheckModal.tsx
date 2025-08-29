
import React, { useState, useEffect } from 'react';
import { Tender } from '../types';
import { checkEligibility } from '../services/geminiService';
import { SparklesIcon } from '../constants';

interface AiEligibilityCheckModalProps {
  tender: Tender;
  onClose: () => void;
}

interface EligibilityData {
    criteria: {
        criterion: string;
        details: string;
        met: 'Yes' | 'No' | 'Partial' | 'N/A';
    }[];
    summary: string;
}

const getMetBadgeClass = (met: 'Yes' | 'No' | 'Partial' | 'N/A') => {
    const base = "px-2.5 py-1 text-sm font-medium rounded-full";
    switch(met) {
        case 'Yes': return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
        case 'No': return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
        case 'Partial': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
        case 'N/A':
        default: return `${base} bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300`;
    }
};

const AiEligibilityCheckModal: React.FC<AiEligibilityCheckModalProps> = ({ tender, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<EligibilityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await checkEligibility(tender.description);
        setAnalysis(result);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [tender]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-blue-500"/>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Eligibility Check</h2>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            Analyzing eligibility for: <span className="font-semibold text-slate-700 dark:text-slate-300">{tender.title}</span>
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="mt-4">Our AI is checking eligibility against our profile...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
               <p className="font-bold">Analysis Failed</p>
               <p className="text-base">{error}</p>
           </div>
          ) : analysis && (
            <div className="space-y-6">
                 <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Eligibility Summary</h3>
                    <p className="prose prose-base dark:prose-invert max-w-none">{analysis.summary}</p>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Criteria Breakdown</h3>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <table className="w-full text-base">
                        <thead className="text-sm text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-2 text-left">Criterion</th>
                                <th className="px-4 py-2 text-left">Requirement Details</th>
                                <th className="px-4 py-2 text-center">Met?</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {analysis.criteria.map((c, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{c.criterion}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.details}</td>
                                <td className="px-4 py-3 text-center"><span className={getMetBadgeClass(c.met)}>{c.met}</span></td>
                            </tr>
                        ))}
                        </tbody>
                        </table>
                    </div>
                 </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-right">
          <button 
            onClick={onClose}
            className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiEligibilityCheckModal;