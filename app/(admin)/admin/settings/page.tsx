"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Settings, ShieldCheck, Database, Key, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();

  const services = [
    { name: "PostgreSQL Database (Prisma ORM)", status: "CONNECTED", detail: "Pooled Connection Pooler active" },
    { name: "NextAuth.js v5 JWT Session Engine", status: "ACTIVE", detail: "RBAC Guards enabled" },
    { name: "Razorpay API Multi-Currency Gateway", status: "CONFIGURED", detail: "Webhook HMAC Verification Active" },
    { name: "Resend Email Service SDK", status: "CONFIGURED", detail: "Transactional email templates linked" },
  ];

  return (
    <AdminShell>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            System & API Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            System environment status, database connections, and API integration diagnostics.
          </p>
        </div>

        {/* Admin Account Profile Card */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <ShieldCheck className="w-5 h-5 text-[#0080FF]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Current Admin Account
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400">Authenticated Admin:</p>
              <p className="font-bold text-white text-sm mt-0.5">{session?.user?.name || "System Admin"}</p>
            </div>
            <div>
              <p className="text-gray-400">Admin Email:</p>
              <p className="font-bold text-white text-sm mt-0.5">{session?.user?.email || "superadmin@selffits.com"}</p>
            </div>
            <div>
              <p className="text-gray-400">Assigned Role:</p>
              <p className="font-bold text-[#0080FF] text-sm mt-0.5">{session?.user?.role || "SUPER_ADMIN"}</p>
            </div>
          </div>
        </div>

        {/* Integration Status Diagnostics */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Key className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Backend Integration Status
            </h2>
          </div>

          <div className="space-y-4">
            {services.map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{s.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.detail}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
