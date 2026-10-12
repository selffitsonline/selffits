"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
  Sparkles,
  Info,
  Layers,
  Video,
  ShieldCheck,
  Award,
  Heart,
  Flame,
  Zap,
  Users,
  BookOpen,
  Star,
  Target,
  AlertCircle,
  RotateCcw,
  Check,
  ImageIcon,
} from "lucide-react";
import {
  AboutPageConfig,
  AboutPageFeatureItem,
  AboutPagePillarItem,
  DEFAULT_ABOUT_PAGE_CONFIG,
} from "@/lib/about-config";
import {
  updateAboutPageConfigAction,
  uploadAboutImageAction,
} from "@/actions/about.actions";

export const PILLAR_ICONS = [
  { value: "Video", label: "Live Video", icon: Video },
  { value: "ShieldCheck", label: "Shield / Standards", icon: ShieldCheck },
  { value: "Award", label: "Award / Certification", icon: Award },
  { value: "Heart", label: "Heart / Inclusive", icon: Heart },
  { value: "Sparkles", label: "Sparkles / Excellence", icon: Sparkles },
  { value: "Users", label: "Users / Community", icon: Users },
  { value: "Flame", label: "Flame / Energy", icon: Flame },
  { value: "Zap", label: "Zap / Speed", icon: Zap },
  { value: "CheckCircle2", label: "Checkmark / Quality", icon: CheckCircle2 },
  { value: "Star", label: "Star / Mastery", icon: Star },
  { value: "Target", label: "Target / Focus", icon: Target },
  { value: "BookOpen", label: "Curriculum / Book", icon: BookOpen },
];

export const ACCENT_COLORS = [
  { label: "Red", value: "#E50914" },
  { label: "Blue", value: "#0080FF" },
  { label: "Green", value: "#10B981" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Cyan", value: "#06B6D4" },
];

export function renderPillarIcon(iconName: string, className = "w-6 h-6") {
  switch (iconName) {
    case "Video":
      return <Video className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "Award":
      return <Award className={className} />;
    case "Heart":
      return <Heart className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Flame":
      return <Flame className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "CheckCircle2":
      return <CheckCircle2 className={className} />;
    case "Star":
      return <Star className={className} />;
    case "Target":
      return <Target className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    default:
      return <Award className={className} />;
  }
}

interface AdminAboutViewProps {
  initialConfig: AboutPageConfig;
}

export function AdminAboutView({ initialConfig }: AdminAboutViewProps) {
  const [config, setConfig] = useState<AboutPageConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Tab definitions
  const tabs = [
    { id: 1, label: "1. Hero Introduction", icon: Sparkles },
    { id: 2, label: "2. Story & Main Content", icon: BookOpen },
    { id: 3, label: "3. Feature Highlights", icon: CheckCircle2 },
    { id: 4, label: "4. Core Pillars", icon: Award },
    { id: 5, label: "5. Bottom CTA", icon: Layers },
  ];

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await updateAboutPageConfigAction(config);
      if (res && res.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      } else {
        setErrorMessage(res?.error || "Failed to save configuration.");
      }
    } catch (err: any) {
      console.error("Save About Us config error:", err);
      setErrorMessage("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // Image file uploader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAboutImageAction(formData);

      if (res && res.success && res.url) {
        setConfig((prev) => ({
          ...prev,
          story: {
            ...prev.story,
            imageUrl: res.url!,
          },
        }));
      } else {
        setErrorMessage(res?.error || "Failed to upload image file.");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      setErrorMessage("Failed to upload image file.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // Reset to default template
  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all About Us fields to the original default content? Any unsaved edits will be lost."
      )
    ) {
      setConfig(DEFAULT_ABOUT_PAGE_CONFIG);
    }
  };

  // Story Paragraphs reorder & delete & add
  const handleAddParagraph = () => {
    setConfig((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        paragraphs: [
          ...prev.story.paragraphs,
          "New descriptive paragraph about academy training standards and vision.",
        ],
      },
    }));
  };

  const handleUpdateParagraph = (idx: number, value: string) => {
    setConfig((prev) => {
      const updated = [...prev.story.paragraphs];
      updated[idx] = value;
      return {
        ...prev,
        story: {
          ...prev.story,
          paragraphs: updated,
        },
      };
    });
  };

  const handleDeleteParagraph = (idx: number) => {
    if (config.story.paragraphs.length <= 1) {
      alert("At least one paragraph is required.");
      return;
    }
    setConfig((prev) => {
      const updated = prev.story.paragraphs.filter((_, i) => i !== idx);
      return {
        ...prev,
        story: {
          ...prev.story,
          paragraphs: updated,
        },
      };
    });
  };

  const handleMoveParagraph = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.story.paragraphs.length) return;

    setConfig((prev) => {
      const updated = [...prev.story.paragraphs];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return {
        ...prev,
        story: {
          ...prev.story,
          paragraphs: updated,
        },
      };
    });
  };

  // Feature Highlights
  const handleAddFeature = () => {
    const newFeature: AboutPageFeatureItem = {
      id: `feat_${Date.now()}`,
      text: "New feature highlight about academy achievements or programs.",
      color: "#E50914",
    };
    setConfig((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        features: [...prev.story.features, newFeature],
      },
    }));
  };

  const handleUpdateFeature = (
    idx: number,
    field: keyof AboutPageFeatureItem,
    value: string
  ) => {
    setConfig((prev) => {
      const updated = [...prev.story.features];
      updated[idx] = { ...updated[idx], [field]: value };
      return {
        ...prev,
        story: {
          ...prev.story,
          features: updated,
        },
      };
    });
  };

  const handleDeleteFeature = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        features: prev.story.features.filter((_, i) => i !== idx),
      },
    }));
  };

  const handleMoveFeature = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.story.features.length) return;

    setConfig((prev) => {
      const updated = [...prev.story.features];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return {
        ...prev,
        story: {
          ...prev.story,
          features: updated,
        },
      };
    });
  };

  // Pillars
  const handleAddPillar = () => {
    const newPillar: AboutPagePillarItem = {
      id: `pillar_${Date.now()}`,
      title: "New Core Pillar",
      description: "Description of the pillar and its value to our students.",
      icon: "ShieldCheck",
      color: "#0080FF",
    };
    setConfig((prev) => ({
      ...prev,
      pillars: {
        ...prev.pillars,
        items: [...prev.pillars.items, newPillar],
      },
    }));
  };

  const handleUpdatePillar = (
    idx: number,
    field: keyof AboutPagePillarItem,
    value: string
  ) => {
    setConfig((prev) => {
      const updated = [...prev.pillars.items];
      updated[idx] = { ...updated[idx], [field]: value };
      return {
        ...prev,
        pillars: {
          ...prev.pillars,
          items: updated,
        },
      };
    });
  };

  const handleDeletePillar = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      pillars: {
        ...prev.pillars,
        items: prev.pillars.items.filter((_, i) => i !== idx),
      },
    }));
  };

  const handleMovePillar = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.pillars.items.length) return;

    setConfig((prev) => {
      const updated = [...prev.pillars.items];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return {
        ...prev,
        pillars: {
          ...prev.pillars,
          items: updated,
        },
      };
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#14161D] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight">
              ABOUT US PAGE MANAGEMENT
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#0080FF]/20 text-[#0080FF] border border-[#0080FF]/30">
              Live CMS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage every section, heading, story paragraph, image, highlight, pillar, and CTA of the public About Us page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0080FF]" /> View Live Page
          </Link>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-1.5"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-60 ${
              isSaved
                ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[#10B981]/30 ring-2 ring-[#10B981]/50"
                : isSaving
                ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white animate-pulse"
                : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] hover:from-[#0070E0] hover:to-[#1D4ED8] text-white shadow-[#0080FF]/25 hover:shadow-[#0080FF]/40"
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
                <span>Published Live!</span>
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Publishing Updates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 shrink-0" />
                <span>Publish About Us Page</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-2 border-b border-white/10">
        {tabs.map((tab) => {
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
      {/* SECTION 1: HERO INTRODUCTION */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <div className="space-y-6 bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E50914]" /> Section 1: Page Hero & Mission
              </h2>
              <p className="text-xs text-gray-400">
                Top introduction section visible at the head of the About Us page.
              </p>
            </div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">
              Location: Top of /about
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#E50914] mb-1.5">
                Top Capsule Badge Text
              </label>
              <input
                type="text"
                value={config.hero.badge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, badge: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#E50914]"
                placeholder="e.g. Our Story & Mission"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Rendered as uppercase red badge above the main title.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                Main Page Heading (H1)
              </label>
              <input
                type="text"
                value={config.hero.heading}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, heading: e.target.value },
                  })
                }
                className="w-full h-12 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-black text-base focus:outline-none focus:border-[#0080FF]"
                placeholder="e.g. About SELFFITS Academy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Introductory Subtitle / Summary Paragraph
              </label>
              <textarea
                rows={3}
                value={config.hero.subtitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, subtitle: e.target.value },
                  })
                }
                className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium leading-relaxed focus:outline-none focus:border-[#0080FF]"
                placeholder="Democratizing authentic martial arts & high-intensity fitness training globally through real-time virtual classrooms."
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-6 rounded-xl bg-[#0A0B0E] border border-white/10 text-center space-y-3 mt-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
              HERO LIVE PREVIEW
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] block">
              {config.hero.badge || "Badge Text"}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
              {config.hero.heading || "Page Heading"}
            </h3>
            <p className="text-gray-400 text-xs max-w-xl mx-auto leading-relaxed">
              {config.hero.subtitle || "Subtitle description"}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: STORY & MAIN CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <div className="space-y-6 bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0080FF]" /> Section 2: Story & Main Content
              </h2>
              <p className="text-xs text-gray-400">
                Manage the main academy narrative, descriptive paragraphs, and story featured image.
              </p>
            </div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">
              Location: 2-Column Story Section
            </span>
          </div>

          {/* Story Heading */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white mb-1.5">
              Story Section Heading (H2)
            </label>
            <input
              type="text"
              value={config.story.heading}
              onChange={(e) =>
                setConfig({
                  ...config,
                  story: { ...config.story, heading: e.target.value },
                })
              }
              className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm focus:outline-none focus:border-[#0080FF]"
              placeholder="e.g. From Local Studio to Global Live Virtual Academy"
            />
          </div>

          {/* Repeatable Story Paragraphs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Descriptive Paragraphs ({config.story.paragraphs.length})
                </label>
                <span className="text-[11px] text-gray-500">
                  Add, edit, reorder, or remove paragraphs in the story description.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddParagraph}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#0080FF]" /> Add Paragraph
              </button>
            </div>

            <div className="space-y-3">
              {config.story.paragraphs.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="text-[11px] font-bold text-gray-400">
                      Paragraph #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveParagraph(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveParagraph(idx, "down")}
                        disabled={idx === config.story.paragraphs.length - 1}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteParagraph(idx)}
                        disabled={config.story.paragraphs.length <= 1}
                        className="p-1 rounded text-[#EF4444] hover:text-red-400 disabled:opacity-30"
                        title="Delete Paragraph"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-normal leading-relaxed focus:outline-none focus:border-[#0080FF]"
                    placeholder="Enter descriptive paragraph text..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Story Image */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                Story Featured Image & Alternative Text
              </label>
              <p className="text-[11px] text-gray-400">
                Displayed in the right column on desktop next to the academy narrative.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Image Asset URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.story.imageUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          story: { ...config.story, imageUrl: e.target.value },
                        })
                      }
                      className="flex-1 h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-[#0080FF]"
                      placeholder="/images/adults_martial_arts.png"
                    />
                    <label
                      htmlFor="story-image-upload"
                      className="px-4 py-2 rounded-lg bg-[#0080FF] hover:bg-[#0080FF]/80 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Upload File
                        </>
                      )}
                    </label>
                    <input
                      type="file"
                      id="story-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploadingImage}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Image Alternative Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={config.story.imageAlt}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        story: { ...config.story, imageAlt: e.target.value },
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-xs text-white focus:outline-none focus:border-[#0080FF]"
                    placeholder="SELFFITS Master Martial Arts Instructor teaching live class"
                  />
                </div>
              </div>

              {/* Image Preview */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  Preview
                </label>
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0F1117] flex items-center justify-center">
                  {config.story.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={config.story.imageUrl}
                      alt={config.story.imageAlt || "Preview"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" /> No image selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: FEATURE HIGHLIGHTS */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <div className="space-y-6 bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Section 3: Feature Highlights Checklist
              </h2>
              <p className="text-xs text-gray-400">
                Key achievements, certification badges, and student reach bullet points.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#10B981]" /> Add Highlight Item
            </button>
          </div>

          <div className="space-y-4">
            {config.story.features.map((feature, idx) => (
              <div
                key={feature.id || idx}
                className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: feature.color || "#E50914" }}
                    />
                    <span className="text-xs font-bold text-white">
                      Highlight Item #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveFeature(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveFeature(idx, "down")}
                      disabled={idx === config.story.features.length - 1}
                      className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeature(idx)}
                      className="p-1 rounded text-[#EF4444] hover:text-red-400"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-3">
                    <label className="text-[11px] font-bold text-gray-400 block mb-1">
                      Highlight Text
                    </label>
                    <input
                      type="text"
                      value={feature.text}
                      onChange={(e) =>
                        handleUpdateFeature(idx, "text", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF]"
                      placeholder="e.g. Over 2,000 active students trained across 15+ countries."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 block mb-1">
                      Checkmark Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => handleUpdateFeature(idx, "color", c.value)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            feature.color === c.value
                              ? "ring-2 ring-white scale-110"
                              : "opacity-60 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {feature.color === c.value && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {config.story.features.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-xs">
                No feature highlights configured. Click &ldquo;Add Highlight Item&rdquo; above to add one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: OUR CORE PILLARS */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <div className="space-y-6 bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F59E0B]" /> Section 4: Our Core Pillars
              </h2>
              <p className="text-xs text-gray-400">
                Pillars cards showing core principles, livestream guarantees, and values.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPillar}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0080FF]" /> Add Pillar Card
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={config.pillars.heading}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    pillars: { ...config.pillars, heading: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-extrabold text-sm focus:outline-none focus:border-[#0080FF]"
                placeholder="Our Core Pillars"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Optional Subtitle / Description
              </label>
              <input
                type="text"
                value={config.pillars.subtitle || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    pillars: { ...config.pillars, subtitle: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                placeholder="Optional subtitle for the pillars section..."
              />
            </div>
          </div>

          {/* Pillar Cards Manager */}
          <div className="space-y-4 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Pillar Cards ({config.pillars.items.length})
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.pillars.items.map((pillar, idx) => (
                <div
                  key={pillar.id || idx}
                  className="p-5 rounded-xl bg-[#0F1117] border border-white/10 space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${pillar.color || "#0080FF"}20`,
                          color: pillar.color || "#0080FF",
                        }}
                      >
                        {renderPillarIcon(pillar.icon, "w-4 h-4")}
                      </div>
                      <span className="text-xs font-extrabold text-white">
                        Pillar #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMovePillar(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePillar(idx, "down")}
                        disabled={idx === config.pillars.items.length - 1}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePillar(idx)}
                        className="p-1 rounded text-[#EF4444] hover:text-red-400"
                        title="Delete Pillar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Icon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">
                        Pillar Title
                      </label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) =>
                          handleUpdatePillar(idx, "title", e.target.value)
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#0080FF]"
                        placeholder="e.g. 100% Live Streaming"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">
                        Icon Symbol
                      </label>
                      <select
                        value={pillar.icon}
                        onChange={(e) =>
                          handleUpdatePillar(idx, "icon", e.target.value)
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                      >
                        {PILLAR_ICONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#14161D]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 block mb-1">
                      Description Text
                    </label>
                    <textarea
                      rows={2}
                      value={pillar.description}
                      onChange={(e) =>
                        handleUpdatePillar(idx, "description", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-normal focus:outline-none focus:border-[#0080FF]"
                      placeholder="Interactive virtual sessions ensuring accountability..."
                    />
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 block mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => handleUpdatePillar(idx, "color", c.value)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            pillar.color === c.value
                              ? "ring-2 ring-white scale-110"
                              : "opacity-60 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        >
                          {pillar.color === c.value && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={pillar.color || "#0080FF"}
                        onChange={(e) =>
                          handleUpdatePillar(idx, "color", e.target.value)
                        }
                        className="w-20 h-7 px-2 rounded bg-[#14161D] border border-white/10 font-mono text-[10px] text-white ml-2"
                        placeholder="#0080FF"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {config.pillars.items.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-xs">
                No pillars configured. Click &ldquo;Add Pillar Card&rdquo; to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: BOTTOM CALL TO ACTION */}
      {/* ========================================================================= */}
      {activeTab === 5 && (
        <div className="space-y-6 bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E50914]" /> Section 5: Bottom Call To Action
              </h2>
              <p className="text-xs text-gray-400">
                Primary conversion button located at the bottom of the About Us page.
              </p>
            </div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">
              Location: Bottom of /about
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                Button Label
              </label>
              <input
                type="text"
                value={config.cta.buttonText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cta: { ...config.cta, buttonText: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#E50914]"
                placeholder="Start Your Training Today"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                Destination Link (URL or Path)
              </label>
              <input
                type="text"
                value={config.cta.buttonLink}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cta: { ...config.cta, buttonLink: e.target.value },
                  })
                }
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-[#0080FF]"
                placeholder="/programs"
              />
            </div>
          </div>

          {/* CTA Preview */}
          <div className="p-8 rounded-xl bg-[#0A0B0E] border border-white/10 text-center space-y-4 mt-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
              BUTTON PREVIEW
            </span>
            <span className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base shadow-xl shadow-[#E50914]/25 inline-block">
              {config.cta.buttonText || "Button Label"}
            </span>
            <span className="text-xs text-gray-500 block">
              Links to: <span className="font-mono text-gray-300">{config.cta.buttonLink || "/programs"}</span>
            </span>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar with Save Button */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#14161D] border border-white/10 shadow-lg">
        <span className="text-xs text-gray-400">
          Make sure to click <strong className="text-white">Publish About Us Page</strong> to make changes live on <code className="text-[#0080FF]">/about</code>.
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-60 ${
            isSaved
              ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[#10B981]/30 ring-2 ring-[#10B981]/50"
              : isSaving
              ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white animate-pulse"
              : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] hover:from-[#0070E0] hover:to-[#1D4ED8] text-white shadow-[#0080FF]/25 hover:shadow-[#0080FF]/40"
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
              <span>Published Live!</span>
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Publishing Updates...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 shrink-0" />
              <span>Publish About Us Page</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
