"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { Image as ImageIcon, Save, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { getAdminBannerContentAction, updateAdminBannerContentAction } from "@/actions/admin.actions";

export default function AdminBannerManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [banner, setBanner] = useState({
    title: "Master Authentic Martial Arts & Virtual Fitness",
    subtitle: "Join India's premier online martial arts academy. Live interactive training with certified master instructors from the comfort of your home.",
    ctaText: "Enroll & Start Training",
    ctaLink: "/programs",
    imageUrl: "/images/hero_banner.jpg",
    isEnabled: true,
  });

  useEffect(() => {
    async function loadBanner() {
      const res = await getAdminBannerContentAction();
      if (res && res.success && res.banner) {
        setBanner(res.banner);
      }
      setIsLoading(false);
    }
    loadBanner();
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    const res = await updateAdminBannerContentAction(banner);
    if (res.success) {
      setMsg({ type: "success", text: res.message || "Homepage Hero Banner updated successfully!" });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to update banner." });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading banner configuration...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Homepage Hero Banner & Content Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dynamically manage the public homepage banner title, subtitle description, CTA button routes, and image assets.
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

        <form onSubmit={handleSaveBanner} className="space-y-6">
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0080FF]" /> Hero Banner Content
              </span>

              <button
                type="button"
                onClick={() => setBanner((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  banner.isEnabled
                    ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                    : "bg-white/10 text-gray-400 border border-white/10"
                }`}
              >
                {banner.isEnabled ? "Banner Status: Active" : "Banner Status: Disabled"}
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Banner Headline Title
              </label>
              <input
                type="text"
                value={banner.title}
                onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            {/* Subtitle / Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={3}
                value={banner.subtitle}
                onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            {/* CTA Button Text & CTA Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={banner.ctaText}
                  onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  CTA Target Link / Route
                </label>
                <input
                  type="text"
                  value={banner.ctaLink}
                  onChange={(e) => setBanner({ ...banner, ctaLink: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#0080FF]"
                />
              </div>
            </div>

            {/* Banner Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Banner Image Asset Path
              </label>
              <input
                type="text"
                value={banner.imageUrl}
                onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#0080FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving Banner Content..." : "Publish Banner Updates"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
