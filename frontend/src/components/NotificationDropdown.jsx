import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-100 z-50 overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                No notifications right now
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 text-xs transition-colors hover:bg-slate-50 flex items-start justify-between gap-3 ${
                    !n.isRead ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      if (!n.isRead) markAsRead(n._id);
                    }}
                  >
                    <p className={`font-semibold ${!n.isRead ? 'text-rose-900' : 'text-slate-800'}`}>
                      {n.title}
                    </p>
                    <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline mt-1.5 font-medium"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
