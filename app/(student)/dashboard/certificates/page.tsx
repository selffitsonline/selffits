"use client";

import React, { useState, useEffect } from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Award, Download, Calendar, CheckCircle2, RefreshCw, FileText } from "lucide-react";
import { getStudentCertificatesAction } from "@/actions/certificates.actions";

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState<any | null>(null);

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

              const fileUrl = `/api/certificates/download/${cert.id}`;

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
                    <button
                      type="button"
                      onClick={() => setPreviewCert({ ...cert, fileUrl })}
                      className="flex-1 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0080FF]/20"
                    >
                      View Certificate
                    </button>
                    <a
                      href={fileUrl}
                      download
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: View Certificate Preview Pop-up */}
        {previewCert && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#14161D] border border-white/10 w-full max-w-4xl rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[95vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/40 flex items-center justify-center text-[#0080FF]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    {previewCert.beltName && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 uppercase">
                        🥋 {previewCert.beltName}
                      </span>
                    )}
                    <h3 className="text-lg font-black text-white font-[family-name:var(--font-outfit)] mt-0.5">
                      {previewCert.title}
                    </h3>
                    <p className="text-[11px] font-mono text-gray-400">ID: {previewCert.certificateNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 w-full bg-[#0F1117] border border-white/10 rounded-2xl overflow-hidden min-h-[500px] max-h-[75vh] flex items-center justify-center relative p-2">
                {previewCert.fileKey?.startsWith("data:image/") ||
                [".png", ".jpg", ".jpeg", ".webp"].some((ext) => previewCert.fileKey?.toLowerCase().includes(ext)) ? (
                  <img
                    src={`${previewCert.fileUrl}?inline=true`}
                    alt={previewCert.title}
                    className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  <iframe
                    src={`${previewCert.fileUrl}?inline=true`}
                    className="w-full h-full min-h-[500px] border-0 rounded-2xl bg-white"
                    title={previewCert.title}
                  />
                )}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewCert(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-[#0080FF]/20"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
