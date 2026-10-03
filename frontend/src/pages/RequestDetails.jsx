import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  Phone,
  User,
  Heart,
  Package,
  ShieldCheck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Users,
  Send,
} from 'lucide-react';
import { requestService, donorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [request, setRequest] = useState(null);
  const [compatibleDonors, setCompatibleDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [pledgeUnits, setPledgeUnits] = useState(1);
  const [pledgeNotes, setPledgeNotes] = useState('');

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateUnits, setAllocateUnits] = useState(1);
  const [allocateNotes, setAllocateNotes] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequestById(id);
      if (res.data.success) {
        setRequest(res.data.request);
        setCompatibleDonors(res.data.compatibleDonors || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  // Donor Pledge Handler
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await donorService.pledgeToRequest(id, {
        units: Number(pledgeUnits),
        notes: pledgeNotes,
      });
      setPledgeModalOpen(false);
      setActionSuccess('Thank you! Your donation pledge has been registered.');
      fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit pledge.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Hospital Verify Handler
  const handleVerify = async () => {
    setSubmittingAction(true);
    try {
      await requestService.verifyRequest(id);
      setActionSuccess('Request verified and approved successfully.');
      fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Hospital / Staff Mark Fulfilled Handler
  const handleMarkFulfilled = async () => {
    if (!window.confirm('Mark this request as completely fulfilled?')) return;
    setSubmittingAction(true);
    try {
      await requestService.updateStatus(id, {
        status: 'Fulfilled',
        unitsFulfilled: request.unitsNeeded,
      });
      setActionSuccess('Request marked as Fulfilled.');
      fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Blood Bank Allocate Handler
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await requestService.allocateUnits(id, {
        unitsAllocated: Number(allocateUnits),
        bloodBankName: user?.organizationName || 'Regional Blood Bank',
        notes: allocateNotes,
      });
      setAllocateModalOpen(false);
      setActionSuccess('Units allocated from blood bank inventory successfully.');
      fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate inventory units.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Cancel Handler
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await requestService.updateStatus(id, {
        status: 'Cancelled',
        cancellationReason: cancelReason,
      });
      setCancelModalOpen(false);
      setActionSuccess('Blood request has been cancelled.');
      fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Error Loading Request</h2>
        <p className="text-xs text-slate-500">{error || 'Request not found'}</p>
        <button
          onClick={() => navigate('/requests')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const isOwner = user?.id === request.requester?._id || user?.id === request.requester;
  const isHospitalStaff = user?.role === 'HospitalStaff';
  const isBloodBankStaff = user?.role === 'BloodBankStaff';
  const isAdmin = user?.role === 'Admin';
  const isDonor = user?.role === 'Donor';

  const alreadyPledged = request.pledges?.some(
    (p) => (p.donor?._id || p.donor) === user?.id
  );

  const statuses = ['Pending', 'Approved', 'Matched', 'Fulfilled'];
  const currentStep = statuses.indexOf(request.status);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Back button & Alerts */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/requests')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Emergency Feed
        </button>

        <span className="text-xs text-slate-400 font-mono">Ref ID: #{request._id}</span>
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

      {/* Main Request Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xs transition-all ${
          request.urgency === 'Critical'
            ? 'bg-rose-50/70 border-rose-200 ring-2 ring-rose-500/10'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <BloodGroupBadge group={request.bloodGroup} size="xl" className="shadow-md" />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={request.urgency} />
                <StatusBadge status={request.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {request.patientName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                <Building className="w-4 h-4 text-slate-400" />
                {request.hospitalName} — {request.hospitalAddress}, {request.city}, {request.state}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-right space-y-1 self-start sm:self-auto min-w-[160px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Units Needed</span>
            <p className="text-2xl font-black text-slate-900">
              {request.unitsFulfilled || 0} / {request.unitsNeeded}{' '}
              <span className="text-xs text-slate-500 font-semibold">Units</span>
            </p>
            <span className="text-[11px] text-slate-400 block">
              Deadline: {new Date(request.requiredByDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Status Stepper Progression */}
        {request.status !== 'Cancelled' && (
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {statuses.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;
                return (
                  <div key={step} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed ? 'bg-rose-600' : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`block font-bold text-[11px] ${
                        isCurrent
                          ? 'text-rose-600'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {request.status === 'Cancelled' && (
          <div className="mt-6 p-3.5 bg-slate-100 rounded-xl text-xs text-slate-600">
            <strong>Cancelled:</strong> {request.cancellationReason || 'Request was cancelled.'}
          </div>
        )}
      </div>

      {/* Role-Based Action Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Available Role Actions
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Donor Pledge Action */}
          {isDonor && request.status !== 'Fulfilled' && request.status !== 'Cancelled' && (
            <button
              onClick={() => setPledgeModalOpen(true)}
              disabled={alreadyPledged}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                alreadyPledged
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              {alreadyPledged ? 'You Have Pledged to Donate' : 'Pledge to Donate Blood'}
            </button>
          )}

          {/* Hospital Staff: Verify & Approve */}
          {(isHospitalStaff || isAdmin) && request.status === 'Pending' && (
            <button
              onClick={handleVerify}
              disabled={submittingAction}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Verify & Approve Request
            </button>
          )}

          {/* Hospital Staff / Admin: Mark Fulfilled */}
          {(isHospitalStaff || isAdmin) &&
            request.status !== 'Fulfilled' &&
            request.status !== 'Cancelled' && (
              <button
                onClick={handleMarkFulfilled}
                disabled={submittingAction}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Mark Transfusion Fulfilled
              </button>
            )}

          {/* Blood Bank Staff: Allocate Inventory Stock */}
          {(isBloodBankStaff || isAdmin) &&
            request.status !== 'Fulfilled' &&
            request.status !== 'Cancelled' && (
              <button
                onClick={() => setAllocateModalOpen(true)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <Package className="w-4 h-4" /> Allocate Units from Blood Bank Stock
              </button>
            )}

          {/* Requester or Admin: Cancel Request */}
          {(isOwner || isAdmin) &&
            request.status !== 'Fulfilled' &&
            request.status !== 'Cancelled' && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-5 py-3 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Cancel Request
              </button>
            )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="px-5 py-3 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Sign In to Respond to this Request
            </Link>
          )}
        </div>
      </div>

      {/* Details & Pledges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Clinical & Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes and Request Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Clinical & Hospital Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Contact Person</span>
                <span className="font-bold text-slate-800">{request.contactName}</span>
                <a
                  href={`tel:${request.contactPhone}`}
                  className="font-bold text-rose-600 hover:underline block flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> {request.contactPhone}
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Requester Role</span>
                <span className="font-bold text-slate-800">
                  {request.requesterRole} ({request.requester?.name || 'Registered User'})
                </span>
                <span className="text-slate-500 block">
                  {request.requester?.organizationName || 'Independent'}
                </span>
              </div>
            </div>

            {request.notes && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-1">Clinical Notes</span>
                <p className="text-xs text-slate-600 p-3 bg-slate-50 rounded-xl leading-relaxed">
                  {request.notes}
                </p>
              </div>
            )}
          </div>

          {/* Donor Pledges List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                Donor Pledges ({request.pledges?.length || 0})
              </h3>
            </div>

            {(!request.pledges || request.pledges.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No donor pledges recorded yet. Compatible donors have been alerted.
              </p>
            ) : (
              <div className="space-y-3">
                {request.pledges.map((pledge, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {pledge.donor?.name || 'Anonymous Donor'} pledged {pledge.unitsPledged} unit(s)
                      </p>
                      {pledge.notes && (
                        <p className="text-slate-500 italic mt-0.5">"{pledge.notes}"</p>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Pledged: {new Date(pledge.pledgedAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                      {pledge.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blood Bank Allocations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              Blood Bank Stock Allocations ({request.bloodBankResponses?.length || 0})
            </h3>

            {(!request.bloodBankResponses || request.bloodBankResponses.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No direct blood bank inventory allocated yet.
              </p>
            ) : (
              <div className="space-y-2">
                {request.bloodBankResponses.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-indigo-950">
                        {res.bloodBankName} allocated {res.unitsAllocated} unit(s)
                      </p>
                      {res.notes && <p className="text-slate-600 mt-0.5">{res.notes}</p>}
                    </div>
                    <span className="text-[10px] text-indigo-500 font-medium">
                      {new Date(res.allocatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Compatible Donors In Network */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-600" />
                Compatible Donors ({compatibleDonors.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Voluntary donors whose blood can be safely transfused to patient ({request.bloodGroup}).
              </p>
            </div>

            {compatibleDonors.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No active compatible donors registered in this region currently.
              </p>
            ) : (
              <div className="space-y-3">
                {compatibleDonors.slice(0, 6).map((donor) => (
                  <div
                    key={donor._id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{donor.user?.name}</span>
                        <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {donor.city}, {donor.state || 'WA'}
                      </p>
                    </div>
                    <a
                      href={`tel:${donor.contactPhone}`}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                      title="Call donor"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Donor Pledge */}
      <Modal
        isOpen={pledgeModalOpen}
        onClose={() => setPledgeModalOpen(false)}
        title="Pledge Blood Donation"
      >
        <form onSubmit={handlePledgeSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            You are pledging to donate blood for <strong>{request.patientName}</strong> at{' '}
            <strong>{request.hospitalName}</strong>.
          </p>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Units to Donate</label>
            <input
              type="number"
              min="1"
              max="2"
              value={pledgeUnits}
              onChange={(e) => setPledgeUnits(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Notes (Arrival time / Comments)</label>
            <textarea
              rows="3"
              value={pledgeNotes}
              onChange={(e) => setPledgeNotes(e.target.value)}
              placeholder="e.g. Can arrive at the hospital laboratory today around 4:00 PM."
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPledgeModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl"
            >
              Confirm Pledge
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Blood Bank Allocate Units */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        title="Allocate Blood Bank Units"
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Allocate units of <strong>{request.bloodGroup}</strong> from your facility stock to this request.
          </p>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Units to Allocate</label>
            <input
              type="number"
              min="1"
              max={request.unitsNeeded}
              value={allocateUnits}
              onChange={(e) => setAllocateUnits(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Dispatch Notes / Storage Unit</label>
            <textarea
              rows="2"
              value={allocateNotes}
              onChange={(e) => setAllocateNotes(e.target.value)}
              placeholder="e.g. Courier dispatched via cold chain vehicle #4."
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAllocateModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cancel Request */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Emergency Blood Request"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to cancel this request? Pledged donors and staff will be notified.
          </p>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Cancellation Reason</label>
            <textarea
              required
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Transfusion fulfilled by alternate emergency supply."
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold"
            >
              Go Back
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RequestDetails;
