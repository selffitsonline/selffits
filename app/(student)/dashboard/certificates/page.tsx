"use client";

import React, { useState, useEffect } from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Award, Download, Calendar, CheckCircle2, RefreshCw, FileText } from "lucide-react";
import { getStudentCertificatesAction } from "@/actions/certificates.actions";

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      setLoading(true);
      const res = await getStudentCertificatesAction();
      if (res.success && res.certificates) {
        setCertificates(res.certificates);
      }
      setLoading(false);
    }
    loadCertificates();
  }, []);

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-3">
            <Award className="w-8 h-8 text-[#F59E0B]" /> My Official Certificates
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            View and download your official SELFFITS Academy belt graduation and program certificates.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 space-y-3 bg-[#14161D] rounded-3xl border border-white/10">
            <RefreshCw className="w-8 h-8 text-[#0080FF] animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading your official certificates from database...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-[#14161D] border border-white/10 rounded-3xl p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-600 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-white font-[family-name:var(--font-outfit)]">
              No Certificates Issued Yet
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Certificates become available automatically in your dashboard after you pass your live examination and your coach issues your official belt graduation certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => {
              const formattedDate = new Date(cert.issuedDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={cert.id}
                  className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-[family-name:var(--font-outfit)]">
                          {cert.title}
                        </h3>
                        <p className="text-xs text-[#0080FF] font-semibold">{cert.program?.title || "Martial Arts Academy"}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-black border border-[#10B981]/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F1117] border border-white/5 space-y-1 text-xs text-gray-400">
                    {cert.beltName && (
                      <p className="text-emerald-400 font-bold">
                        Belt Rank: <span className="text-white">🥋 {cert.beltName}</span>
                      </p>
                    )}
                    <p>
                      Certificate ID: <span className="text-gray-200 font-mono font-bold">{cert.certificateNumber}</span>
                    </p>
                    <p className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#0080FF]" /> Issued on {formattedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`/api/certificates/download/${cert.id}?inline=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs text-center hover:bg-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                    >
                      View Certificate
                    </a>
                    <a
                      href={`/api/certificates/download/${cert.id}`}
                      download
                      className="flex-1 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white font-bold text-xs text-center hover:opacity-95 transition-opacity shadow-md shadow-[#0080FF]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
