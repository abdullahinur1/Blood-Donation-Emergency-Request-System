import React from 'react';

const statusStyles = {
  // Request Statuses
  Pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20',
  Approved: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-400/20',
  Matched: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-400/20',
  Fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/20',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-300/30',

  // Urgency Statuses
  Standard: 'bg-slate-50 text-slate-700 border-slate-200',
  Urgent: 'bg-orange-50 text-orange-700 border-orange-200 font-semibold',
  Critical: 'bg-rose-500 text-white font-bold animate-emergency shadow-sm shadow-rose-500/30 border-rose-600',

  // Availability
  Available: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Unavailable: 'bg-slate-100 text-slate-500 border-slate-200',
};

const StatusBadge = ({ status, type = 'status', className = '' }) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium uppercase tracking-wider ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
