import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Search,
  AlertCircle,
  Package,
  LayoutDashboard,
  PlusCircle,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, logout, quickLoginAs } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (email) => {
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    try {
      await quickLoginAs(email);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  const demoAccounts = [
    { label: 'Admin (Abdullahi Maxamed)', email: 'admin@example.com', badge: 'Admin', color: 'bg-purple-100 text-purple-700' },
    { label: 'Hospital Staff (Dr. Fadumo Cali)', email: 'hospital@example.com', badge: 'Hospital', color: 'bg-blue-100 text-blue-700' },
    { label: 'Blood Bank Staff (Sahra Yuusuf)', email: 'bloodbank@example.com', badge: 'BloodBank', color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Requester (Deeqa Axmed)', email: 'requester@example.com', badge: 'Requester', color: 'bg-amber-100 text-amber-700' },
    { label: 'Donor (Cabdiraxmaan Cilmi - O-)', email: 'donor@example.com', badge: 'Donor', color: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Life<span className="text-rose-600">Pulse</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
                Blood & Emergency MS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/donors"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/donors') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" /> Find Donors
            </Link>

            <Link
              to="/requests"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/requests') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-4 h-4" /> Emergency Requests
            </Link>

            <Link
              to="/inventory"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/inventory') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" /> Blood Inventory
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Switch role instantly to test each user perspective"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="hidden lg:inline">Demo Switch:</span>
                <span className="font-bold text-rose-600">{user?.role || 'Switch Role'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Test Account
                  </div>
                  <div className="space-y-1 mt-1">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => handleQuickSwitch(acc.email)}
                        className={`w-full text-left p-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between transition-colors ${
                          user?.email === acc.email ? 'bg-rose-50/60 font-semibold' : ''
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-medium text-slate-800">{acc.label}</p>
                          <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${acc.color}`}>
                          {acc.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Blood Request Quick Button */}
            <Link
              to="/requests/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-rose-500/20 hover:shadow-md hover:shadow-rose-500/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Request Blood
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <NotificationDropdown />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs border border-rose-200">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">{user?.role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              to="/donors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Find Donors
            </Link>
            <Link
              to="/requests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> Emergency Requests
            </Link>
            <Link
              to="/inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Blood Inventory
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> My Dashboard ({user?.role})
              </Link>
            )}
            <Link
              to="/requests/create"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Create Blood Request
            </Link>
          </div>

          {/* Mobile Role Switcher */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Test Role Switcher
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickSwitch(acc.email)}
                  className={`px-2.5 py-1.5 text-xs text-left rounded-lg font-medium border border-slate-200 truncate ${
                    user?.email === acc.email ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50'
                  }`}
                >
                  {acc.badge}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <User className="w-4 h-4" /> {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-bold text-white bg-rose-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
