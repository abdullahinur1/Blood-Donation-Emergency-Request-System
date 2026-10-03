import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  ShieldCheck,
  CheckCircle,
  Clock,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Users,
} from 'lucide-react';
import { requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchHospitalRequests = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequests();
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalRequests();
  }, []);

  const handleVerify = async (requestId) => {
    try {
      await requestService.verifyRequest(requestId);
      setActionSuccess('Request verified and approved for transfusion coordination.');
      fetchHospitalRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleMarkFulfilled = async (requestId, unitsNeeded) => {
    try {
      await requestService.updateStatus(requestId, {
        status: 'Fulfilled',
        unitsFulfilled: unitsNeeded,
      });
      setActionSuccess('Request marked as Fulfilled: Blood received and transfusion recorded.');
      fetchHospitalRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pendingVerification = requests.filter((r) => r.status === 'Pending');
  const activeCoordinating = requests.filter((r) => r.status === 'Approved' || r.status === 'Matched');
  const fulfilledCount = requests.filter((r) => r.status === 'Fulfilled').length;

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Hospital Medical Staff
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Facility: <strong>{user?.organizationName || 'Harborview Medical Center'}</strong> • {user?.city}, {user?.state || 'WA'}
              </p>
            </div>
          </div>

          <Link
            to="/requests/create"
            className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Create Patient Request
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Pending Clinical Verification"
          value={pendingVerification.length}
          icon={AlertCircle}
          color="amber"
          subtitle="Requests awaiting staff verification"
        />
        <StatCard
          title="Active Emergency Transfusions"
          value={activeCoordinating.length}
          icon={Clock}
          color="blue"
          subtitle="Donors pledged / In transit"
        />
        <StatCard
          title="Fulfilled Transfusions"
          value={fulfilledCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Units received & confirmed"
        />
      </div>

      {/* Section 1: Pending Verification Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Pending Requests Verification Queue
            </h2>
            <p className="text-xs text-slate-500">
              Verify patient identities and approve requests so donors and blood banks can fulfill them.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            {pendingVerification.length} Pending
          </span>
        </div>

        {pendingVerification.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No pending requests currently waiting for verification. All clear!
          </p>
        ) : (
          <div className="space-y-3">
            {pendingVerification.map((req) => (
              <div
                key={req._id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <span className="font-bold text-slate-900 text-sm">{req.patientName}</span>
                    <StatusBadge status={req.urgency} />
                  </div>
                  <p className="text-slate-600">
                    Needs: <strong>{req.unitsNeeded} Units</strong> at {req.hospitalName} ({req.city})
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Submitted by: {req.contactName} ({req.contactPhone})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700"
                  >
                    Review Details
                  </Link>
                  <button
                    onClick={() => handleVerify(req._id)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Verify & Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Coordinating Requests */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Active Hospital Transfusion Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active requests found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div
                key={req._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BloodGroupBadge group={req.bloodGroup} size="sm" />
                    <span className="font-bold text-slate-900 text-sm">{req.patientName}</span>
                    <StatusBadge status={req.status} />
                    <StatusBadge status={req.urgency} />
                  </div>
                  <p className="text-slate-600">
                    Units: <strong>{req.unitsFulfilled || 0} / {req.unitsNeeded}</strong> •{' '}
                    {req.pledges?.length || 0} Donor Pledges • Hospital: {req.hospitalName}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
                  >
                    View
                  </Link>

                  {req.status !== 'Fulfilled' && req.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleMarkFulfilled(req._id, req.unitsNeeded)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Blood Received
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
