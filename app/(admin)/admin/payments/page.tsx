"use client";

import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { CreditCard, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminPaymentsPage() {
  const transactions = [
    {
      id: "pay-1",
      orderId: "order_K8f92jX1a9",
      paymentId: "pay_K8f99zA100",
      student: "Demo Student (student@selffits.com)",
      plan: "Blue Belt (3 Months)",
      amount: "₹7,999",
      currency: "INR",
      status: "SUCCESS",
      date: "Aug 1, 2026, 14:32 IST",
    },
    {
      id: "pay-2",
      orderId: "order_L1f92jX1b2",
      paymentId: "pay_L1f99zB101",
      student: "David Miller (david@example.com)",
      plan: "24-Day Challenge",
      amount: "$49",
      currency: "USD",
      status: "SUCCESS",
      date: "Jul 28, 2026, 18:10 IST",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Orders & Payment Logs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Financial audit trail for Razorpay domestic (INR) and international (USD) transactions.
          </p>
        </div>

        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0F1117] text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Razorpay Order ID</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Membership Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5">
                    <td className="p-4 font-mono font-semibold text-white">{tx.orderId}</td>
                    <td className="p-4">{tx.student}</td>
                    <td className="p-4">{tx.plan}</td>
                    <td className="p-4 font-bold text-white">{tx.amount} ({tx.currency})</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] font-bold text-[10px] flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{tx.date}</td>
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
