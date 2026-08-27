"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { Image as ImageIcon, Save, CheckCircle2, AlertCircle, Plus, Trash2, Upload, Layers, Tag } from "lucide-react";
import { getAdminBannerContentAction, updateAdminBannerContentAction, uploadBannerImageAction } from "@/actions/admin.actions";

export default function AdminBannerManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [slides, setSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetSlideIdForUpload, setTargetSlideIdForUpload] = useState<string | null>(null);

  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await getAdminBannerContentAction();
        if (res && res.success && Array.isArray(res.slides)) {
          setSlides(res.slides);
        }
      } catch (err) {
        console.error("Failed to load banner slides:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBanner();
  }, []);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      badgeText: "NEW HERO BANNER SLIDE",
      titleMain: "New Training Program.",
      titleHighlight: "Start Today!",
      subtitle: "Experience high-energy virtual live classes with certified master instructors.",
      primaryCtaText: "Enroll Now",
      primaryCtaLink: "/programs",
      secondaryCtaText: "Learn More",
      secondaryCtaLink: "/about",
      imageUrl: "/images/hero1.jpg",
      isEnabled: true,
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      setMsg({ type: "error", text: "At least 1 banner slide must remain." });
      return;
    }
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setActiveSlideIndex(0);
  };

  const handleUpdateSlide = (id: string, field: string, value: any) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const TriggerImageUpload = (slideId: string) => {
    setTargetSlideIdForUpload(slideId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSlideIdForUpload) return;

    const slideId = targetSlideIdForUpload;
    setUploadingSlideId(slideId);
    setMsg(null);

    try {
      // 1. Read file as Data URL on client for 100% instant preview and Vercel compatibility
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        if (dataUrl) {
          handleUpdateSlide(slideId, "imageUrl", dataUrl);
          setMsg({ type: "success", text: "Image file uploaded and applied to banner slide!" });
        }
        setUploadingSlideId(null);
        setTargetSlideIdForUpload(null);
      };
      reader.onerror = () => {
        setMsg({ type: "error", text: "Failed to read selected image file." });
        setUploadingSlideId(null);
        setTargetSlideIdForUpload(null);
      };
      reader.readAsDataURL(file);

      // 2. Also attempt server storage upload
      const formData = new FormData();
      formData.append("file", file);
      uploadBannerImageAction(formData)
        .then((res) => {
          if (res && res.success && res.url) {
            handleUpdateSlide(slideId, "imageUrl", res.url);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      console.error("Image upload error:", err);
      setMsg({ type: "error", text: "Failed to process image file." });
      setUploadingSlideId(null);
      setTargetSlideIdForUpload(null);
    }
    e.target.value = "";
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await updateAdminBannerContentAction(slides);
      if (res && res.success) {
        setMsg({ type: "success", text: res.message || "All homepage banner slides published successfully!" });
      } else {
        setMsg({ type: "error", text: res?.error || "Failed to update banner slides." });
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
        <div className="p-8 text-center text-gray-400">Loading multi-slide banner configuration...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Multi-Slide Banner & Image Upload Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Add multiple banner slides, upload custom image files, edit headlines, and control slide visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0080FF]" /> Add Banner Slide
            </button>

            <button
              type="button"
              onClick={handleSaveBanner}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-lg shadow-[#0080FF]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Publishing Slides..." : "Publish Banner Updates"}
            </button>
          </div>
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

        {/* Slide Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              type="button"
              onClick={() => setActiveSlideIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeSlideIndex === idx
                  ? "bg-[#0080FF] text-white shadow-lg shadow-[#0080FF]/20"
                  : "bg-[#14161D] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Slide #{idx + 1} {!s.isEnabled && "(Disabled)"}
            </button>
          ))}
        </div>

        {/* Current Active Slide Form */}
        {currentSlide && (
          <form onSubmit={handleSaveBanner} className="space-y-6">
            <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#0080FF]" /> Editing Slide #{activeSlideIndex + 1} Fields
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateSlide(currentSlide.id, "isEnabled", !currentSlide.isEnabled)}
                    className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      currentSlide.isEnabled
                        ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                        : "bg-white/10 text-gray-400 border border-white/10"
                    }`}
                  >
                    {currentSlide.isEnabled ? "Status: Active" : "Status: Disabled"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(currentSlide.id)}
                    className="p-1.5 rounded-lg bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#EF4444] border border-[#E50914]/30 transition-all cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 1. Top Capsule Badge */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#E50914]" /> Top Capsule Badge Text
                </label>
                <input
                  type="text"
                  value={currentSlide.badgeText || ""}
                  onChange={(e) => handleUpdateSlide(currentSlide.id, "badgeText", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#0080FF]"
                  placeholder="e.g. ONLINE FITNESS & MARTIAL ARTS ACADEMY"
                />
              </div>

              {/* 2. Headline Main & Headline Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Headline Title (White Text)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.titleMain || ""}
                    onChange={(e) => handleUpdateSlide(currentSlide.id, "titleMain", e.target.value)}
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
                    value={currentSlide.titleHighlight || ""}
                    onChange={(e) => handleUpdateSlide(currentSlide.id, "titleHighlight", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-[#E50914]/40 text-[#E50914] font-extrabold text-sm focus:outline-none focus:border-[#E50914]"
                    placeholder="e.g. Transform Yourself!"
                  />
                </div>
              </div>

              {/* 3. Subtitle Paragraph */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Subtitle Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.subtitle || ""}
                  onChange={(e) => handleUpdateSlide(currentSlide.id, "subtitle", e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                  placeholder="Enter slide paragraph description..."
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
                      value={currentSlide.primaryCtaText || ""}
                      onChange={(e) => handleUpdateSlide(currentSlide.id, "primaryCtaText", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#E50914]"
                      placeholder="Label (e.g. Join Academy Now)"
                    />
                    <input
                      type="text"
                      value={currentSlide.primaryCtaLink || ""}
                      onChange={(e) => handleUpdateSlide(currentSlide.id, "primaryCtaLink", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs focus:outline-none focus:border-[#E50914]"
                      placeholder="Link (e.g. /programs)"
                    />
                  </div>

                  {/* Secondary Glassmorphic Button */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-300 uppercase block">
                      Secondary CTA Button (Glassmorphic)
                    </span>
                    <input
                      type="text"
                      value={currentSlide.secondaryCtaText || ""}
                      onChange={(e) => handleUpdateSlide(currentSlide.id, "secondaryCtaText", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                      placeholder="Label (e.g. View Programs)"
                    />
                    <input
                      type="text"
                      value={currentSlide.secondaryCtaLink || ""}
                      onChange={(e) => handleUpdateSlide(currentSlide.id, "secondaryCtaLink", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs focus:outline-none focus:border-[#0080FF]"
                      placeholder="Link (e.g. /programs)"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Background Image & Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Background Image File & Asset URL
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={currentSlide.imageUrl || ""}
                    onChange={(e) => handleUpdateSlide(currentSlide.id, "imageUrl", e.target.value)}
                    className="flex-grow h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#0080FF]"
                    placeholder="Image URL or Path (e.g. /images/hero1.jpg)"
                  />

                  <button
                    type="button"
                    onClick={() => TriggerImageUpload(currentSlide.id)}
                    disabled={uploadingSlideId === currentSlide.id}
                    className="px-5 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0080FF]/80 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingSlideId === currentSlide.id ? "Uploading Image..." : "Upload Image File"}
                  </button>
                </div>

                {/* Image Preview Thumbnail */}
                {currentSlide.imageUrl && (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0F1117] mt-2 shadow-inner">
                    {/* Standard HTML img tag to guarantee Data URL & server URL preview rendering */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentSlide.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-[#0A0B0E]/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      Live Image Preview
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Publishing All Slides..." : "Publish Banner Updates"}
            </button>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
