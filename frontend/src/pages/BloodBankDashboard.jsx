import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  PlusCircle,
  CheckCircle,
  Clock,
  Heart,
  Droplet,
  Send,
  Building,
  RefreshCw,
  Award,
} from 'lucide-react';
import { inventoryService, requestService, donationService, donorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const BloodBankDashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnits, setTotalUnits] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Record Donation Modal
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donorsList, setDonorsList] = useState([]);
  const [donorId, setDonorId] = useState('');
  const [donationBloodGroup, setDonationBloodGroup] = useState('O+');
  const [unitsDonated, setUnitsDonated] = useState(1);
  const [donationNotes, setDonationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, reqRes, donorsRes] = await Promise.all([
        inventoryService.getInventory(),
        requestService.getRequests({ status: 'Approved' }),
        donorService.searchDonors({}),
      ]);

      if (invRes.data.success) {
        setInventory(invRes.data.inventory);
        setTotalUnits(invRes.data.totalUnits);
        setLowStockCount(invRes.data.lowStockCount);
      }
      if (reqRes.data.success) {
        setRequests(reqRes.data.requests);
      }
      if (donorsRes.data.success) {
        setDonorsList(donorsRes.data.donors);
        if (donorsRes.data.donors.length > 0) {
          setDonorId(donorsRes.data.donors[0].user?._id || '');
          setDonationBloodGroup(donorsRes.data.donors[0].bloodGroup || 'O+');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await donationService.recordDonation({
        donorId,
        facilityName: user?.organizationName || 'Northwest Regional Blood Bank',
        bloodGroup: donationBloodGroup,
        unitsDonated: Number(unitsDonated),
        notes: donationNotes || 'Routine walk-in donation intake',
        addToInventory: true,
      });

      setDonationModalOpen(false);
      setActionSuccess(`Donation recorded! ${unitsDonated} unit(s) of ${donationBloodGroup} added to inventory. Certificate generated: ${res.data.donation?.certificateCode}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record donation');
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

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Blood Bank Staff
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Center: <strong>{user?.organizationName || 'Northwest Regional Blood Bank'}</strong> • {user?.city}, {user?.state || 'WA'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setDonationModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" /> Record Intake Donation
            </button>
            <Link
              to="/inventory"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all"
            >
              Manage Inventory
            </Link>
          </div>
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
          title="Total Reserve Stock"
          value={`${totalUnits} Units`}
          icon={Package}
          color="indigo"
          subtitle="Certified cold-storage units"
        />
        <StatCard
          title="Low Stock Warning Groups"
          value={`${lowStockCount} Groups`}
          icon={AlertTriangle}
          color="rose"
          subtitle="Below safety threshold (< 5 units)"
        />
        <StatCard
          title="Pending Requests Needing Blood"
          value={requests.length}
          icon={Clock}
          color="amber"
          subtitle="Approved hospital requests awaiting stock"
        />
      </div>

      {/* Low-stock Warning Bar if any */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Low Inventory Notice:</strong> {lowStockCount} blood groups are currently below the required safety threshold. Consider organizing a local blood drive or requesting inter-bank transfers.
            </span>
          </div>
          <Link
            to="/inventory"
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 font-bold rounded-lg text-amber-900 shrink-0"
          >
            Review Stock
          </Link>
        </div>
      )}

      {/* Quick Inventory Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Live Reserve Stock by Blood Group</h2>
          <Link to="/inventory" className="text-xs text-indigo-600 font-bold hover:underline">
            Full Inventory Page →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {inventory.map((item) => {
            const isLow = item.unitsAvailable <= item.lowStockThreshold;
            return (
              <div
                key={item._id}
                className={`p-3.5 rounded-2xl border text-center space-y-1.5 ${
                  isLow ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <BloodGroupBadge group={item.bloodGroup} size="md" />
                <p className="text-xl font-black text-slate-900 mt-1">{item.unitsAvailable}</p>
                <span className="text-[10px] text-slate-400 block">units</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Requests Waiting for Blood Bank Allocation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Approved Hospital Emergency Requests</h2>
            <p className="text-xs text-slate-500">
              Verified clinical requests ready for blood bank inventory allocation and courier dispatch.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{requests.length} Requests</span>
        </div>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No approved requests currently awaiting stock allocation.
          </p>
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
                    <StatusBadge status={req.urgency} />
                  </div>
                  <p className="text-slate-600">
                    Needs: <strong>{req.unitsNeeded - (req.unitsFulfilled || 0)} Units</strong> remaining • Hospital: {req.hospitalName} ({req.city})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Required by: {new Date(req.requiredByDate).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" /> Allocate Stock Units
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Record Intake Donation */}
      <Modal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        title="Record Walk-in / Drive Donation"
      >
        <form onSubmit={handleRecordDonation} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Record a voluntary donation from a donor. This will restock the inventory and issue a verified donation certificate to the donor.
          </p>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Select Registered Donor *</label>
            <select
              value={donorId}
              onChange={(e) => {
                setDonorId(e.target.value);
                const found = donorsList.find((d) => d.user?._id === e.target.value);
                if (found) setDonationBloodGroup(found.bloodGroup);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            >
              {donorsList.map((d) => (
                <option key={d.user?._id} value={d.user?._id}>
                  {d.user?.name} ({d.bloodGroup}) — {d.city}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Blood Group *</label>
              <select
                value={donationBloodGroup}
                onChange={(e) => setDonationBloodGroup(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Units Donated *</label>
              <input
                type="number"
                min="1"
                max="3"
                value={unitsDonated}
                onChange={(e) => setUnitsDonated(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Intake Notes / Phlebotomist Comments</label>
            <input
              type="text"
              value={donationNotes}
              onChange={(e) => setDonationNotes(e.target.value)}
              placeholder="e.g. Voluntary blood drive at University campus"
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDonationModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
            >
              Save & Restock Inventory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BloodBankDashboard;
