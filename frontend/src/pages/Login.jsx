import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Droplet, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setIsSubmitting(true);
    try {
      await quickLoginAs(demoEmail);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError('Failed to login with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    { role: 'Donor', email: 'donor@example.com', desc: 'Cabdiraxmaan Cilmi (O- Universal Donor, Muqdisho)', color: 'border-rose-200 hover:bg-rose-50 text-rose-700' },
    { role: 'Requester', email: 'requester@example.com', desc: 'Deeqa Axmed Warsame (Qoyska Bukaanka, Muqdisho)', color: 'border-amber-200 hover:bg-amber-50 text-amber-700' },
    { role: 'Hospital Staff', email: 'hospital@example.com', desc: 'Dr. Fadumo Cali Shire (Isbitaalka Banaadir)', color: 'border-blue-200 hover:bg-blue-50 text-blue-700' },
    { role: 'Blood Bank Staff', email: 'bloodbank@example.com', desc: 'Sahra Yuusuf Nuur (Bangiga Dhiigga Qaranka)', color: 'border-indigo-200 hover:bg-indigo-50 text-indigo-700' },
    { role: 'Admin', email: 'admin@example.com', desc: 'Abdullahi Maxamed Barre (Maamulaha Guud)', color: 'border-purple-200 hover:bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Login Form Box */}
      <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to your LifePulse portal account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-rose-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>

      {/* Demo Fast Login Box */}
      <div className="lg:col-span-6 bg-slate-50/80 p-6 rounded-3xl border border-slate-200/90 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Quick 1-Click Demo Accounts</span>
        </div>
        <p className="text-xs text-slate-500">
          Click any role below to instantly log in as a pre-configured user and evaluate all role features:
        </p>

        <div className="space-y-2.5">
          {demoAccounts.map((acc) => (
            <button
              key={acc.role}
              onClick={() => handleDemoLogin(acc.email)}
              disabled={isSubmitting}
              className={`w-full p-3 rounded-2xl bg-white border text-left transition-all hover:scale-[1.01] hover:shadow-xs flex items-center justify-between group ${acc.color}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">{acc.role}</span>
                  <span className="text-[10px] text-slate-400 font-normal font-mono">{acc.email}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{acc.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-current transition-all shrink-0 ml-2" />
            </button>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
          💡 <strong>Tip:</strong> Password for all demo accounts is <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">password123</code>.
        </div>
      </div>
    </div>
  );
};

export default Login;
