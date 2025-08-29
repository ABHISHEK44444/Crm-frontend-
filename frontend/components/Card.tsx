
import React from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, value, icon, change, changeType, onClick }) => {
  const changeColor = changeType === 'positive' ? 'text-green-400' : 'text-red-400';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full text-left bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 hover:shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:cursor-default disabled:hover:shadow-lg border border-transparent dark:border-[#30363d] dark:hover:border-cyan-500/30"
    >
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      </div>
      <div className="mt-2">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
        {change && (
          <p className={`text-base mt-1 ${changeColor}`}>
            {change}
          </p>
        )}
      </div>
    </button>
  );
};

export default Card;