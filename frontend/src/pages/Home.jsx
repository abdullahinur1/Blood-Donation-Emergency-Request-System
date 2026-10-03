import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Search,
  AlertCircle,
  Package,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { statsService, requestService } from '../services/api';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import { COMPATIBLE_DONORS_FOR_RECIPIENT } from '../utils/compatibilityMatrix';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('O-');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          statsService.getOverview(),
          requestService.getRequests({ urgency: 'Critical' }),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (requestsRes.data.success) {
          setRecentRequests(requestsRes.data.requests.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-rose-900/30">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
          <Droplet className="w-96 h-96 text-white" />
        </div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            24/7 Real-Time Blood Emergency Network
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            When Seconds Count, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-amber-200">
              Every Drop Saves Lives.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            A unified management system linking voluntary blood donors, patients in critical emergencies, hospitals, and blood banks for instant verified matching.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/requests/create"
              className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/30 hover:scale-102 transition-all flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> Request Emergency Blood
            </Link>
            <Link
              to="/donors"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-xs hover:scale-102 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Find Available Donors
            </Link>
            <Link
              to="/register"
              className="px-6 py-3.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/30 hover:scale-102 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" /> Register as Donor
            </Link>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-10 border-t border-white/10">
          <div>
            <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Active Donors</p>
            <p className="text-3xl font-black mt-1 text-white">{stats ? stats.totalDonors : '...'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stats ? `${stats.availableDonors} Available Now` : 'Checking...'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Total Requests</p>
            <p className="text-3xl font-black mt-1 text-white">{stats ? stats.totalRequests : '...'}</p>
            <p className="text-xs text-emerald-400 mt-0.5">{stats ? `${stats.fulfilledRequests} Fulfilled` : 'Calculating...'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Critical Pending</p>
            <p className="text-3xl font-black mt-1 text-rose-400">{stats ? stats.criticalRequests : '...'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Urgent patient cases</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Bank Inventory</p>
            <p className="text-3xl font-black mt-1 text-white">{stats ? stats.totalUnitsInStock : '...'}</p>
            <p className="text-xs text-amber-300 mt-0.5">{stats ? `${stats.lowStockCount} types in low stock` : 'Checking...'}</p>
          </div>
        </div>
      </section>

      {/* Critical Emergency Ticker / Active Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping inline-block" />
              Urgent & Critical Emergency Requests
            </h2>
            <p className="text-xs text-slate-500">Live verified requests requiring immediate response</p>
          </div>
          <Link
            to="/requests"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
          >
            View all requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentRequests.length === 0 ? (
            <div className="col-span-4 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              No active critical requests at this moment.
            </div>
          ) : (
            recentRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <BloodGroupBadge group={req.bloodGroup} size="lg" />
                    <StatusBadge status={req.urgency} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.hospitalName}, {req.city}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Needed:</span>
                      <span className="font-bold text-slate-800">{req.unitsNeeded} Units</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Fulfilled:</span>
                      <span className="font-bold text-emerald-600">{req.unitsFulfilled || 0} Units</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="text-slate-700">{req.status}</strong>
                  </span>
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Respond
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Interactive Blood Compatibility Matrix Widget */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Match Guide
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Blood Compatibility Matrix</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Select a patient or recipient blood group below to see which donor blood types are medically compatible for transfusion.
          </p>
        </div>

        {/* Blood group selector pills */}
        <div className="flex flex-wrap gap-2">
          {bloodGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                selectedGroup === group
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Selected Results */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient:</span>
            <BloodGroupBadge group={selectedGroup} size="lg" />
            <span className="text-xs text-slate-500">can safely receive red blood cells from:</span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {(COMPATIBLE_DONORS_FOR_RECIPIENT[selectedGroup] || []).map((donorGroup) => (
              <div
                key={donorGroup}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs"
              >
                <BloodGroupBadge group={donorGroup} size="md" />
                <span className="text-xs font-bold text-slate-700">
                  {donorGroup === 'O-' ? 'Universal Donor' : 'Compatible'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              LifePulse automatically filters and notifies matching registered donors who have compatible blood groups.
            </span>
          </div>
        </div>
      </section>

      {/* 3 Steps / How it works */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">How LifePulse Coordinates Emergency Response</h2>
          <p className="text-xs text-slate-500">Fast, verified, and secure blood request fulfillment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg border border-rose-100">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Request Initiated</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hospital staff or family requesters submit urgent patient blood requirements with units needed, hospital location, and urgency status.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Smart Match & Stock Alert</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compatible available donors receive in-app alerts, while nearby blood banks evaluate live inventories to allocate needed units.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Donation & Fulfillment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donors pledge, blood is received and verified by hospital staff, inventory updates automatically, and donor history certificates are generated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
