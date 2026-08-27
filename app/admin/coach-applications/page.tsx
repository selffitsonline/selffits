"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { FileText, Download, CheckCircle2, XCircle, Mail, Phone, Calendar, Clock, AlertCircle } from "lucide-react";
import { getAdminCoachApplicationsAction, updateCoachApplicationStatusAction } from "@/actions/admin.actions";

export default function AdminCoachApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadApps() {
      const res = await getAdminCoachApplicationsAction();
      if (res && res.success && res.applications) {
        setApplications(res.applications);
      }
      setIsLoading(false);
    }
    loadApps();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setMsg(null);
    const res = await updateCoachApplicationStatusAction(id, newStatus);
    if (res.success) {
      setApplications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setMsg({ type: "success", text: res.message || `Application status set to ${newStatus}.` });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to update status." });
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading coach application registration leads...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Coach Applications & Registration Leads
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review submitted coach applications, download candidate resumes, and approve or reject coaching leads.
          </p>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "bg-[#E50914]/15 text-[#EF4444] border border-[#E50914]/30"
            }`}
          >
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-3 max-w-md mx-auto">
            <FileText className="w-10 h-10 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Coach Applications Received Yet</h3>
            <p className="text-xs text-gray-400">
              Applications submitted via the &quot;Become a Coach&quot; form will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      {app.fullName}
                    </h3>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        app.status === "APPROVED"
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : app.status === "REJECTED"
                          ? "bg-[#E50914]/20 text-[#EF4444] border border-[#E50914]/30"
                          : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0080FF]" /> {app.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#10B981]" /> Phone/WhatsApp: {app.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Applied: {app.appliedDate}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400">
                    <span className="font-bold text-gray-300">Disciplines & Rank:</span> {app.disciplines} • {app.highestRank} ({app.totalExperience} Exp)
                  </p>
                </div>

                {/* Actions: Download Resume & Approve/Reject */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0080FF]" /> Download Resume
                    </a>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-white/5 text-gray-500 text-xs font-medium">
                      No Resume Uploaded
                    </span>
                  )}

                  {app.status !== "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                      className="px-3.5 py-2 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/40 text-[#10B981] border border-[#10B981]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}

                  {app.status !== "REJECTED" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                      className="px-3.5 py-2 rounded-xl bg-[#E50914]/20 hover:bg-[#E50914]/40 text-[#EF4444] border border-[#E50914]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
