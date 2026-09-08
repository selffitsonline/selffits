"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Layers,
  Tag,
  BookOpen,
  Info,
  ShieldCheck,
  Zap,
  Users,
  HelpCircle,
  Star,
  Award,
  Loader2,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminHomepageManagementAction,
  updateAdminHomepageSectionAction,
  uploadHomepageImageAction,
} from "@/actions/admin.actions";

export default function AdminHomepageManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savingSectionKey, setSavingSectionKey] = useState<string | null>(null);
  const [savedSectionKey, setSavedSectionKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);

  // 9 Sections State
  const [bannerSlides, setBannerSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [statsSection, setStatsSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    items: [],
  });

  const [programsSection, setProgramsSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    items: [],
  });

  const [beltSyllabusSection, setBeltSyllabusSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    belts: [],
  });

  const [fitnessJourneySection, setFitnessJourneySection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    points: [],
  });

  const [aboutSection, setAboutSection] = useState<any>({
    badgeText: "",
    headingTitle: "",
    description: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
    features: [],
  });

  const [whyChooseSection, setWhyChooseSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    items: [],
  });

  const [howItWorksSection, setHowItWorksSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    steps: [],
  });

  const [coachesSection, setCoachesSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    items: [],
  });

  const [faqsSection, setFaqsSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    items: [],
  });

  const [testimonialsSection, setTestimonialsSection] = useState<any>({
    headingBadge: "",
    headingTitle: "",
    headingSubtitle: "",
    items: [],
  });

  // Image upload loading tracker
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllHomepageData() {
      try {
        const res = await getAdminHomepageManagementAction();
        if (res && res.success && res.homepageData) {
          const d = res.homepageData;
          if (d.banner?.slides) setBannerSlides(d.banner.slides);
          if (d.stats) setStatsSection(d.stats);
          if (d.programs) setProgramsSection(d.programs);
          if (d.beltSyllabus) setBeltSyllabusSection(d.beltSyllabus);
          if (d.fitnessJourney) setFitnessJourneySection(d.fitnessJourney);
          if (d.about) setAboutSection(d.about);
          if (d.whyChoose) setWhyChooseSection(d.whyChoose);
          if (d.howItWorks) setHowItWorksSection(d.howItWorks);
          if (d.coaches) setCoachesSection(d.coaches);
          if (d.faqs) setFaqsSection(d.faqs);
          if (d.testimonials) setTestimonialsSection(d.testimonials);
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllHomepageData();
  }, []);

  // Universal image uploader helper
  const handleGenericFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetKey: string,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(targetKey);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onSuccess(reader.result as string);
      }
      setUploadingTarget(null);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);
    uploadHomepageImageAction(formData)
      .then((res) => {
        if (res && res.success && res.url) {
          onSuccess(res.url);
        }
      })
      .catch(() => {});

    e.target.value = "";
  };

  // Section Save Handler with smooth button Published Live feedback
  const handleSaveSection = async (sectionKey: string, payloadData: any) => {
    setSavingSectionKey(sectionKey);
    try {
      const res = await updateAdminHomepageSectionAction(sectionKey, payloadData);
      if (res && res.success) {
        setSavedSectionKey(sectionKey);

        // Auto-reset saved button state back after 3 seconds
        setTimeout(() => {
          setSavedSectionKey((curr) => (curr === sectionKey ? null : curr));
        }, 3000);
      }
    } catch (err: any) {
      console.error("Save section error:", err);
    } finally {
      setSavingSectionKey(null);
    }
  };

  // Reusable Save / Publish Button with smooth state animations
  const renderSaveButton = (
    sectionKey: string,
    payloadData: any,
    label: string = "Publish Section Updates",
    isFullWidth: boolean = false
  ) => {
    const isThisSaving = savingSectionKey === sectionKey;
    const isThisSaved = savedSectionKey === sectionKey;

    return (
      <button
        type="button"
        onClick={() => handleSaveSection(sectionKey, payloadData)}
        disabled={savingSectionKey !== null}
        className={`relative overflow-hidden transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 font-extrabold text-xs cursor-pointer disabled:opacity-60 shadow-lg ${
          isFullWidth ? "w-full py-3.5 rounded-xl uppercase tracking-wider" : "px-4.5 py-2.5 rounded-xl"
        } ${
          isThisSaved
            ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[#10B981]/30 ring-2 ring-[#10B981]/50 scale-105"
            : isThisSaving
            ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white animate-pulse"
            : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] hover:from-[#0070E0] hover:to-[#1D4ED8] text-white shadow-[#0080FF]/25 hover:shadow-[#0080FF]/40"
        }`}
      >
        {isThisSaved ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
            <span>Published Live!</span>
          </>
        ) : isThisSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Publishing...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  };

  // SECTION 1: Banner Handlers (Preserving 100% existing functionality)
  const currentSlide = bannerSlides[activeSlideIndex] || bannerSlides[0];

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
    const updated = [...bannerSlides, newSlide];
    setBannerSlides(updated);
    setActiveSlideIndex(bannerSlides.length);
  };

  const handleDeleteSlide = (id: string) => {
    if (bannerSlides.length <= 1) {
      return;
    }
    const updated = bannerSlides.filter((s) => s.id !== id);
    setBannerSlides(updated);
    setActiveSlideIndex(0);
  };

  const handleUpdateSlide = (id: string, field: string, value: any) => {
    setBannerSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading Homepage Management control panel...</div>
      </AdminShell>
    );
  }

  const tabItems = [
    { id: 1, label: "1. Homepage Banner", icon: ImageIcon },
    { id: 2, label: "2. Academy Metrics", icon: Award },
    { id: 3, label: "3. Explore Programs", icon: BookOpen },
    { id: 10, label: "3.5 Belt Syllabus", icon: BookOpen },
    { id: 11, label: "3.6 Weight Management", icon: Flame },
    { id: 4, label: "4. About SELFFITS", icon: Info },
    { id: 5, label: "5. Why Choose Us", icon: ShieldCheck },
    { id: 6, label: "6. How It Works", icon: Zap },
    { id: 7, label: "7. Master Coaches", icon: Users },
    { id: 8, label: "8. FAQs", icon: HelpCircle },
    { id: 9, label: "9. Success Stories", icon: Star },
  ];

  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl mx-auto relative">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight">
              HOMEPAGE MANAGEMENT
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Central management dashboard for all sections of the live SELFFITS homepage.
            </p>
          </div>
        </div>

        {/* 9 Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-3 border-b border-white/10">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white shadow-lg shadow-[#0080FF]/25"
                    : "bg-[#14161D] text-gray-400 border border-white/10 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: HOMEPAGE BANNER */}
        {/* ========================================================================= */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#14161D] border border-white/10">
              <div>
                <h2 className="text-base font-extrabold text-white">Section 1: Multi-Slide Homepage Banner</h2>
                <p className="text-xs text-gray-400">
                  Manage hero slides, background image files, button links, and badge text.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#0080FF]" /> Add Slide
                </button>
                {renderSaveButton("homepage_banner", { slides: bannerSlides }, "Publish Banner Updates")}
              </div>
            </div>

            {/* Slide Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {bannerSlides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    activeSlideIndex === idx
                      ? "bg-[#0080FF] text-white"
                      : "bg-[#0F1117] text-gray-400 border border-white/10 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Slide #{idx + 1} {!s.isEnabled && "(Disabled)"}
                </button>
              ))}
            </div>

            {currentSlide && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("homepage_banner", { slides: bannerSlides });
                }}
                className="space-y-6 bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0080FF]" /> Editing Slide #{activeSlideIndex + 1}
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Top Capsule Badge Text
                  </label>
                  <input
                    type="text"
                    value={currentSlide.badgeText || ""}
                    onChange={(e) => handleUpdateSlide(currentSlide.id, "badgeText", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#0080FF]"
                  />
                </div>

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
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#E50914] mb-1">
                      Headline Highlight (Red Highlight)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.titleHighlight || ""}
                      onChange={(e) => handleUpdateSlide(currentSlide.id, "titleHighlight", e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-[#E50914]/40 text-[#E50914] font-extrabold text-sm focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Subtitle Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={currentSlide.subtitle || ""}
                    onChange={(e) => handleUpdateSlide(currentSlide.id, "subtitle", e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                  />
                </div>

                {/* Dual CTA Buttons */}
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white block">
                    Dual CTA Buttons Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[#E50914] uppercase block">
                        Primary CTA Button
                      </span>
                      <input
                        type="text"
                        value={currentSlide.primaryCtaText || ""}
                        onChange={(e) => handleUpdateSlide(currentSlide.id, "primaryCtaText", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#E50914]"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={currentSlide.primaryCtaLink || ""}
                        onChange={(e) => handleUpdateSlide(currentSlide.id, "primaryCtaLink", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs focus:outline-none focus:border-[#E50914]"
                        placeholder="Link"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-gray-300 uppercase block">
                        Secondary CTA Button
                      </span>
                      <input
                        type="text"
                        value={currentSlide.secondaryCtaText || ""}
                        onChange={(e) => handleUpdateSlide(currentSlide.id, "secondaryCtaText", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={currentSlide.secondaryCtaLink || ""}
                        onChange={(e) => handleUpdateSlide(currentSlide.id, "secondaryCtaLink", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs focus:outline-none focus:border-[#0080FF]"
                        placeholder="Link"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Image Upload */}
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
                      placeholder="/images/hero1.jpg"
                    />
                    <input
                      type="file"
                      id={`slide-file-${currentSlide.id}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleGenericFileUpload(e, `slide_${currentSlide.id}`, (url) =>
                          handleUpdateSlide(currentSlide.id, "imageUrl", url)
                        )
                      }
                    />
                    <label
                      htmlFor={`slide-file-${currentSlide.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0080FF]/80 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingTarget === `slide_${currentSlide.id}` ? "Uploading..." : "Upload File"}
                    </label>
                  </div>
                  {currentSlide.imageUrl && (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0F1117] mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentSlide.imageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}
                </div>

                {renderSaveButton("homepage_banner", { slides: bannerSlides }, "Publish Banner Updates", true)}
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: ACADEMY METRICS & IMPACT (STATS) */}
        {/* ========================================================================= */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 2: Academy Metrics & Impact (Stats)</h2>
                {renderSaveButton("homepage_stats", statsSection, "Publish Stats Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Top Badge
                  </label>
                  <input
                    type="text"
                    value={statsSection.headingBadge || ""}
                    onChange={(e) => setStatsSection({ ...statsSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                    placeholder="e.g. ACADEMY METRICS & IMPACT"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={statsSection.headingTitle || ""}
                    onChange={(e) => setStatsSection({ ...statsSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                    placeholder="e.g. Proven Excellence Worldwide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={statsSection.headingSubtitle || ""}
                  onChange={(e) => setStatsSection({ ...statsSection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                  placeholder="Subheading description..."
                />
              </div>

              {/* Stat Cards Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Metric Cards ({statsSection.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newStat = {
                        id: `stat_${Date.now()}`,
                        value: "100+",
                        label: "New Metric Label",
                      };
                      setStatsSection({
                        ...statsSection,
                        items: [...(statsSection.items || []), newStat],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Metric Card
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statsSection.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-[#0080FF]">Metric #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = statsSection.items.filter((_: any, i: number) => i !== idx);
                            setStatsSection({ ...statsSection, items: updated });
                          }}
                          className="text-[#EF4444] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Value (e.g. 2,000+)</label>
                          <input
                            type="text"
                            value={item.value || ""}
                            onChange={(e) => {
                              const updated = [...statsSection.items];
                              updated[idx].value = e.target.value;
                              setStatsSection({ ...statsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-sm font-black"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Label (e.g. Active Students)</label>
                          <input
                            type="text"
                            value={item.label || ""}
                            onChange={(e) => {
                              const updated = [...statsSection.items];
                              updated[idx].label = e.target.value;
                              setStatsSection({ ...statsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: EXPLORE OUR PROGRAMS */}
        {/* ========================================================================= */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 3: Explore Our Programs</h2>
                {renderSaveButton("homepage_programs", programsSection, "Publish Programs Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Top Badge
                  </label>
                  <input
                    type="text"
                    value={programsSection.headingBadge || ""}
                    onChange={(e) => setProgramsSection({ ...programsSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={programsSection.headingTitle || ""}
                    onChange={(e) => setProgramsSection({ ...programsSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={programsSection.headingSubtitle || ""}
                  onChange={(e) => setProgramsSection({ ...programsSection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                />
              </div>

              {/* Program Cards Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Program Cards ({programsSection.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newPrg = {
                        id: `prg_${Date.now()}`,
                        title: "New Program Card",
                        category: "MARTIAL ARTS",
                        image: "/images/kids_martial_arts.png",
                        description: "Program description here...",
                        classes: "4 - 20 Live Classes",
                        duration: "1 - 5 Days / Wk",
                        priceStartsUSD: "25",
                        href: "/programs",
                      };
                      setProgramsSection({
                        ...programsSection,
                        items: [...(programsSection.items || []), newPrg],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Program Card
                  </button>
                </div>

                <div className="space-y-4">
                  {programsSection.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-[#0080FF]">Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = programsSection.items.filter((_: any, i: number) => i !== idx);
                            setProgramsSection({ ...programsSection, items: updated });
                          }}
                          className="text-[#EF4444] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Title</label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].title = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Category Badge</label>
                          <input
                            type="text"
                            value={item.category || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].category = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Starting Price (USD $)</label>
                          <input
                            type="text"
                            value={item.priceStartsUSD || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].priceStartsUSD = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={item.description || ""}
                          onChange={(e) => {
                            const updated = [...programsSection.items];
                            updated[idx].description = e.target.value;
                            setProgramsSection({ ...programsSection, items: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Classes Text</label>
                          <input
                            type="text"
                            value={item.classes || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].classes = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Duration Text</label>
                          <input
                            type="text"
                            value={item.duration || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].duration = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Link URL</label>
                          <input
                            type="text"
                            value={item.href || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].href = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Card Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.image || ""}
                            onChange={(e) => {
                              const updated = [...programsSection.items];
                              updated[idx].image = e.target.value;
                              setProgramsSection({ ...programsSection, items: updated });
                            }}
                            className="flex-grow h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-white text-xs"
                          />
                          <input
                            type="file"
                            id={`prg-img-${idx}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleGenericFileUpload(e, `prg_${idx}`, (url) => {
                                const updated = [...programsSection.items];
                                updated[idx].image = url;
                                setProgramsSection({ ...programsSection, items: updated });
                              })
                            }
                          />
                          <label
                            htmlFor={`prg-img-${idx}`}
                            className="px-3 py-1.5 rounded-lg bg-[#0080FF] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3.5: BELT PROGRESSION SYLLABUS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 10 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 3.5: Belt Progression Syllabus</h2>
                {renderSaveButton("homepage_belt_syllabus", beltSyllabusSection, "Publish Belt Syllabus Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Top Badge
                  </label>
                  <input
                    type="text"
                    value={beltSyllabusSection.headingBadge || ""}
                    onChange={(e) => setBeltSyllabusSection({ ...beltSyllabusSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                    placeholder="e.g. BELT PROGRESSION SYLLABUS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={beltSyllabusSection.headingTitle || ""}
                    onChange={(e) => setBeltSyllabusSection({ ...beltSyllabusSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                    placeholder="e.g. Your Martial Arts Learning Journey"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={beltSyllabusSection.headingSubtitle || ""}
                  onChange={(e) => setBeltSyllabusSection({ ...beltSyllabusSection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                  placeholder="Subheading description..."
                />
              </div>

              {/* Belt Levels Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Belt Levels ({beltSyllabusSection.belts?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newBelt = {
                        id: `belt_${Date.now()}`,
                        name: "New Belt",
                        subtitle: "Belt Rank Subtitle",
                        isEnabled: true,
                        syllabus: ["Sample syllabus point 1", "Sample syllabus point 2"],
                      };
                      setBeltSyllabusSection({
                        ...beltSyllabusSection,
                        belts: [...(beltSyllabusSection.belts || []), newBelt],
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Belt Level
                  </button>
                </div>

                <div className="space-y-6">
                  {beltSyllabusSection.belts?.map((belt: any, bIdx: number) => (
                    <div key={belt.id || bIdx} className="p-5 rounded-2xl bg-[#0F1117] border border-white/15 space-y-4 shadow-lg">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🥋</span>
                          <span className="text-sm font-extrabold text-white">{belt.name || `Belt #${bIdx + 1}`}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...beltSyllabusSection.belts];
                              updated[bIdx].isEnabled = belt.isEnabled === false ? true : false;
                              setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer border ${
                              belt.isEnabled !== false
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-white/10 text-gray-400 border-white/10"
                            }`}
                          >
                            {belt.isEnabled !== false ? "Active Belt" : "Disabled"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = beltSyllabusSection.belts.filter((_: any, i: number) => i !== bIdx);
                              setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                            }}
                            className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Delete Belt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Belt Name</label>
                          <input
                            type="text"
                            value={belt.name || ""}
                            onChange={(e) => {
                              const updated = [...beltSyllabusSection.belts];
                              updated[bIdx].name = e.target.value;
                              setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                            }}
                            className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-extrabold"
                            placeholder="e.g. White Belt"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Rank Subtitle / Focus</label>
                          <input
                            type="text"
                            value={belt.subtitle || ""}
                            onChange={(e) => {
                              const updated = [...beltSyllabusSection.belts];
                              updated[bIdx].subtitle = e.target.value;
                              setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                            }}
                            className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                            placeholder="e.g. Foundations & Fundamental Stances"
                          />
                        </div>
                      </div>

                      {/* Syllabus Points Sub-Manager */}
                      <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-bold text-[#0080FF] uppercase">
                            Syllabus Points ({belt.syllabus?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...beltSyllabusSection.belts];
                              const points = [...(updated[bIdx].syllabus || []), "New techniques & skills topic"];
                              updated[bIdx].syllabus = points;
                              setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                            }}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-[#0080FF]" /> Add Point
                          </button>
                        </div>

                        <div className="space-y-2">
                          {belt.syllabus?.map((point: string, pIdx: number) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-[#E50914]/15 text-[#E50914] text-[10px] font-black flex items-center justify-center shrink-0">
                                {pIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={point}
                                onChange={(e) => {
                                  const updated = [...beltSyllabusSection.belts];
                                  const points = [...updated[bIdx].syllabus];
                                  points[pIdx] = e.target.value;
                                  updated[bIdx].syllabus = points;
                                  setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                                }}
                                className="flex-grow h-9 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                              />
                              <div className="flex items-center gap-1">
                                {pIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...beltSyllabusSection.belts];
                                      const points = [...updated[bIdx].syllabus];
                                      const temp = points[pIdx];
                                      points[pIdx] = points[pIdx - 1];
                                      points[pIdx - 1] = temp;
                                      updated[bIdx].syllabus = points;
                                      setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                                    }}
                                    className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold cursor-pointer"
                                    title="Move Up"
                                  >
                                    ↑
                                  </button>
                                )}
                                {pIdx < belt.syllabus.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...beltSyllabusSection.belts];
                                      const points = [...updated[bIdx].syllabus];
                                      const temp = points[pIdx];
                                      points[pIdx] = points[pIdx + 1];
                                      points[pIdx + 1] = temp;
                                      updated[bIdx].syllabus = points;
                                      setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                                    }}
                                    className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold cursor-pointer"
                                    title="Move Down"
                                  >
                                    ↓
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...beltSyllabusSection.belts];
                                    const points = updated[bIdx].syllabus.filter((_: any, i: number) => i !== pIdx);
                                    updated[bIdx].syllabus = points;
                                    setBeltSyllabusSection({ ...beltSyllabusSection, belts: updated });
                                  }}
                                  className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                  title="Delete Point"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {renderSaveButton("homepage_belt_syllabus", beltSyllabusSection, "Publish Belt Syllabus Updates", true)}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3.6: WEIGHT MANAGEMENT JOURNEY SYLLABUS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 11 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 3.6: Weight Management Journey</h2>
                {renderSaveButton("homepage_fitness_journey", fitnessJourneySection, "Publish Weight Management Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Top Badge
                  </label>
                  <input
                    type="text"
                    value={fitnessJourneySection.headingBadge || ""}
                    onChange={(e) => setFitnessJourneySection({ ...fitnessJourneySection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                    placeholder="e.g. WEIGHT MANAGEMENT SYLLABUS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={fitnessJourneySection.headingTitle || ""}
                    onChange={(e) => setFitnessJourneySection({ ...fitnessJourneySection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                    placeholder="e.g. Your Weight Management Journey"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={fitnessJourneySection.headingSubtitle || ""}
                  onChange={(e) => setFitnessJourneySection({ ...fitnessJourneySection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                  placeholder="Subheading description..."
                />
              </div>

              {/* Weight Management Points Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Syllabus / Learning Points ({fitnessJourneySection.points?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newPoint = "New Weight Management Learning Point";
                      setFitnessJourneySection({
                        ...fitnessJourneySection,
                        points: [...(fitnessJourneySection.points || []), newPoint],
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Learning Point
                  </button>
                </div>

                <div className="space-y-3">
                  {fitnessJourneySection.points?.map((pt: string, pIdx: number) => (
                    <div key={pIdx} className="p-3 rounded-xl bg-[#0F1117] border border-white/10 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#E50914]/15 text-[#E50914] text-xs font-black flex items-center justify-center shrink-0">
                        {pIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={pt || ""}
                        onChange={(e) => {
                          const updated = [...fitnessJourneySection.points];
                          updated[pIdx] = e.target.value;
                          setFitnessJourneySection({ ...fitnessJourneySection, points: updated });
                        }}
                        className="flex-grow h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-medium"
                        placeholder={`Point #${pIdx + 1}`}
                      />
                      <div className="flex items-center gap-1">
                        {pIdx > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...fitnessJourneySection.points];
                              const temp = updated[pIdx];
                              updated[pIdx] = updated[pIdx - 1];
                              updated[pIdx - 1] = temp;
                              setFitnessJourneySection({ ...fitnessJourneySection, points: updated });
                            }}
                            className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold cursor-pointer"
                            title="Move Up"
                          >
                            ↑
                          </button>
                        )}
                        {pIdx < fitnessJourneySection.points.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...fitnessJourneySection.points];
                              const temp = updated[pIdx];
                              updated[pIdx] = updated[pIdx + 1];
                              updated[pIdx + 1] = temp;
                              setFitnessJourneySection({ ...fitnessJourneySection, points: updated });
                            }}
                            className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold cursor-pointer"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = fitnessJourneySection.points.filter((_: any, i: number) => i !== pIdx);
                            setFitnessJourneySection({ ...fitnessJourneySection, points: updated });
                          }}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Delete Point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {renderSaveButton("homepage_fitness_journey", fitnessJourneySection, "Publish Weight Management Updates", true)}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: ABOUT SELFFITS ACADEMY */}
        {/* ========================================================================= */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 4: About SELFFITS Academy</h2>
                {renderSaveButton("homepage_about", aboutSection, "Publish About Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={aboutSection.badgeText || ""}
                    onChange={(e) => setAboutSection({ ...aboutSection, badgeText: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Heading Title
                  </label>
                  <input
                    type="text"
                    value={aboutSection.headingTitle || ""}
                    onChange={(e) => setAboutSection({ ...aboutSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Main Paragraph Description
                </label>
                <textarea
                  rows={3}
                  value={aboutSection.description || ""}
                  onChange={(e) => setAboutSection({ ...aboutSection, description: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={aboutSection.ctaText || ""}
                    onChange={(e) => setAboutSection({ ...aboutSection, ctaText: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    CTA Button Link
                  </label>
                  <input
                    type="text"
                    value={aboutSection.ctaLink || ""}
                    onChange={(e) => setAboutSection({ ...aboutSection, ctaLink: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 font-mono text-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* Side Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Section Feature Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aboutSection.imageUrl || ""}
                    onChange={(e) => setAboutSection({ ...aboutSection, imageUrl: e.target.value })}
                    className="flex-grow h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 font-mono text-white text-xs"
                  />
                  <input
                    type="file"
                    id="about-img-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleGenericFileUpload(e, "about_img", (url) => setAboutSection({ ...aboutSection, imageUrl: url }))
                    }
                  />
                  <label
                    htmlFor="about-img-upload"
                    className="px-4 py-2 rounded-xl bg-[#0080FF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Upload Image
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: WHY CHOOSE SELFFITS */}
        {/* ========================================================================= */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 5: Why Choose SELFFITS?</h2>
                {renderSaveButton("homepage_why_choose", whyChooseSection, "Publish Why Choose Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={whyChooseSection.headingBadge || ""}
                    onChange={(e) => setWhyChooseSection({ ...whyChooseSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={whyChooseSection.headingTitle || ""}
                    onChange={(e) => setWhyChooseSection({ ...whyChooseSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              {/* Reason Cards */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Reason Cards ({whyChooseSection.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newReason = {
                        id: `why_${Date.now()}`,
                        iconType: "video",
                        title: "New Value Feature",
                        description: "Feature description text...",
                      };
                      setWhyChooseSection({
                        ...whyChooseSection,
                        items: [...(whyChooseSection.items || []), newReason],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Reason Card
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {whyChooseSection.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-[#0080FF]">Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = whyChooseSection.items.filter((_: any, i: number) => i !== idx);
                            setWhyChooseSection({ ...whyChooseSection, items: updated });
                          }}
                          className="text-[#EF4444] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Title</label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) => {
                            const updated = [...whyChooseSection.items];
                            updated[idx].title = e.target.value;
                            setWhyChooseSection({ ...whyChooseSection, items: updated });
                          }}
                          className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={item.description || ""}
                          onChange={(e) => {
                            const updated = [...whyChooseSection.items];
                            updated[idx].description = e.target.value;
                            setWhyChooseSection({ ...whyChooseSection, items: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: HOW SELFFITS WORKS */}
        {/* ========================================================================= */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 6: How SELFFITS Works</h2>
                {renderSaveButton("homepage_how_it_works", howItWorksSection, "Publish Roadmap Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={howItWorksSection.headingBadge || ""}
                    onChange={(e) => setHowItWorksSection({ ...howItWorksSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={howItWorksSection.headingTitle || ""}
                    onChange={(e) => setHowItWorksSection({ ...howItWorksSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={howItWorksSection.headingSubtitle || ""}
                  onChange={(e) => setHowItWorksSection({ ...howItWorksSection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                />
              </div>

              {/* Steps Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <span className="text-xs font-extrabold text-white uppercase block">6-Step Roadmap Steps</span>
                <div className="space-y-3">
                  {howItWorksSection.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#E50914] shrink-0">Step #{idx + 1}</span>
                        <input
                          type="text"
                          value={step.title || ""}
                          onChange={(e) => {
                            const updated = [...howItWorksSection.steps];
                            updated[idx].title = e.target.value;
                            setHowItWorksSection({ ...howItWorksSection, steps: updated });
                          }}
                          className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          placeholder="Step Title"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={step.description || ""}
                        onChange={(e) => {
                          const updated = [...howItWorksSection.steps];
                          updated[idx].description = e.target.value;
                          setHowItWorksSection({ ...howItWorksSection, steps: updated });
                        }}
                        className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                        placeholder="Step description..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: MEET OUR MASTER COACHES */}
        {/* ========================================================================= */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 7: Meet Our Master Coaches</h2>
                {renderSaveButton("homepage_coaches", coachesSection, "Publish Coaches Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={coachesSection.headingBadge || ""}
                    onChange={(e) => setCoachesSection({ ...coachesSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={coachesSection.headingTitle || ""}
                    onChange={(e) => setCoachesSection({ ...coachesSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={coachesSection.headingSubtitle || ""}
                  onChange={(e) => setCoachesSection({ ...coachesSection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                />
              </div>

              {/* Coaches Cards Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Coach Cards ({coachesSection.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newCoach = {
                        id: `coach_${Date.now()}`,
                        name: "Sensei New Coach",
                        role: "Martial Arts Instructor",
                        experience: "5+ Years Teaching",
                        rank: "Black Belt",
                        rating: "4.9",
                        statusBadge: "Live Form Evaluation Active",
                        image: "/images/adults_martial_arts.png",
                        bio: "Bio details here...",
                        specialty: "Martial Arts & Fitness",
                      };
                      setCoachesSection({
                        ...coachesSection,
                        items: [...(coachesSection.items || []), newCoach],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Coach Card
                  </button>
                </div>

                <div className="space-y-4">
                  {coachesSection.items?.map((coach: any, idx: number) => (
                    <div key={coach.id || idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-[#0080FF]">Coach #{idx + 1}: {coach.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = coachesSection.items.filter((_: any, i: number) => i !== idx);
                            setCoachesSection({ ...coachesSection, items: updated });
                          }}
                          className="text-[#EF4444] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Coach Name</label>
                          <input
                            type="text"
                            value={coach.name || ""}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].name = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Role</label>
                          <input
                            type="text"
                            value={coach.role || ""}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].role = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Rank / Belt</label>
                          <input
                            type="text"
                            value={coach.rank || ""}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].rank = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Experience</label>
                          <input
                            type="text"
                            value={coach.experience || ""}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].experience = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Specialty Badge</label>
                          <input
                            type="text"
                            value={coach.specialty || ""}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].specialty = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-[#F59E0B] block mb-1">Star Rating (e.g. 4.9)</label>
                          <input
                            type="text"
                            value={coach.rating || "4.9"}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].rating = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-bold text-xs"
                            placeholder="4.9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[#10B981] block mb-1">Footer Status Badge (e.g. Live Form Evaluation Active)</label>
                          <input
                            type="text"
                            value={coach.statusBadge || "Live Form Evaluation Active"}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].statusBadge = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-semibold text-xs"
                            placeholder="e.g. Live Form Evaluation Active"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Coach Bio</label>
                        <textarea
                          rows={2}
                          value={coach.bio || ""}
                          onChange={(e) => {
                            const updated = [...coachesSection.items];
                            updated[idx].bio = e.target.value;
                            setCoachesSection({ ...coachesSection, items: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Photo Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={coach.image || ""}
                            onChange={(e) => {
                              const updated = [...coachesSection.items];
                              updated[idx].image = e.target.value;
                              setCoachesSection({ ...coachesSection, items: updated });
                            }}
                            className="flex-grow h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-white text-xs"
                          />
                          <input
                            type="file"
                            id={`coach-img-${idx}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleGenericFileUpload(e, `coach_${idx}`, (url) => {
                                const updated = [...coachesSection.items];
                                updated[idx].image = url;
                                setCoachesSection({ ...coachesSection, items: updated });
                              })
                            }
                          />
                          <label
                            htmlFor={`coach-img-${idx}`}
                            className="px-3 py-1.5 rounded-lg bg-[#0080FF] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
        {/* ========================================================================= */}
        {activeTab === 8 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 8: Frequently Asked Questions</h2>
                {renderSaveButton("homepage_faqs", faqsSection, "Publish FAQ Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={faqsSection.headingBadge || ""}
                    onChange={(e) => setFaqsSection({ ...faqsSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={faqsSection.headingTitle || ""}
                    onChange={(e) => setFaqsSection({ ...faqsSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              {/* FAQ Q&A Items Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">FAQ Items ({faqsSection.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newFaq = {
                        question: "New Frequently Asked Question?",
                        answer: "Answer text here...",
                      };
                      setFaqsSection({
                        ...faqsSection,
                        items: [...(faqsSection.items || []), newFaq],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add FAQ Item
                  </button>
                </div>

                <div className="space-y-4">
                  {faqsSection.items?.map((faq: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-[#0080FF]">FAQ #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = faqsSection.items.filter((_: any, i: number) => i !== idx);
                            setFaqsSection({ ...faqsSection, items: updated });
                          }}
                          className="text-[#EF4444] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Question</label>
                        <input
                          type="text"
                          value={faq.question || ""}
                          onChange={(e) => {
                            const updated = [...faqsSection.items];
                            updated[idx].question = e.target.value;
                            setFaqsSection({ ...faqsSection, items: updated });
                          }}
                          className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Answer</label>
                        <textarea
                          rows={3}
                          value={faq.answer || ""}
                          onChange={(e) => {
                            const updated = [...faqsSection.items];
                            updated[idx].answer = e.target.value;
                            setFaqsSection({ ...faqsSection, items: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 9: SUCCESS STORIES & TESTIMONIALS */}
        {/* ========================================================================= */}
        {activeTab === 9 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#14161D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white">Section 9: Success Stories & Testimonials</h2>
                {renderSaveButton("homepage_testimonials", testimonialsSection, "Publish Stories Updates")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={testimonialsSection.headingBadge || ""}
                    onChange={(e) => setTestimonialsSection({ ...testimonialsSection, headingBadge: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={testimonialsSection.headingTitle || ""}
                    onChange={(e) => setTestimonialsSection({ ...testimonialsSection, headingTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Subheading Description
                </label>
                <input
                  type="text"
                  value={testimonialsSection.headingSubtitle || ""}
                  onChange={(e) => setTestimonialsSection({ ...testimonialsSection, headingSubtitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium"
                />
              </div>

              {/* Testimonials Manager */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase">Testimonial Cards ({testimonialsSection.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newTest = {
                        id: `test_${Date.now()}`,
                        quote: "Student review quote text...",
                        name: "Student Name",
                        role: "Kid / Adult Student",
                        stars: 5,
                        achievement: "Belt Achieved",
                      };
                      setTestimonialsSection({
                        ...testimonialsSection,
                        items: [...(testimonialsSection.items || []), newTest],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Testimonial Card
                  </button>
                </div>

                <div className="space-y-4">
                  {testimonialsSection.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-[#0080FF]">Testimonial #{idx + 1}: {item.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = testimonialsSection.items.filter((_: any, i: number) => i !== idx);
                            setTestimonialsSection({ ...testimonialsSection, items: updated });
                          }}
                          className="text-[#EF4444] hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">Quote</label>
                        <textarea
                          rows={2}
                          value={item.quote || ""}
                          onChange={(e) => {
                            const updated = [...testimonialsSection.items];
                            updated[idx].quote = e.target.value;
                            setTestimonialsSection({ ...testimonialsSection, items: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Student Name</label>
                          <input
                            type="text"
                            value={item.name || ""}
                            onChange={(e) => {
                              const updated = [...testimonialsSection.items];
                              updated[idx].name = e.target.value;
                              setTestimonialsSection({ ...testimonialsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Role / Location</label>
                          <input
                            type="text"
                            value={item.role || ""}
                            onChange={(e) => {
                              const updated = [...testimonialsSection.items];
                              updated[idx].role = e.target.value;
                              setTestimonialsSection({ ...testimonialsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">Achievement Badge</label>
                          <input
                            type="text"
                            value={item.achievement || ""}
                            onChange={(e) => {
                              const updated = [...testimonialsSection.items];
                              updated[idx].achievement = e.target.value;
                              setTestimonialsSection({ ...testimonialsSection, items: updated });
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
