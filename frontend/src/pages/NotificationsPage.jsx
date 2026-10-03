import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">In-App Notifications</h1>
          <p className="text-xs text-slate-500">
            Real-time emergency request alerts, donor pledges, and system status updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Notifications</h3>
            <p className="text-xs text-slate-400">You're all caught up with your alerts!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 transition-colors flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-rose-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-bold ${!n.isRead ? 'text-rose-900' : 'text-slate-800'}`}>
                    {n.title}
                  </h4>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>

                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteNotification(n._id)}
                className="text-slate-300 hover:text-rose-500 p-2 rounded-lg transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
