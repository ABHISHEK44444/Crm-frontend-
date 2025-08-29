
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Tender, TenderStatus } from '../types';
import { summarizeClientActivity } from '../services/geminiService';
import { SparklesIcon } from '../constants';
import { formatLargeIndianNumber } from '../utils/formatting';

interface AiClientSummaryModalProps {
  client: Client;
  tenders: Tender[];
  onClose: () => void;
}

interface AnalysisData {
    strategicSummary: string;
    actionableSuggestions: string[];
}

const AiClientSummaryModal: React.FC<AiClientSummaryModalProps> = ({ client, tenders, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const keyMetrics = useMemo(() => {
    const wonTenders = tenders.filter(t => t.status === TenderStatus.Won);
    const lostTenders = tenders.filter(t => t.status === TenderStatus.Lost);
    const totalCompleted = wonTenders.length + lostTenders.length;
    
    const totalValueWon = wonTenders.reduce((sum, t) => sum + t.value, 0);
    const winRate = totalCompleted > 0 ? (wonTenders.length / totalCompleted) * 100 : 0;
    const activeTenderValue = tenders.filter(t => ![TenderStatus.Won, TenderStatus.Lost].includes(t.status)).reduce((sum, t) => sum + t.value, 0);

    return { totalValueWon, winRate, activeTenderValue };
  }, [tenders]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await summarizeClientActivity(client, tenders);
        setAnalysis(result);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [client, tenders]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
                <SparklesIcon className="w-6 h-6 text-indigo-500"/>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Client Analysis</h2>
            </div>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
                Strategic overview for <span className="font-semibold text-slate-700 dark:text-slate-300">{client.name}</span>
            </p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <p className="mt-4">Our AI is analyzing the client relationship...</p>
                </div>
            ) : error ? (
                 <div className="text-center text-red-500 p-4">
                    <p className="font-bold">Analysis Failed</p>
                    <p className="text-base">{error}</p>
                </div>
            ) : analysis ? (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Key Metrics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-sm text-slate-500 dark:text-slate-400">Value Won</p><p className="font-bold text-lg text-green-600 dark:text-green-400">{formatLargeIndianNumber(keyMetrics.totalValueWon)}</p></div>
                            <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-sm text-slate-500 dark:text-slate-400">Win Rate</p><p className="font-bold text-lg text-blue-600 dark:text-blue-400">{keyMetrics.winRate.toFixed(1)}%</p></div>
                            <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-sm text-slate-500 dark:text-slate-400">Active Pipeline</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{formatLargeIndianNumber(keyMetrics.activeTenderValue)}</p></div>
                        </div>
                    </div>
                     <div className="prose prose-slate dark:prose-invert max-w-none text-base">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Strategic Summary</h3>
                        <p>{analysis.strategicSummary}</p>
                        
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mt-6">Actionable Suggestions</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {analysis.actionableSuggestions.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            ) : null}
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

export default AiClientSummaryModal;