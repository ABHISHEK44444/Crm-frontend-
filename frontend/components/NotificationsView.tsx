
import React from 'react';
import { AppNotification } from '../types';
import { BellIcon, CheckCircleIcon } from '../constants';
import { formatRelativeTime } from '../utils/formatting';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onNotificationClick: (tenderId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onNotificationClick, onMarkAllAsRead }) => {
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const groupedNotifications = notifications.reduce((acc, notif) => {
        const date = new Date(notif.timestamp).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(notif);
        return acc;
    }, {} as Record<string, AppNotification[]>);

    const getGroupTitle = (dateString: string) => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (dateString === today) return 'Today';
        if (dateString === yesterday) return 'Yesterday';
        return new Date(dateString).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-3">
                    <BellIcon className="w-8 h-8 text-slate-500"/>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Notifications</h2>
                 </div>
                 {unreadCount > 0 && (
                    <button onClick={onMarkAllAsRead} className="flex items-center space-x-2 text-sm font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
                        <CheckCircleIcon className="w-5 h-5"/>
                        <span>Mark all as read</span>
                    </button>
                 )}
            </div>

            {Object.keys(groupedNotifications).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedNotifications).map(([date, notifs]) => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 pb-2 mb-4 border-b border-slate-200 dark:border-slate-700">
                                {getGroupTitle(date)}
                            </h3>
                            <div className="space-y-3">
                                {/* Fix: Cast 'notifs' to AppNotification[] to resolve 'unknown' type from Object.entries */}
                                {(notifs as AppNotification[]).map(notif => (
                                    <button
                                        key={notif.id}
                                        onClick={() => onNotificationClick(notif.relatedTenderId)}
                                        className="w-full text-left p-4 rounded-lg flex items-start space-x-4 transition-colors bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm border dark:border-slate-700"
                                    >
                                        {!notif.isRead && (
                                            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" aria-label="Unread"></div>
                                        )}
                                        <div className="flex-grow">
                                            <p className="text-slate-700 dark:text-slate-300">{notif.message}</p>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{formatRelativeTime(notif.timestamp)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500">
                     <BellIcon className="w-16 h-16 mx-auto mb-4"/>
                     <h3 className="text-xl font-semibold">All caught up</h3>
                     <p>You have no notifications.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsView;