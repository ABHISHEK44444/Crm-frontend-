
import React, { useState, useEffect } from 'react';
import { Tender } from '../types';
import { analyzeTender } from '../services/geminiService';
import { SparklesIcon } from '../constants';

interface AiHelperProps {
  tender: Tender;
  onClose: () => void;
}

interface AnalysisData {
    summary: string;
    requirements: string[];
    risks: string[];
    successFactors: string[];
    error?: string;
}

const AnalysisSection: React.FC<{title: string; items?: string[]}> = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h3 className="font-bold text-lg mt-4 mb-2">{title}</h3>
            <ul className="list-disc list-inside space-y-1">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    );
}

const AiHelper: React.FC<AiHelperProps> = ({ tender, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      const result = await analyzeTender(tender.description);
      setAnalysis(result);
      setIsLoading(false);
    };

    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-indigo-500"/>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Tender Analysis</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyzing: <span className="font-semibold text-slate-700 dark:text-slate-300">{tender.title}</span>
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="mt-4">Our AI is analyzing the tender... this may take a moment.</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {analysis?.error && <p className="text-red-500">{analysis.error}</p>}
              {analysis && !analysis.error && (
                <>
                  <h3 className="font-bold text-lg mb-2">Executive Summary</h3>
                  <p>{analysis.summary}</p>
                  <AnalysisSection title="Key Requirements" items={analysis.requirements} />
                  <AnalysisSection title="Potential Risks" items={analysis.risks} />
                  <AnalysisSection title="Success Factors" items={analysis.successFactors} />
                </>
              )}
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

export default AiHelper;
