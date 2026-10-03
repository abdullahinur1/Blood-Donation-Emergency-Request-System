import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  Phone,
  User,
  Clock,
  Heart,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { requestService, hospitalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    hospitalName: user?.organizationName || 'Harborview Medical Center',
    hospitalAddress: '325 9th Ave',
    city: user?.city || 'Seattle',
    state: user?.state || 'WA',
    urgency: 'Urgent',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    requiredByDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    notes: '',
  });

  const [hospitalsList, setHospitalsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const urgencies = [
    { value: 'Standard', label: 'Standard', desc: 'Planned surgery within 3-7 days', color: 'border-slate-200' },
    { value: 'Urgent', label: 'Urgent', desc: 'Needed within 24-48 hours', color: 'border-orange-300 bg-orange-50/40 text-orange-950' },
    { value: 'Critical', label: 'Critical Emergency', desc: 'Immediate trauma / life threat', color: 'border-rose-400 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500/20' },
  ];

  useEffect(() => {
    // Load hospital directory to suggest facilities
    const fetchHospitals = async () => {
      try {
        const res = await hospitalService.getHospitals();
        if (res.data.success) {
          setHospitalsList(res.data.hospitals);
        }
      } catch (err) {
        // Silently handle
      }
    };
    fetchHospitals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHospitalSelect = (e) => {
    const selectedName = e.target.value;
    const found = hospitalsList.find((h) => h.name === selectedName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        hospitalName: found.name,
        hospitalAddress: found.address,
        city: found.city,
        state: found.state,
      }));
    } else {
      setFormData((prev) => ({ ...prev, hospitalName: selectedName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await requestService.createRequest(formData);
      if (res.data.success) {
        setSuccess('Blood request created successfully! Matched donors have been notified.');
        setTimeout(() => {
          navigate(`/requests/${res.data.request._id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit blood request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate('/requests')}
        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </button>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Emergency Transfusion Protocol
          </div>
          <h1 className="text-3xl font-black text-slate-900">Submit Blood Request</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit an emergency blood request on behalf of a patient. Compatible registered donors and regional blood centers in the vicinity will be immediately alerted.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Group & Quantity */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. Blood Group Required *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {bloodGroups.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                  className={`p-3 rounded-2xl border text-sm font-black transition-all ${
                    formData.bloodGroup === bg
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 scale-105'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Urgency Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {urgencies.map((u) => (
                <div
                  key={u.value}
                  onClick={() => setFormData({ ...formData, urgency: u.value })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formData.urgency === u.value
                      ? `${u.color} ring-2 shadow-xs`
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-bold text-xs">{u.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Details & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Patient Identifier / Name *</label>
              <input
                type="text"
                required
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="e.g. John D. or Patient #TRAUMA-99"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
              />
              <span className="text-[10px] text-slate-400">
                You can use a clinical reference code to protect patient privacy.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Units Needed *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                name="unitsNeeded"
                value={formData.unitsNeeded}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
              />
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Hospital Facility & Destination
            </h3>

            {hospitalsList.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Verified Facility:</label>
                <select
                  onChange={handleHospitalSelect}
                  value={formData.hospitalName}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:border-rose-500 outline-none font-medium"
                >
                  {hospitalsList.map((h) => (
                    <option key={h._id} value={h.name}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                  <option value="Other">Other / Custom Facility</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hospital Name *</label>
                <input
                  type="text"
                  required
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. Harborview Medical Center"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hospital Address *</label>
                <input
                  type="text"
                  required
                  name="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  placeholder="e.g. 325 9th Ave, Trauma Center"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City *</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Seattle"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. WA"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Person & Deadline */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              4. Point of Contact & Deadline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Name *</label>
                <input
                  type="text"
                  required
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Contact Person"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Phone *</label>
                <input
                  type="text"
                  required
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Required By Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  name="requiredByDate"
                  value={formData.requiredByDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Clinical / Reason Notes</label>
              <textarea
                rows="3"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Include relevant details such as surgical schedule, trauma department room, specific transfusion requirements..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" /> Submit Emergency Blood Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
