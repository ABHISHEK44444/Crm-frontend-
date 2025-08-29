import React, { useState } from 'react';
import { TendersIcon, UserIcon, EyeIcon, EyeOffIcon } from '../constants';

interface LoginProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
}

const LockIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 5.25a3.75 3.75 0 0 1 7.5 0v3a.75.75 0 0 1-1.5 0v-3a2.25 2.25 0 0 0-4.5 0v3a.75.75 0 0 1-1.5 0v-3Z" clipRule="evenodd" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await onLogin(username, password);
        if (!success) {
            setError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div 
            className="w-full min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="w-full max-w-md bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-slate-700/50">
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-cyan-500/10 rounded-full border-8 border-cyan-500/5">
                        <TendersIcon className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">M Intergraph</h1>
                    <p className="text-gray-600 dark:text-gray-400">CRM & Tender Management</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-bold text-gray-900 dark:text-gray-100">Username</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="User"
                                required
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-900 dark:text-gray-100">Password</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Passward"
                                required
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-200"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    );
};

export default Login;
