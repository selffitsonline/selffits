"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { issueCertificateAction } from "@/actions/certificates.actions";
import { Award, Upload, Check, Trash2, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminCertificatesPage() {
  const [issuedMessage, setIssuedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [issuedCerts, setIssuedCerts] = useState([
    {
      id: "cert-1",
      student: "Demo Student (student@selffits.com)",
      title: "Yellow Belt Certification",
      number: "SELFFITS-YB-2026-0482",
      issuedDate: "Jun 28, 2026",
    },
  ]);

  const [formData, setFormData] = useState({
    studentId: "student@selffits.com",
    title: "Blue Belt Certification",
    certNumber: "SELFFITS-BB-2026-0911",
  });

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIssuedMessage(null);
    setErrorMessage(null);

    const res = await issueCertificateAction({
      userId: formData.studentId,
      title: formData.title,
      certificateNumber: formData.certNumber,
    });

    if (!res.success) {
      setErrorMessage(res.error || "Failed to issue certificate.");
      setIsSubmitting(false);
      return;
    }

    const newCert = {
      id: res.certificateId || `cert-${Date.now()}`,
      student: formData.studentId,
      title: formData.title,
      number: formData.certNumber,
      issuedDate: "Today",
    };

    setIssuedCerts([newCert, ...issuedCerts]);
    setIssuedMessage(res.message || `Issued "${formData.title}" successfully!`);
    setIsSubmitting(false);
    setTimeout(() => setIssuedMessage(null), 4000);
  };

  return (
    <AdminShell>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Certificate Upload & Issuance Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Grant official belt graduation & transformation certificates directly to student dashboards.
          </p>
        </div>

        {issuedMessage && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {issuedMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#EF4444] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMessage}
          </div>
        )}

        {/* Issue Certificate Form */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Award className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Issue New Certificate
            </h2>
          </div>

          <form onSubmit={handleIssue} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Select Student
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="student@selffits.com">Demo Student (student@selffits.com)</option>
                  <option value="arjun@example.com">Arjun Nair (arjun@example.com)</option>
                  <option value="sarah.j@example.com">Sarah Jenkins (sarah.j@example.com)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0080FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Certificate Registration Number
              </label>
              <input
                type="text"
                value={formData.certNumber}
                onChange={(e) => setFormData({ ...formData, certNumber: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#0080FF] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#0080FF]/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              {isSubmitting ? "Issuing..." : "Grant & Issue Certificate"}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-outfit)]">
            Issued Certificate History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0F1117] text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Certificate Title</th>
                  <th className="p-3">Cert ID</th>
                  <th className="p-3">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {issuedCerts.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-bold text-white">{c.student}</td>
                    <td className="p-3">{c.title}</td>
                    <td className="p-3 font-mono text-gray-400">{c.number}</td>
                    <td className="p-3">{c.issuedDate}</td>
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
