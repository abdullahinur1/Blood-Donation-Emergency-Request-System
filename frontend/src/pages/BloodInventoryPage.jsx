import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Building,
  CheckCircle,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { inventoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import Modal from '../components/Modal';

const BloodInventoryPage = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnits, setTotalUnits] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Stock Adjustment Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [deltaUnits, setDeltaUnits] = useState(1);
  const [actionType, setActionType] = useState('add'); // 'add' or 'deduct'
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const isStaffOrAdmin = user?.role === 'BloodBankStaff' || user?.role === 'Admin';

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getInventory();
      if (res.data.success) {
        setInventory(res.data.inventory);
        setTotalUnits(res.data.totalUnits);
        setLowStockCount(res.data.lowStockCount);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdjustModal = (item, type = 'add') => {
    setSelectedItem(item);
    setActionType(type);
    setDeltaUnits(1);
    setAdjustReason(type === 'add' ? 'Donation drive intake' : 'Hospital emergency delivery');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const units = actionType === 'add' ? Number(deltaUnits) : -Number(deltaUnits);
      await inventoryService.adjustStock({
        bloodGroup: selectedItem.bloodGroup,
        deltaUnits: units,
        bloodBankName: selectedItem.bloodBankName,
        reason: adjustReason,
      });
      setAdjustModalOpen(false);
      setActionSuccess(`Successfully ${actionType === 'add' ? 'added' : 'deducted'} ${deltaUnits} unit(s) of ${selectedItem.bloodGroup}.`);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5" /> Regional Blood Reserve
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Blood Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time stock levels across all blood groups with automated low-stock warnings.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reserves
        </button>
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

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Units Available</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalUnits} Units</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all registered blood banks</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Low Stock</p>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{lowStockCount} Groups</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Stock below safety threshold (&lt;5 units)</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Central Cold Vault</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Northwest Regional</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active Cold Chain Certified</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Inventory by Blood Group</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {inventory.map((item) => {
            const isLow = item.unitsAvailable <= item.lowStockThreshold;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                  isLow
                    ? 'border-amber-300 ring-2 ring-amber-500/10 bg-amber-50/20'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <BloodGroupBadge group={item.bloodGroup} size="xl" className="shadow-xs" />
                    {isLow ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-lg">
                        Adequate
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Available</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-slate-900">
                        {item.unitsAvailable}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">units</span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Threshold: {item.lowStockThreshold} units</span>
                      <span className="font-semibold">{item.unitsAvailable} / 25 cap</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (item.unitsAvailable / 25) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                    <p>Component: <strong>{item.componentType}</strong></p>
                    <p className="truncate">Storage: <strong>{item.location?.storageUnit || 'Cold Vault 1'}</strong></p>
                  </div>
                </div>

                {/* Adjust Stock buttons if staff */}
                {isStaffOrAdmin && (
                  <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openAdjustModal(item, 'add')}
                      className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Restock
                    </button>
                    <button
                      onClick={() => openAdjustModal(item, 'deduct')}
                      className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <Minus className="w-3 h-3" /> Dispatch
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal
          isOpen={adjustModalOpen}
          onClose={() => setAdjustModalOpen(false)}
          title={`${actionType === 'add' ? 'Restock' : 'Dispatch'} ${selectedItem.bloodGroup} Inventory`}
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">Blood Group: {selectedItem.bloodGroup}</p>
                <p className="text-slate-500">Currently in stock: {selectedItem.unitsAvailable} Units</p>
              </div>
              <BloodGroupBadge group={selectedItem.bloodGroup} size="lg" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Number of Units to {actionType === 'add' ? 'Add' : 'Deduct'} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={deltaUnits}
                onChange={(e) => setDeltaUnits(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Reason / Notes *</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Donor blood drive donation intake"
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="px-4 py-2 border rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 text-white font-bold rounded-xl ${
                  actionType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionType === 'add' ? 'Restock' : 'Dispatch'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BloodInventoryPage;
