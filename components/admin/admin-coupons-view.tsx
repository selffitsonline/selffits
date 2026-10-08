"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Tag,
  Search,
  Plus,
  Percent,
  DollarSign,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  X,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import {
  createAdminCouponAction,
  updateAdminCouponAction,
  toggleAdminCouponActiveAction,
  deleteAdminCouponAction,
  getAdminCouponUsagesAction,
} from "@/actions/coupons.actions";

interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  isActive: boolean;
  startDate?: string | null;
  expiryDate?: string | null;
  maxUsageTotal?: number | null;
  maxUsagePerUser?: number | null;
  usageCount: number;
  usagesRecorded: number;
  createdAt: string;
  updatedAt: string;
}

interface UsageItem {
  id: string;
  orderId?: string | null;
  userEmail: string;
  userName: string;
  discountApplied: number;
  paidAmount?: number | null;
  currency: string;
  paymentStatus: string;
  usedAt: string;
}

interface AdminCouponsViewProps {
  initialCoupons: CouponItem[];
}

export function AdminCouponsView({ initialCoupons }: AdminCouponsViewProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: "",
    isActive: true,
    startDate: "",
    expiryDate: "",
    maxUsageTotal: "",
    maxUsagePerUser: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usages Modal State
  const [isUsagesModalOpen, setIsUsagesModalOpen] = useState(false);
  const [selectedCouponForUsages, setSelectedCouponForUsages] = useState<CouponItem | null>(null);
  const [usagesList, setUsagesList] = useState<UsageItem[]>([]);
  const [isLoadingUsages, setIsLoadingUsages] = useState(false);

  // Delete State
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      isActive: true,
      startDate: "",
      expiryDate: "",
      maxUsageTotal: "",
      maxUsagePerUser: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      isActive: coupon.isActive,
      startDate: coupon.startDate ? coupon.startDate.slice(0, 16) : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 16) : "",
      maxUsageTotal: coupon.maxUsageTotal ? String(coupon.maxUsageTotal) : "",
      maxUsagePerUser: coupon.maxUsagePerUser ? String(coupon.maxUsagePerUser) : "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError("Discount value must be a positive number greater than 0.");
      return;
    }

    if (formData.discountType === "PERCENTAGE" && val > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCoupon) {
        // Update existing coupon
        const res = await updateAdminCouponAction(editingCoupon.id, {
          description: formData.description || undefined,
          discountType: formData.discountType,
          discountValue: val,
          isActive: formData.isActive,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
          maxUsageTotal: formData.maxUsageTotal ? parseInt(formData.maxUsageTotal, 10) : null,
          maxUsagePerUser: formData.maxUsagePerUser ? parseInt(formData.maxUsagePerUser, 10) : null,
        });

        if (res.success && res.coupon) {
          const updatedCoupon: CouponItem = {
            ...res.coupon,
            usagesRecorded: editingCoupon.usagesRecorded,
          };
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? updatedCoupon : c))
          );
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update coupon.");
        }
      } else {
        // Create new coupon
        const res = await createAdminCouponAction({
          code: formData.code.trim().toUpperCase(),
          description: formData.description || undefined,
          discountType: formData.discountType,
          discountValue: val,
          isActive: formData.isActive,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
          maxUsageTotal: formData.maxUsageTotal ? parseInt(formData.maxUsageTotal, 10) : null,
          maxUsagePerUser: formData.maxUsagePerUser ? parseInt(formData.maxUsagePerUser, 10) : null,
        });

        if (res.success && res.coupon) {
          const newCoupon: CouponItem = {
            ...res.coupon,
            usageCount: 0,
            usagesRecorded: 0,
          };
          setCoupons((prev) => [newCoupon, ...prev]);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to create coupon.");
        }
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    try {
      const res = await toggleAdminCouponActiveAction(coupon.id);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: res.isActive! } : c))
        );
      }
    } catch (err) {
      console.error("Error toggling coupon status:", err);
    }
  };

  const handleDelete = async (coupon: CouponItem) => {
    if (coupon.usageCount > 0 || coupon.usagesRecorded > 0) {
      setDeleteError(
        `Cannot delete coupon '${coupon.code}' because it has been used in ${coupon.usageCount} transaction(s). Please deactivate the coupon instead to preserve financial audit history.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete unused coupon '${coupon.code}'?`)) {
      return;
    }

    setDeleteError(null);
    try {
      const res = await deleteAdminCouponAction(coupon.id);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      } else {
        setDeleteError(res.error || "Failed to delete coupon.");
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete coupon.");
    }
  };

  const handleViewUsages = async (coupon: CouponItem) => {
    setSelectedCouponForUsages(coupon);
    setIsUsagesModalOpen(true);
    setIsLoadingUsages(true);
    setUsagesList([]);

    try {
      const res = await getAdminCouponUsagesAction(coupon.id);
      if (res.success) {
        setUsagesList(res.usages || []);
      }
    } catch (err) {
      console.error("Error fetching coupon usages:", err);
    } finally {
      setIsLoadingUsages(false);
    }
  };

  // Filtered Coupons
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.isActive) ||
      (statusFilter === "INACTIVE" && !c.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalUsages = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0080FF]/15 border border-[#0080FF]/30 text-[#0080FF] text-xs font-bold mb-2">
              <Tag className="w-3.5 h-3.5" /> Promotion & Discount System
            </div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Coupon & Promo Code Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Create discount codes, configure usage limits, monitor redemptions, and toggle active promotions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white text-xs font-extrabold flex items-center gap-2 hover:opacity-95 shadow-lg shadow-[#0080FF]/25 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Coupon
          </button>
        </div>

        {/* Global Error Banner */}
        {deleteError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="text-amber-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Coupons
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                {totalCoupons}
              </span>
              <span className="text-xs text-gray-400">Configured</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Promotions
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#10B981] font-[family-name:var(--font-outfit)]">
                {activeCoupons}
              </span>
              <span className="text-xs text-gray-400">Live for checkout</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Redemptions
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#0080FF] font-[family-name:var(--font-outfit)]">
                {totalUsages}
              </span>
              <span className="text-xs text-gray-400">Verified purchases</span>
            </div>
          </div>
        </div>

        {/* Controls Bar: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by coupon code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#14161D] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === filter
                    ? "bg-[#0080FF] text-white"
                    : "bg-[#14161D] text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                {filter === "ALL" ? "All" : filter === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1117] text-gray-400 font-extrabold uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Validity</th>
                  <th className="p-4">Usage / Limits</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      {searchQuery ? "No coupons matching your search." : "No coupons created yet."}
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => {
                    const isPercentage = coupon.discountType === "PERCENTAGE";
                    const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                    const isExhausted = typeof coupon.maxUsageTotal === "number" && coupon.usageCount >= coupon.maxUsageTotal;

                    return (
                      <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                        {/* Code & Description */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white tracking-wider px-2 py-0.5 rounded-md bg-[#0F1117] border border-white/15">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(coupon.code)}
                              title="Copy coupon code"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-gray-400 text-[11px] mt-1 max-w-xs line-clamp-1">
                              {coupon.description}
                            </p>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="p-4">
                          <span className="font-extrabold text-sm text-[#10B981] flex items-center gap-1">
                            {isPercentage ? (
                              <>
                                <Percent className="w-3.5 h-3.5" /> {coupon.discountValue}% OFF
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-3.5 h-3.5" /> ${coupon.discountValue.toFixed(2)} OFF
                              </>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-medium">
                            {isPercentage ? "Percentage Discount" : "Fixed Amount Discount"}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="p-4">
                          {coupon.expiryDate ? (
                            <div className="space-y-0.5">
                              <p className={`text-[11px] font-semibold ${isExpired ? "text-red-400" : "text-gray-200"}`}>
                                Expires: {new Date(coupon.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                              {coupon.startDate && (
                                <p className="text-[10px] text-gray-500">
                                  From: {new Date(coupon.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              No expiration (Always valid)
                            </span>
                          )}
                        </td>

                        {/* Usage & Limits */}
                        <td className="p-4">
                          <p className="font-extrabold text-white text-xs">
                            {coupon.usageCount} {coupon.maxUsageTotal ? `/ ${coupon.maxUsageTotal}` : "used"}
                            {isExhausted && (
                              <span className="ml-1 text-[10px] text-red-400 font-bold">(Limit reached)</span>
                            )}
                          </p>
                          {coupon.maxUsagePerUser && (
                            <p className="text-[10px] text-gray-400">
                              Max {coupon.maxUsagePerUser} per student
                            </p>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(coupon)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                              coupon.isActive
                                ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/30"
                                : "bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30"
                            }`}
                          >
                            {coupon.isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewUsages(coupon)}
                              title="View Redemptions"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(coupon)}
                              title="Edit Coupon"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#0080FF] hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(coupon)}
                              title="Delete Coupon"
                              className="p-1.5 rounded-lg bg-[#E50914]/15 hover:bg-[#E50914]/30 text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE / EDIT COUPON MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#0080FF]" />
                  <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Coupon Code */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Coupon Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCoupon}
                    placeholder="e.g. SUMMER25"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/15 text-white placeholder-gray-500 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#0080FF] disabled:opacity-50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Normalized uppercase code. Cannot be changed once created.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special 25% discount for new students"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
                  />
                </div>

                {/* Discount Type & Value Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Discount Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT",
                        })
                      }
                      className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/15 text-white text-xs focus:outline-none focus:border-[#0080FF]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Discount Value <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
                        required
                        placeholder={formData.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 15.00"}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full h-10 pl-8 pr-3.5 rounded-xl bg-[#0F1117] border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
                      />
                      <span className="absolute left-3 top-3 text-gray-400 text-xs font-bold">
                        {formData.discountType === "PERCENTAGE" ? "%" : "$"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates: Start & Expiry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Start Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/15 text-white text-xs focus:outline-none focus:border-[#0080FF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/15 text-white text-xs focus:outline-none focus:border-[#0080FF]"
                    />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Max Total Usage (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={formData.maxUsageTotal}
                      onChange={(e) => setFormData({ ...formData, maxUsageTotal: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Max Usage Per Student (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1"
                      value={formData.maxUsagePerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsagePerUser: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
                    />
                  </div>
                </div>

                {/* Active Status Switch */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is-active-toggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0080FF] focus:ring-0 focus:ring-offset-0 bg-[#0F1117] border-white/20 cursor-pointer"
                  />
                  <label htmlFor="is-active-toggle" className="text-xs font-bold text-white cursor-pointer">
                    Coupon is active and redeemable immediately
                  </label>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : editingCoupon ? (
                      "Update Coupon"
                    ) : (
                      "Create Coupon"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* USAGES AUDIT MODAL */}
        {isUsagesModalOpen && selectedCouponForUsages && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#0080FF]" /> Redemptions for {selectedCouponForUsages.code}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Total recorded redemptions: {selectedCouponForUsages.usageCount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUsagesModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto">
                {isLoadingUsages ? (
                  <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0080FF]" />
                    <span>Loading redemptions...</span>
                  </div>
                ) : usagesList.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-xs">
                    No completed purchases have used this coupon yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usagesList.map((usage) => (
                      <div
                        key={usage.id}
                        className="p-3.5 rounded-xl bg-[#0F1117] border border-white/5 flex items-center justify-between text-xs gap-3"
                      >
                        <div>
                          <p className="font-bold text-white">{usage.userName}</p>
                          <p className="text-gray-400 text-[11px]">{usage.userEmail}</p>
                          <p className="text-gray-500 font-mono text-[10px] mt-0.5">
                            Order: {usage.orderId || "N/A"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-[#10B981]">
                            Discount: -${usage.discountApplied.toFixed(2)}
                          </p>
                          {typeof usage.paidAmount === "number" && (
                            <p className="text-gray-400 text-[11px]">
                              Paid: ${usage.paidAmount.toFixed(2)}
                            </p>
                          )}
                          <p className="text-gray-500 text-[10px] mt-0.5">
                            {new Date(usage.usedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 shrink-0 text-right">
                <button
                  type="button"
                  onClick={() => setIsUsagesModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
