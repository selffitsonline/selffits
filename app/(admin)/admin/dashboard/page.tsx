"use client";

import React from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Users,
  CreditCard,
  Video,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function AdminDashboardPage() {
  const kpis = {
    totalStudents: 1420,
    activeSubscriptions: 1280,
    revenueINR: "₹4,85,000",
    revenueUSD: "$3,200",
    activeBatches: 6,
    linksPostedToday: "5 / 6 Batches Set",
  };

  const recentStudents = [
    {
      id: "std-1",
      name: "Demo Student",
      email: "student@selffits.com",
      program: "Adults Martial Arts",
      belt: "Blue Belt",
      remainingClasses: 18,
      status: "ACTIVE",
      joinedDate: "Aug 1, 2026",
    },
    {
      id: "std-2",
      name: "Arjun Nair",
      email: "arjun@example.com",
      program: "Kids Martial Arts",
      belt: "Yellow Belt",
      remainingClasses: 6,
      status: "ACTIVE",
      joinedDate: "Jul 28, 2026",
    },
    {
      id: "std-3",
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      program: "Ladies Only HIIT",
      belt: "Transformation",
      remainingClasses: 20,
      status: "ACTIVE",
      joinedDate: "Jul 25, 2026",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Academy Admin Overview
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time analytics, student roster controls, and daily live link status.
          </p>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Active Students</span>
              <Users className="w-4 h-4 text-[#0080FF]" />
            </div>
            <h3 className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
              {kpis.totalStudents}
            </h3>
            <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12% this month
            </p>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Monthly Revenue</span>
              <CreditCard className="w-4 h-4 text-[#10B981]" />
            </div>
            <h3 className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
              {kpis.revenueINR} / {kpis.revenueUSD}
            </h3>
            <p className="text-[11px] text-gray-400">Razorpay Processed</p>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Active Batches</span>
              <Video className="w-4 h-4 text-[#E50914]" />
            </div>
            <h3 className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
              {kpis.activeBatches} Batches
            </h3>
            <p className="text-[11px] text-gray-400">Kids, Adults, Ladies Only</p>
          </div>

          <div className="bg-[#14161D] border border-[#E50914]/40 p-6 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Today&apos;s Live Links</span>
              <AlertCircle className="w-4 h-4 text-[#E50914]" />
            </div>
            <h3 className="text-xl font-black text-[#10B981] font-[family-name:var(--font-outfit)]">
              {kpis.linksPostedToday}
            </h3>
            <Link
              href="/admin/live-links"
              className="text-[11px] text-[#E50914] font-bold hover:underline inline-block"
            >
              Update Links →
            </Link>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="bg-gradient-to-r from-[#14161D] via-[#1A1D27] to-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Daily Operational Task</h3>
            <p className="text-xs text-gray-400">
              Update Google Meet / Zoom meeting links for active batches today.
            </p>
          </div>
          <Link
            href="/admin/live-links"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E50914] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Broadcast Today&apos;s Meeting Links
          </Link>
        </div>

        {/* Student Roster Preview Data Table */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                Recent Student Enrollments
              </h3>
              <p className="text-xs text-gray-400">Latest active student roster</p>
            </div>
            <Link
              href="/admin/students"
              className="text-xs font-bold text-[#0080FF] hover:underline"
            >
              View All Students →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0F1117] text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Belt Level</th>
                  <th className="p-3">Classes Left</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{std.name}</td>
                    <td className="p-3 text-gray-400">{std.email}</td>
                    <td className="p-3">{std.program}</td>
                    <td className="p-3 font-semibold text-[#0080FF]">{std.belt}</td>
                    <td className="p-3 font-bold text-white">{std.remainingClasses} Left</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] font-bold text-[10px]">
                        {std.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
