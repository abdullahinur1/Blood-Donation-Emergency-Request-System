import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Heart,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const RequesterDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCancelId, setSelectedCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequests({ myRequests: true });
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
    fetchMyRequests();
  }, []);

  const handleCancelRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestService.updateStatus(selectedCancelId, {
        status: 'Cancelled',
        cancellationReason: cancelReason,
      });
      setSelectedCancelId(null);
      setCancelReason('');
      fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = requests.filter((r) => r.status !== 'Fulfilled' && r.status !== 'Cancelled').length;
  const fulfilledCount = requests.filter((r) => r.status === 'Fulfilled').length;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Requester Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track and manage your submitted patient blood emergency requests.
          </p>
        </div>

        <Link
          to="/requests/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Submit New Request
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Requests"
          value={activeCount}
          icon={AlertCircle}
          color="rose"
          subtitle="Currently coordinating with donors & banks"
        />
        <StatCard
          title="Fulfilled Transfusions"
          value={fulfilledCount}
          icon={CheckCircle}
          color="emerald"
          subtitle="Successfully matched & delivered"
        />
        <StatCard
          title="Total Requests Submitted"
          value={requests.length}
          icon={Clock}
          color="indigo"
          subtitle="All-time requests from this account"
        />
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900">My Emergency Blood Requests</h2>

        {requests.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-xs text-slate-400">You haven't submitted any blood requests yet.</p>
            <Link
              to="/requests/create"
              className="inline-block px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
            >
              Submit an Emergency Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge group={req.bloodGroup} size="lg" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                      <p className="text-xs text-slate-500">
                        {req.hospitalName} • Needed by {new Date(req.requiredByDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <StatusBadge status={req.urgency} />
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      Units: <strong>{req.unitsFulfilled || 0} / {req.unitsNeeded}</strong>
                    </span>
                    <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-semibold">
                      {req.pledges?.length || 0} Donor Pledge(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                  >
                    Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {req.status !== 'Fulfilled' && req.status !== 'Cancelled' && (
                    <button
                      onClick={() => setSelectedCancelId(req._id)}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {selectedCancelId && (
        <Modal
          isOpen={!!selectedCancelId}
          onClose={() => setSelectedCancelId(null)}
          title="Confirm Request Cancellation"
        >
          <form onSubmit={handleCancelRequest} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Please let us know why you wish to cancel this request. Donors who pledged will be released.
            </p>
            <textarea
              required
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Found alternate blood donor / patient condition stabilized"
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCancelId(null)}
                className="px-4 py-2 border rounded-xl"
              >
                Keep Request
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
              >
                Confirm Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RequesterDashboard;
