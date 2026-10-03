import React from 'react';
import { Heart, ShieldCheck, PhoneCall, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                <Droplet className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Life<span className="text-rose-600">Pulse</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bridging the critical gap between blood donors, emergency patients, hospitals, and blood banks with real-time matching.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" /> HIPAA-conscious & Encrypted
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Quick Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/donors" className="hover:text-rose-600 transition-colors">Find Blood Donors</Link></li>
              <li><Link to="/requests" className="hover:text-rose-600 transition-colors">Emergency Blood Requests</Link></li>
              <li><Link to="/requests/create" className="hover:text-rose-600 transition-colors">Submit Urgent Request</Link></li>
              <li><Link to="/inventory" className="hover:text-rose-600 transition-colors">Live Blood Inventory</Link></li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">User Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-rose-600 transition-colors">Donor Portal</Link></li>
              <li><Link to="/login" className="hover:text-rose-600 transition-colors">Patient / Requester Portal</Link></li>
              <li><Link to="/login" className="hover:text-rose-600 transition-colors">Hospital Staff Portal</Link></li>
              <li><Link to="/login" className="hover:text-rose-600 transition-colors">Blood Bank Portal</Link></li>
              <li><Link to="/login" className="hover:text-rose-600 transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Emergency Hotline */}
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <PhoneCall className="w-4 h-4" /> 24/7 Emergency Dispatch
            </div>
            <p className="text-xs text-rose-950 font-black text-lg mt-1 tracking-tight">
              1-800-BLOOD-LINE
            </p>
            <p className="text-[11px] text-rose-600 mt-1">
              For instant hospital critical trauma escalation and inter-bank transfers.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} LifePulse Blood Management System. Built for emergency response.</p>
          <p className="flex items-center gap-1">
            Every drop counts <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Save lives today
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
