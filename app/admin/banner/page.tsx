"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { Image as ImageIcon, Save, CheckCircle2, AlertCircle, ArrowRight, Tag } from "lucide-react";
import { getAdminBannerContentAction, updateAdminBannerContentAction } from "@/actions/admin.actions";

export default function AdminBannerManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [banner, setBanner] = useState({
    badgeText: "ONLINE FITNESS & MARTIAL ARTS ACADEMY",
    titleMain: "Train Anywhere.",
    titleHighlight: "Transform Yourself!",
    subtitle: "Join live, interactive Martial Arts Belts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official belt certifications, and world-class instructors.",
    primaryCtaText: "Join Academy Now",
    primaryCtaLink: "/programs",
    secondaryCtaText: "View Programs",
    secondaryCtaLink: "/programs",
    imageUrl: "/images/hero1.jpg",
    isEnabled: true,
  });

  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await getAdminBannerContentAction();
        if (res && res.success && res.banner) {
          setBanner((prev) => ({ ...prev, ...res.banner }));
        }
      } catch (err) {
        console.error("Failed to load banner:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBanner();
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await updateAdminBannerContentAction(banner);
      if (res && res.success) {
        setMsg({ type: "success", text: res.message || "Homepage Hero Banner updated successfully!" });
      } else {
        setMsg({ type: "error", text: res?.error || "Failed to update banner." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "An unexpected error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading hero banner configuration...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Homepage Hero Banner & Content Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic management for Homepage Hero Pill Badge, Headline Titles, Subtitle Paragraph, Dual CTA Buttons, and Background Image.
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
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0080FF]" /> Hero Banner Content Fields
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

            {/* 1. Top Capsule Badge */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E50914]" /> Top Capsule Badge Text
              </label>
              <input
                type="text"
                value={banner.badgeText}
                onChange={(e) => setBanner({ ...banner, badgeText: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#0080FF]"
                placeholder="e.g. ONLINE FITNESS & MARTIAL ARTS ACADEMY"
              />
            </div>

            {/* 2. Headline Part 1 & Headline Part 2 (Red Highlight) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Headline Title (White Text)
                </label>
                <input
                  type="text"
                  value={banner.titleMain}
                  onChange={(e) => setBanner({ ...banner, titleMain: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm focus:outline-none focus:border-[#0080FF]"
                  placeholder="e.g. Train Anywhere."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1 text-[#E50914]">
                  Headline Highlight (Red Highlight Text)
                </label>
                <input
                  type="text"
                  value={banner.titleHighlight}
                  onChange={(e) => setBanner({ ...banner, titleHighlight: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-[#E50914]/40 text-[#E50914] font-extrabold text-sm focus:outline-none focus:border-[#E50914]"
                  placeholder="e.g. Transform Yourself!"
                />
              </div>
            </div>

            {/* 3. Subtitle / Paragraph Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Subtitle Description Paragraph
              </label>
              <textarea
                rows={3}
                value={banner.subtitle}
                onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                placeholder="Enter subtitle paragraph description..."
              />
            </div>

            {/* 4. Dual CTA Buttons */}
            <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white block">
                Dual CTA Buttons Configuration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Red Pill Button */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#E50914] uppercase block">
                    Primary CTA Button (Red Pill)
                  </span>
                  <input
                    type="text"
                    value={banner.primaryCtaText}
                    onChange={(e) => setBanner({ ...banner, primaryCtaText: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#E50914]"
                    placeholder="Primary Button Label (e.g. Join Academy Now)"
                  />
                  <input
                    type="text"
                    value={banner.primaryCtaLink}
                    onChange={(e) => setBanner({ ...banner, primaryCtaLink: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs focus:outline-none focus:border-[#E50914]"
                    placeholder="Primary Button Link (e.g. /programs)"
                  />
                </div>

                {/* Secondary Glassmorphic Button */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase block">
                    Secondary CTA Button (Glassmorphic)
                  </span>
                  <input
                    type="text"
                    value={banner.secondaryCtaText}
                    onChange={(e) => setBanner({ ...banner, secondaryCtaText: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                    placeholder="Secondary Button Label (e.g. View Programs)"
                  />
                  <input
                    type="text"
                    value={banner.secondaryCtaLink}
                    onChange={(e) => setBanner({ ...banner, secondaryCtaLink: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs focus:outline-none focus:border-[#0080FF]"
                    placeholder="Secondary Button Link (e.g. /programs)"
                  />
                </div>
              </div>
            </div>

            {/* 5. Background Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Background Image Asset URL / Path
              </label>
              <input
                type="text"
                value={banner.imageUrl}
                onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#0080FF]"
                placeholder="e.g. /images/hero1.jpg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Publishing Banner Updates..." : "Publish Banner Updates"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
