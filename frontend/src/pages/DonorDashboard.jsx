import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  AlertCircle,
  ArrowRight,
  Shield,
  FileCheck,
  Phone,
} from 'lucide-react';
import { donorService, donationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [compatibleRequests, setCompatibleRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, requestsRes, donationsRes] = await Promise.all([
        donorService.getProfile(),
        donorService.getCompatibleRequests(),
        donationService.getMyDonations(),
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.profile);
      if (requestsRes.data.success) setCompatibleRequests(requestsRes.data.requests);
      if (donationsRes.data.success) setDonations(donationsRes.data.donations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      setToggling(true);
      const res = await donorService.toggleAvailability({
        isAvailableToDonate: !profile.isAvailableToDonate,
      });
      if (res.data.success) {
        setProfile((prev) => ({
          ...prev,
          isAvailableToDonate: res.data.isAvailableToDonate,
        }));
        setMessage(`Availability updated to ${res.data.isAvailableToDonate ? 'Available' : 'Unavailable'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isAvailable = profile?.isAvailableToDonate;

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Banner with Availability Switch */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <BloodGroupBadge group={profile?.bloodGroup || 'O+'} size="xl" className="shadow-lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
                <Shield className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              </div>
              <p className="text-xs text-rose-200 mt-1">
                Donor Profile • {profile?.city}, {profile?.state || 'WA'} • {profile?.gender}, {profile?.age} yrs
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Donation Status</p>
              <p className="text-xs text-rose-200 mt-0.5">
                {isAvailable ? 'Available for emergency alerts' : 'Temporarily paused'}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {isAvailable ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Available
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> Paused
                </>
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200">
            {message}
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Lifetime Donations"
          value={`${profile?.totalDonations || 0} Times`}
          icon={Award}
          color="rose"
          subtitle="Approx. 15 lives impacted"
        />
        <StatCard
          title="Compatible Requests"
          value={compatibleRequests.length}
          icon={AlertCircle}
          color="amber"
          subtitle={`Compatible with your ${profile?.bloodGroup} blood`}
        />
        <StatCard
          title="Last Donated"
          value={
            profile?.lastDonationDate
              ? new Date(profile.lastDonationDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Never'
          }
          icon={Calendar}
          color="emerald"
          subtitle="Safe gap interval: 56 days"
        />
      </div>

      {/* Compatible Blood Requests Needing You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
              Compatible Emergency Requests Needing Your Blood
            </h2>
            <p className="text-xs text-slate-500">
              Patients who can safely receive your <strong>{profile?.bloodGroup}</strong> blood type
            </p>
          </div>
          <Link
            to="/requests"
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            All Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {compatibleRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
            No active compatible requests right now. You will receive in-app alerts when emergencies arise!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compatibleRequests.slice(0, 6).map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <StatusBadge status={req.urgency} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{req.patientName}</h3>
                  <p className="text-xs text-slate-600 truncate">{req.hospitalName}</p>
                  <p className="text-[11px] text-slate-400">
                    Needs: <strong>{req.unitsNeeded} units</strong> ({req.unitsFulfilled || 0} received)
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Deadline: {new Date(req.requiredByDate).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Pledge Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History & Official Certificates */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          My Verified Donation History & Certificates
        </h2>
        <p className="text-xs text-slate-500">
          Official records and certificate verification codes for your voluntary donations.
        </p>

        {donations.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No completed donations recorded yet. When you donate at a hospital or blood bank, your record and certificate will appear here!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {donations.map((d) => (
              <div key={d._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{d.facilityName}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">
                      {d.certificateCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Donated {d.unitsDonated} unit(s) of <strong>{d.bloodGroup}</strong> on{' '}
                    {new Date(d.donationDate).toLocaleDateString()}
                  </p>
                  {d.notes && <p className="text-[11px] text-slate-400 italic">"{d.notes}"</p>}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
