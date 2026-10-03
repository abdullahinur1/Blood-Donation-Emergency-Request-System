import React from 'react';

const bloodColors = {
  'A+': 'bg-rose-100 text-rose-800 border-rose-200',
  'A-': 'bg-rose-200 text-rose-900 border-rose-300',
  'B+': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'B-': 'bg-indigo-200 text-indigo-900 border-indigo-300',
  'AB+': 'bg-purple-100 text-purple-800 border-purple-200',
  'AB-': 'bg-purple-200 text-purple-900 border-purple-300',
  'O+': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'O-': 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
};

const BloodGroupBadge = ({ group, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-base px-3.5 py-1.5 font-extrabold',
    xl: 'text-xl px-4 py-2 font-black',
  };

  const colorClass = bloodColors[group] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border shadow-xs tracking-wider ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      {group}
    </span>
  );
};

export default BloodGroupBadge;
