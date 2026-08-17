"use client";

import React from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Award, Download, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function StudentCertificatesPage() {
  const certificates = [
    {
      id: "cert-yellow-belt",
      name: "Yellow Belt Certification",
      program: "Kids & Adults Martial Arts",
      issuedDate: "June 28, 2026",
      certificateNumber: "SELFFITS-YB-2026-0482",
      status: "VERIFIED",
      fileUrl: "/api/certificates/download/cert-yellow-belt",
    },
  ];

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            My Certificates
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            View and download your official SELFFITS belt graduation and challenge completion certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-gray-400">{cert.program}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-extrabold border border-[#10B981]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1117] border border-white/5 space-y-1 text-xs text-gray-400">
                <p>Certificate ID: <span className="text-gray-200 font-mono">{cert.certificateNumber}</span></p>
                <p className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0080FF]" /> Issued on {cert.issuedDate}
                </p>
              </div>

              <a
                href={cert.fileUrl}
                download
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-xs text-center hover:opacity-95 transition-opacity shadow-md shadow-[#E50914]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Certificate PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
