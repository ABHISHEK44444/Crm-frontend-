import React, { useState } from 'react';
import { BellIcon, LogOutIcon } from '../constants';
import { User, AppNotification, AssignmentStatus } from '../types';
import NotificationDropdown from './NotificationDropdown';


interface HeaderProps {
  title: string;
  currentUser: User;
  onLogout: () => void;
  notifications: AppNotification[];
  onNotificationClick: (tenderId: string) => void;
  onMarkNotificationsAsRead: () => void;
  onViewAllNotifications: () => void;
  currentUserParticipationStatus?: AssignmentStatus | null;
}

const Header: React.FC<HeaderProps> = ({ title, currentUser, onLogout, notifications, onNotificationClick, onMarkNotificationsAsRead, onViewAllNotifications, currentUserParticipationStatus }) => {
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;
  const hasUnreadAssignment = unreadNotifications.some(n => n.type === 'assignment');


  const handleViewAll = () => {
    setNotificationOpen(false);
    onViewAllNotifications();
  };
  
  return (
    <header className="bg-gray-100/80 dark:bg-[#161b22]/70 backdrop-blur-lg sticky top-0 z-20 h-20 flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#30363d]">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        {currentUserParticipationStatus === AssignmentStatus.Accepted && (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
            Participation Confirmed
          </span>
        )}
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
            <button 
                onClick={() => setNotificationOpen(prev => !prev)}
                className="relative text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              hasUnreadAssignment ? (
                <span className="absolute top-0 right-0 flex h-3 w-3 -mr-1 -mt-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              ) : (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-gray-100 dark:ring-[#161b22]" />
              )
            )}
            </button>
            {isNotificationOpen && (
                <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setNotificationOpen(false)}
                    onNotificationClick={(tenderId) => {
                        onNotificationClick(tenderId);
                        setNotificationOpen(false);
                    }}
                    onMarkAsRead={onMarkNotificationsAsRead}
                    onViewAll={handleViewAll}
                />
            )}
        </div>
        <div className="flex items-center space-x-3">
            <img 
                src={currentUser.avatarUrl}
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
            />
             <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">{currentUser.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.role}</p>
            </div>
        </div>
         <button 
            onClick={onLogout}
            title="Logout"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
            <LogOutIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;