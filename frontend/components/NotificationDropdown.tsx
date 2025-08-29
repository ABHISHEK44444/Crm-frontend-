import React, { useEffect } from 'react';
import { AppNotification } from '../types';
import { BellIcon } from '../constants';
import { formatRelativeTime } from '../utils/formatting';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onClose: () => void;
  onNotificationClick: (tenderId: string) => void;
  onMarkAsRead: () => void;
  onViewAll: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose, onNotificationClick, onMarkAsRead, onViewAll }) => {
  useEffect(() => {
    // When the dropdown opens, mark all notifications as read.
    onMarkAsRead();
  }, [onMarkAsRead]);

  const getNotificationStyle = (type: AppNotification['type']) => {
    switch(type) {
        case 'assignment': return 'bg-red-500';
        case 'deadline': return 'bg-orange-500';
        case 'reassignment': return 'bg-yellow-500';
        case 'expiry': return 'bg-purple-500';
        case 'approval': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
  };

  const recentNotifications = notifications.slice(0, 7);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose}></div>
      <div className="absolute top-14 right-0 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 z-30 flex flex-col max-h-[70vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
        </div>
        <ul className="flex-grow overflow-y-auto">
          {recentNotifications.length > 0 ? (
            recentNotifications.map(notif => (
              <li key={notif.id} className="relative">
                <button
                  onClick={() => onNotificationClick(notif.relatedTenderId)}
                  className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex items-start space-x-3"
                >
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" aria-label="Unread"></div>
                  )}
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${getNotificationStyle(notif.type)} ${notif.isRead ? 'ml-[14px]' : ''}`}></div>
                  <div className="flex-grow">
                     <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight">{notif.message}</p>
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatRelativeTime(notif.timestamp)}</p>
                  </div>
                </button>
              </li>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <BellIcon className="w-10 h-10 mx-auto mb-2"/>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </ul>
        <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button onClick={onViewAll} className="w-full text-center text-sm font-semibold text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 py-2 rounded-md transition-colors">
                View All Notifications
            </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;