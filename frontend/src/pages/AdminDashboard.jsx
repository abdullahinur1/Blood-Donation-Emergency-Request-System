import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  Shield,
  Activity,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Package,
  Heart,
  Droplet,
} from 'lucide-react';
import { userService, hospitalService, statsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'hospitals', 'activity'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [actionSuccess, setActionSuccess] = useState('');

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('Requester');
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);

  // New Hospital Modal
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    type: 'Hospital',
    registrationNumber: '',
    address: '',
    city: '',
    state: 'WA',
    contactPhone: '',
    contactEmail: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, hospitalsRes] = await Promise.all([
        statsService.getOverview(),
        userService.getUsers(),
        hospitalService.getHospitals(),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setActivities(statsRes.data.recentActivity || []);
      }
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (hospitalsRes.data.success) setHospitals(hospitalsRes.data.hospitals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await userService.toggleUserStatus(userId);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.user.isActive } : u))
        );
        setActionSuccess(`User status updated to ${res.data.user.isActive ? 'Active' : 'Deactivated'}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleOpenEditRole = (u) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setEditRoleModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateUserRole(selectedUser._id, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, role: newRole } : u))
        );
        setEditRoleModalOpen(false);
        setActionSuccess(`Role updated to ${newRole} for ${selectedUser.name}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setActionSuccess(`User ${name} removed.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.createHospital(newHospital);
      if (res.data.success) {
        setHospitals((prev) => [...prev, res.data.hospital]);
        setHospitalModalOpen(false);
        setNewHospital({
          name: '',
          type: 'Hospital',
          registrationNumber: '',
          address: '',
          city: '',
          state: 'WA',
          contactPhone: '',
          contactEmail: '',
        });
        setActionSuccess('Medical facility registered successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register facility');
    }
  };

  const handleDeleteHospital = async (id, name) => {
    if (!window.confirm(`Delete facility "${name}"?`)) return;
    try {
      await hospitalService.deleteHospital(id);
      setHospitals((prev) => prev.filter((h) => h._id !== id));
      setActionSuccess(`Facility ${name} removed.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete facility');
    }
  };

  const roles = ['Donor', 'Requester', 'HospitalStaff', 'BloodBankStaff', 'Admin'];

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const term = searchUser.toLowerCase();
    const matchesSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.city.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-purple-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  System Administrator
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                Centralized Governance, User Roles, Facility Directory & Activity Logs
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Platform Data
          </button>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="purple"
          subtitle={`${users.filter((u) => u.isActive).length} active accounts`}
        />
        <StatCard
          title="Registered Donors"
          value={stats?.totalDonors || 0}
          icon={Heart}
          color="rose"
          subtitle={`${stats?.availableDonors || 0} available`}
        />
        <StatCard
          title="Emergency Requests"
          value={stats?.totalRequests || 0}
          icon={Activity}
          color="amber"
          subtitle={`${stats?.fulfilledRequests || 0} fulfilled`}
        />
        <StatCard
          title="Blood Units in Reserve"
          value={stats?.totalUnitsInStock || 0}
          icon={Package}
          color="indigo"
          subtitle={`${stats?.lowStockCount || 0} low stock alerts`}
        />
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> User & Role Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 px-2 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'hospitals'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Hospitals & Blood Banks ({hospitals.length})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-2 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'activity'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> System Audit Trail ({activities.length})
        </button>
      </div>

      {/* Tab 1: User & Role Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">User Accounts & Roles</h2>
              <p className="text-xs text-slate-500">Manage user roles, verify staff, and toggle account access.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
              >
                <option value="All">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization / Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'HospitalStaff'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'BloodBankStaff'
                            ? 'bg-indigo-100 text-indigo-800'
                            : u.role === 'Donor'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{u.organizationName || 'Individual'}</p>
                      <p className="text-[11px] text-slate-400">{u.city || 'N/A'}, {u.state || ''}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditRole(u)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                        title="Change Role"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleUserStatus(u._id)}
                        className={`p-1.5 hover:bg-slate-100 rounded-lg ${
                          u.isActive ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                        title={u.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>

                      {u.email !== user?.email && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Hospitals & Blood Banks */}
      {activeTab === 'hospitals' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registered Medical Facilities</h2>
              <p className="text-xs text-slate-500">Certified hospitals, blood banks, and trauma centers.</p>
            </div>

            <button
              onClick={() => setHospitalModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Facility
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitals.map((h) => (
              <div key={h._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white border rounded text-slate-600">
                      {h.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{h.registrationNumber}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{h.name}</h3>
                  <p className="text-xs text-slate-500">{h.address}, {h.city}, {h.state}</p>
                  <p className="text-xs text-slate-700 pt-1">
                    Phone: <strong>{h.contactPhone}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                  <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Center
                  </span>
                  <button
                    onClick={() => handleDeleteHospital(h._id, h.name)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Trail */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900">System Activity & Audit Trail</h2>
          <p className="text-xs text-slate-500">Live immutable logs of platform events and transactions.</p>

          <div className="divide-y divide-slate-100 text-xs">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit logs recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-800">
                        {act.action}
                      </span>
                      <span className="font-bold text-slate-800">{act.userName} ({act.userRole})</span>
                    </div>
                    <p className="text-slate-600">{act.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Change Role */}
      {selectedUser && (
        <Modal
          isOpen={editRoleModalOpen}
          onClose={() => setEditRoleModalOpen(false)}
          title={`Update Role for ${selectedUser.name}`}
        >
          <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Select the new access role for <strong>{selectedUser.email}</strong>.
            </p>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Account Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditRoleModalOpen(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
              >
                Save Role
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: New Hospital */}
      <Modal
        isOpen={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
        title="Add Hospital / Blood Bank Facility"
      >
        <form onSubmit={handleCreateHospital} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Facility Name *</label>
            <input
              type="text"
              required
              value={newHospital.name}
              onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
              placeholder="e.g. Seattle Grace Hospital"
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Facility Type</label>
              <select
                value={newHospital.type}
                onChange={(e) => setNewHospital({ ...newHospital, type: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Hospital">Hospital</option>
                <option value="BloodBank">Blood Bank</option>
                <option value="TraumaCenter">Trauma Center</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Reg. Number</label>
              <input
                type="text"
                value={newHospital.registrationNumber}
                onChange={(e) => setNewHospital({ ...newHospital, registrationNumber: e.target.value })}
                placeholder="e.g. HOSP-WA-1234"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Address *</label>
            <input
              type="text"
              required
              value={newHospital.address}
              onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
              placeholder="e.g. 500 Medical Center Way"
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">City *</label>
              <input
                type="text"
                required
                value={newHospital.city}
                onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                placeholder="e.g. Seattle"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact Phone *</label>
              <input
                type="text"
                required
                value={newHospital.contactPhone}
                onChange={(e) => setNewHospital({ ...newHospital, contactPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHospitalModalOpen(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700"
            >
              Register Facility
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
