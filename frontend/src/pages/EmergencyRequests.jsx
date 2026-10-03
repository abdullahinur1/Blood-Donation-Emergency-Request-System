import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle,
  Building,
} from 'lucide-react';
import { requestService } from '../services/api';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';

const EmergencyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('');

  const bloodGroups = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const statuses = ['All', 'Pending', 'Approved', 'Matched', 'Fulfilled', 'Cancelled'];
  const urgencies = ['All', 'Critical', 'Urgent', 'Standard'];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (urgencyFilter !== 'All') params.urgency = urgencyFilter;
      if (bloodGroupFilter !== 'All') params.bloodGroup = bloodGroupFilter;
      if (cityFilter.trim() !== '') params.city = cityFilter.trim();

      const res = await requestService.getRequests(params);
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter, bloodGroupFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Live Emergency Transfusion Feed
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Emergency Blood Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time patient requests from certified hospitals and verified requesters.
          </p>
        </div>

        <Link
          to="/requests/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Submit Blood Request
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Search by city (e.g. Seattle, Bellevue)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setCityFilter('');
                setStatusFilter('All');
                setUrgencyFilter('All');
                setBloodGroupFilter('All');
              }}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          {/* Status */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700">Status:</span>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                    statusFilter === s
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700">Urgency:</span>
            <div className="flex flex-wrap gap-1">
              {urgencies.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgencyFilter(u)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                    urgencyFilter === u
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Group */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700">Blood Group:</span>
            <div className="flex flex-wrap gap-1">
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBloodGroupFilter(bg)}
                  className={`px-2 py-1 rounded-lg font-bold border transition-all ${
                    bloodGroupFilter === bg
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-100 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No blood requests match your selected status, urgency, or location filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{requests.length}</strong> emergency requests
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => {
              const percentFulfilled = Math.min(
                100,
                Math.round(((req.unitsFulfilled || 0) / req.unitsNeeded) * 100)
              );

              return (
                <div
                  key={req._id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    req.urgency === 'Critical' && req.status !== 'Fulfilled' && req.status !== 'Cancelled'
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Blood Group & Urgency / Status */}
                    <div className="flex items-center justify-between">
                      <BloodGroupBadge group={req.bloodGroup} size="lg" />
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={req.urgency} />
                        <StatusBadge status={req.status} />
                      </div>
                    </div>

                    {/* Patient & Hospital */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {req.patientName}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{req.hospitalName}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{req.city}, {req.state || 'WA'}</span>
                      </p>
                    </div>

                    {/* Fulfillment Progress Bar */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Fulfillment Status:</span>
                        <span className="font-bold text-slate-800">
                          {req.unitsFulfilled || 0} / {req.unitsNeeded} Units ({percentFulfilled}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            percentFulfilled >= 100
                              ? 'bg-emerald-500'
                              : percentFulfilled > 0
                              ? 'bg-indigo-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${percentFulfilled}%` }}
                        />
                      </div>
                    </div>

                    {/* Deadline Date */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Required by:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(req.requiredByDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50/50 p-2 rounded-lg">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {req.pledges?.length || 0} donor pledge(s)
                    </span>
                    <Link
                      to={`/requests/${req._id}`}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      View & Respond →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRequests;
