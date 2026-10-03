import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Award, CheckCircle, XCircle, Heart, Filter, UserCheck, Shield } from 'lucide-react';
import { donorService } from '../services/api';
import BloodGroupBadge from '../components/BloodGroupBadge';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const DonorSearch = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);

  const bloodGroups = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBloodGroup !== 'All') params.bloodGroup = selectedBloodGroup;
      if (cityFilter.trim() !== '') params.city = cityFilter.trim();
      if (availableOnly) params.availableOnly = true;

      const res = await donorService.searchDonors(params);
      if (res.data.success) {
        setDonors(res.data.donors);
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedBloodGroup, availableOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-rose-600" /> Verified Donor Network
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Find Available Blood Donors
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Search registered voluntary blood donors by blood group compatibility, city, and real-time donation availability.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Search by city (e.g. Muqdisho, Hargeysa, Garoowe, Kismaayo)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setCityFilter('');
                setSelectedBloodGroup('All');
                setAvailableOnly(false);
              }}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Blood Group Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter by Blood Group:
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              Available to Donate Only
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedBloodGroup === bg
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Donors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-100 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Donors Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No donors match your search criteria. Try removing city filters or toggling off "Available Only".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{donors.length}</strong> registered donors
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {donors.map((donor) => (
              <div
                key={donor._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          {donor.user?.name || 'Registered Donor'}
                        </h3>
                        {donor.user?.isVerified && (
                          <span title="Verified Donor">
                            <Shield className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {donor.city}, {donor.state || 'WA'}
                      </p>
                    </div>
                    <BloodGroupBadge group={donor.bloodGroup} size="lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Availability</span>
                      <span className="flex items-center gap-1 font-bold text-slate-800 mt-0.5">
                        {donor.isAvailableToDonate ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" /> Busy
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Donations</span>
                      <span className="flex items-center gap-1 font-bold text-rose-600 mt-0.5">
                        <Award className="w-3.5 h-3.5" /> {donor.totalDonations || 0} times
                      </span>
                    </div>
                  </div>

                  {donor.medicalConditions && donor.medicalConditions !== 'None' && (
                    <p className="text-[11px] text-slate-500 italic">
                      Note: {donor.medicalConditions}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Age: {donor.age} • {donor.gender}
                  </span>
                  <button
                    onClick={() => setSelectedDonor(donor)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Donor Modal */}
      {selectedDonor && (
        <Modal
          isOpen={!!selectedDonor}
          onClose={() => setSelectedDonor(null)}
          title="Donor Contact Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
              <BloodGroupBadge group={selectedDonor.bloodGroup} size="xl" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{selectedDonor.user?.name}</h4>
                <p className="text-xs text-slate-500">
                  {selectedDonor.city}, {selectedDonor.state} • {selectedDonor.totalDonations} Past Donations
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">Phone Number:</span>
                <a
                  href={`tel:${selectedDonor.contactPhone}`}
                  className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> {selectedDonor.contactPhone}
                </a>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">Email Address:</span>
                <a
                  href={`mailto:${selectedDonor.user?.email}`}
                  className="font-bold text-slate-800 hover:underline"
                >
                  {selectedDonor.user?.email}
                </a>
              </div>

              {selectedDonor.emergencyContact?.name && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-500">Alternate Contact:</span>
                  <span className="font-bold text-slate-800">
                    {selectedDonor.emergencyContact.name} ({selectedDonor.emergencyContact.relation}): {selectedDonor.emergencyContact.phone}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800">
              🔒 <strong>Donor Privacy & Safety:</strong> Contact this donor strictly for emergency blood donation inquiries. All calls are logged for platform safety.
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedDonor(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DonorSearch;
