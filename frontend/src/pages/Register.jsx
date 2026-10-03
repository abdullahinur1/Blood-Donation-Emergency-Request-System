import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Droplet,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Donor',
    phone: '',
    city: '',
    state: '',
    organizationName: '',
    // Donor specific
    bloodGroup: 'O+',
    age: 25,
    gender: 'Male',
    weightKg: 65,
    isAvailableToDonate: true,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const roles = [
    { value: 'Donor', label: 'Blood Donor', desc: 'Donate blood and respond to emergency requests' },
    { value: 'Requester', label: 'Requester / Patient', desc: 'Request blood units for emergency needs' },
    { value: 'HospitalStaff', label: 'Hospital Staff', desc: 'Coordinate patient transfusions and approvals' },
    { value: 'BloodBankStaff', label: 'Blood Bank Staff', desc: 'Manage inventory and distribution' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (formData.role === 'Donor' && formData.weightKg < 45) {
      return setError('Donors must weigh at least 45 kg to be eligible');
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create Your Account</h1>
          <p className="text-xs text-slate-500">
            Join the LifePulse emergency response network
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select User Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roles.map((r) => (
                <div
                  key={r.value}
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formData.role === r.value
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{r.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Faarax Maxamed Cali"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Contact Phone *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+252 61 500 0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">City *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Muqdisho"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">State / Region</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Banaadir"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
              />
            </div>
          </div>

          {/* Hospital / Blood Bank Name if staff */}
          {(formData.role === 'HospitalStaff' || formData.role === 'BloodBankStaff') && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Facility / Organization Name *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="e.g. Isbitaalka Banaadir"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* Donor Profile specific fields */}
          {formData.role === 'Donor' && (
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-rose-600 fill-current" />
                Donor Health & Blood Profile
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:border-rose-500 outline-none"
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
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-rose-500 outline-none"
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
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  name="isAvailableToDonate"
                  checked={formData.isAvailableToDonate}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="available" className="text-xs text-slate-700 font-medium">
                  I am currently healthy and available for emergency donation alerts
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Complete Registration
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-rose-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
