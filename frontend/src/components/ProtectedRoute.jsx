import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
        <p className="text-slate-600 text-sm">
          Your current account role <span className="font-bold text-rose-600">({user?.role})</span> is not authorized to access this section.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
          >
            Go to My Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
