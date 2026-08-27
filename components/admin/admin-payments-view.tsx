"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Search } from "lucide-react";

interface AdminPaymentsViewProps {
  initialPayments: any[];
}

export function AdminPaymentsView({ initialPayments }: AdminPaymentsViewProps) {
  const [payments] = useState<any[]>(initialPayments || []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments.filter(
    (p) =>
      p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.razorpayOrderId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Payment & Transaction Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Real-time payment logs, order references, Razorpay signatures, and verified transaction receipts.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by student or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#14161D] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1117] text-gray-400 font-extrabold uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course / Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Order Ref / Gateway ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{pay.studentName}</p>
                        <p className="text-gray-400 text-[11px]">{pay.studentEmail}</p>
                      </td>
                      <td className="p-4 font-semibold text-[#0080FF]">{pay.courseName}</td>
                      <td className="p-4 font-black text-white text-sm">{pay.amount}</td>
                      <td className="p-4 font-mono text-[11px] text-gray-300">
                        <p className="text-white font-bold">{pay.paymentId}</p>
                        <p className="text-gray-500 text-[10px]">Order: {pay.razorpayOrderId}</p>
                      </td>
                      <td className="p-4 text-gray-300">{pay.date}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            pay.status === "SUCCESS"
                              ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                              : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
