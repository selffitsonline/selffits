"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDashboardSkeleton } from "@/components/admin/admin-skeletons";
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
} from "lucide-react";
import { getAdminDashboardStatsAction } from "@/actions/admin.actions";
import { fetchAdminDataWithCache } from "@/lib/admin-cache";

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetchAdminDataWithCache("admin_dashboard_stats", getAdminDashboardStatsAction);
        if (isMounted && res && res.success) {
          setStatsData(res.stats);
        }
      } catch (err) {
        console.error("Admin dashboard load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  const {
    totalStudents = 0,
    activeEnrollments = 0,
    totalRevenueINR = 0,
    pendingCoachApps = 0,
    recentPayments = [],
    recentEnrollments = [],
  } = statsData || {};

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Header Overview Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080FF]/15 text-[#0080FF] text-xs font-bold border border-[#0080FF]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Administrator Master Control Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Executive Dashboard Overview
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Real-time summary of student enrollments, coach applications, revenue, and active programs.
            </p>
          </div>
        </div>

        {/* 4 KEY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Students */}
          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</span>
              <div className="w-10 h-10 rounded-xl bg-[#0080FF]/15 text-[#0080FF] flex items-center justify-center border border-[#0080FF]/30">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">{totalStudents}</p>
            <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active Registered Accounts
            </p>
          </div>

          {/* Card 2: Active Enrollments */}
          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Enrollments</span>
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">{activeEnrollments}</p>
            <p className="text-[11px] text-gray-400 font-medium">Live Virtual Class Memberships</p>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center border border-[#F59E0B]/30">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
              ₹{totalRevenueINR.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-[#10B981] font-semibold">Verified Gateway Transactions</p>
          </div>

          {/* Card 4: Coach Applications */}
          <div className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Coach Leads</span>
              <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center border border-[#E50914]/30">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">{pendingCoachApps}</p>
            <Link
              href="/admin/coach-applications"
              className="text-[11px] text-[#0080FF] hover:underline font-bold flex items-center gap-1"
            >
              Review Applications <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2-COLUMN TABLE GRID: RECENT PAYMENTS & RECENT ENROLLMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments Table */}
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#10B981]" /> Recent Payment Transactions
              </h3>
              <Link href="/admin/payments" className="text-xs text-[#0080FF] hover:underline font-bold">
                View All Payments
              </Link>
            </div>

            {!isLoading && recentPayments.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No payment transactions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((pay: any) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-xl bg-[#0F1117] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{pay.userName}</p>
                      <p className="text-[11px] text-gray-400">{pay.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#10B981]">{pay.amount}</p>
                      <p className="text-[10px] text-gray-500">{pay.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Student Enrollments Table */}
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0080FF]" /> Recent Student Registrations
              </h3>
              <Link href="/admin/students" className="text-xs text-[#0080FF] hover:underline font-bold">
                View All Students
              </Link>
            </div>

            {!isLoading && recentEnrollments.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No student enrollments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enr: any) => (
                  <div
                    key={enr.id}
                    className="p-3 rounded-xl bg-[#0F1117] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{enr.userName}</p>
                      <p className="text-[11px] text-gray-400">{enr.planName}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#10B981]/20 text-[#10B981]">
                        {enr.status}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1">{enr.startDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
