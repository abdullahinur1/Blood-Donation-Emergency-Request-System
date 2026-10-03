import React, { useState, useEffect } from 'react';
import {
  User,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  Save,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, donorService } from '../services/api';
import BloodGroupBadge from '../components/BloodGroupBadge';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    organizationName: user?.organizationName || '',
    // Donor fields
    bloodGroup: 'O+',
    age: 25,
    gender: 'Male',
    weightKg: 65,
    medicalConditions: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user?.role === 'Donor') {
          const res = await donorService.getProfile();
          if (res.data.success && res.data.profile) {
            const p = res.data.profile;
            setProfile(p);
            setFormData((prev) => ({
              ...prev,
              bloodGroup: p.bloodGroup,
              age: p.age,
              gender: p.gender,
              weightKg: p.weightKg,
              medicalConditions: p.medicalConditions || '',
              emergencyName: p.emergencyContact?.name || '',
              emergencyPhone: p.emergencyContact?.phone || '',
              emergencyRelation: p.emergencyContact?.relation || '',
            }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      // 1. Update basic user info
      const userRes = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        organizationName: formData.organizationName,
      });

      if (userRes.data.success) {
        updateUser(userRes.data.user);
      }

      // 2. If Donor, update donor profile
      if (user?.role === 'Donor') {
        const donorRes = await donorService.updateProfile({
          bloodGroup: formData.bloodGroup,
          age: Number(formData.age),
          gender: formData.gender,
          weightKg: Number(formData.weightKg),
          city: formData.city,
          state: formData.state,
          contactPhone: formData.phone,
          medicalConditions: formData.medicalConditions,
          emergencyContact: {
            name: formData.emergencyName,
            phone: formData.emergencyPhone,
            relation: formData.emergencyRelation,
          },
        });
        if (donorRes.data.success) {
          setProfile(donorRes.data.profile);
        }
      }

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 font-black text-2xl flex items-center justify-center border border-rose-200">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
                {user?.isVerified && (
                  <span title="Verified Account">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">
                  {user?.role}
                </span>
                {user?.role === 'Donor' && profile && (
                  <BloodGroupBadge group={profile.bloodGroup} size="sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> {message}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone</label>
                <input
                  type="text"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State / Region</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 100 Main Street"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                />
              </div>

              {(user?.role === 'HospitalStaff' || user?.role === 'BloodBankStaff') && (
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Organization / Facility Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Donor Profile Section if user is Donor */}
          {user?.role === 'Donor' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 fill-current" />
                Donor Health & Blood Profile
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Weight (kg)</label>
                  <input
                    type="number"
                    min="45"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Medical Conditions / Notes</label>
                <input
                  type="text"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  placeholder="e.g. None or minor allergies"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    placeholder="Contact Name"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Emergency Contact Phone</label>
                  <input
                    type="text"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Relationship</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                    placeholder="e.g. Spouse / Sibling"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
