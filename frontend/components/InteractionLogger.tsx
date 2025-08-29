import React, { useState } from 'react';
import { InteractionLog } from '../types';

interface InteractionLoggerProps {
    interactions: InteractionLog[];
    onLogInteraction: (interaction: Omit<InteractionLog, 'id' | 'user' | 'userId' | 'timestamp'>) => void;
}

const InteractionLogger: React.FC<InteractionLoggerProps> = ({ interactions, onLogInteraction }) => {
    const [type, setType] = useState<'Call' | 'Email' | 'Meeting'>('Meeting');
    const [notes, setNotes] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSave = () => {
        if (notes.trim()) {
            onLogInteraction({ type, notes });
            setNotes('');
            setType('Meeting');
            setShowForm(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interaction Log</h3>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {showForm ? 'Cancel' : '+ Log Interaction'}
                </button>
            </div>
            
            {showForm && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4 space-y-3">
                    <div className="flex space-x-1 bg-slate-200 dark:bg-slate-600 p-1 rounded-lg">
                        {(['Meeting', 'Call', 'Email'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                    type === t
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-500/50'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={`Notes for ${type}...`}
                        rows={3}
                        className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"
                    />
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700">
                        Save Log
                    </button>
                </div>
            )}

            <ul className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-60 overflow-y-auto">
                {interactions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                    <li key={log.id} className="p-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.type} with {log.user}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">{new Date(log.timestamp).toLocaleDateString('en-IN')}</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{log.notes}</p>
                    </li>
                ))}
                {interactions.length === 0 && <p className="p-4 text-sm text-center text-slate-500">No interactions logged.</p>}
            </ul>
        </div>
    );
};

export default InteractionLogger;
