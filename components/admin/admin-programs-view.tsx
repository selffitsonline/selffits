"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Award,
  Sparkles,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import { getAdminProgramsCatalogAction, updateAdminProgramsCatalogAction } from "@/actions/admin.actions";

// COMPLETE 15-COURSE DEFAULT CATALOG MATCHING THE WEBSITE EXACTLY
const FULL_MMA_DATA = {
  kids: {
    age: "Age: 08 Years to 20 Years",
    categoryTitle: "Kids Martial Arts",
    description: "Structured virtual martial arts progression teaching stances, kicks, discipline, and core techniques for young learners.",
    courses: [
      {
        id: "mma-kids-1m",
        planId: "yellow-belt",
        title: "1 Month Course — Yellow Belt",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        isActive: true,
        curriculum: [
          "Breathing exercises for beginners",
          "Warm-up exercises for beginners",
          "All joints exercises for beginners",
          "Stretching exercises for beginners",
          "Martial arts basic stances for beginners",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: ["03:30 PM to 04:15 PM (GMT)", "05:15 PM to 06:00 PM (GMT)"],
        },
      },
      {
        id: "mma-kids-3m",
        planId: "blue-belt",
        title: "3 Months Course — Blue Belt",
        belt: "Blue Belt",
        beltColor: "blue",
        priceINR: "7999",
        priceUSD: "99",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 24 days",
        isActive: true,
        curriculum: [
          "Breathing exercises for intermediate level",
          "Dynamic warm-up",
          "All joints exercises for intermediate level",
          "Stretching exercises for intermediate level",
          "Martial arts basic movements for intermediate level",
          "Martial arts basic blocks, kicks, punches, and push-ups",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "60 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: ["03:30 PM to 04:30 PM (GMT)", "05:15 PM to 06:15 PM (GMT)"],
        },
      },
      {
        id: "mma-kids-6m",
        planId: "purple-belt",
        title: "6 Month Course — Purple Belt",
        belt: "Purple Belt",
        beltColor: "purple",
        priceINR: "13999",
        priceUSD: "179",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 48 days",
        isActive: true,
        curriculum: [
          "Advanced level meditation",
          "Advanced level breathing",
          "5-minute cardio workout",
          "Advanced level martial arts movements",
          "Animal stances, catches, blocks, and attacks",
          "Basic level martial arts fighting",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: ["03:30 PM to 05:00 PM (GMT)", "05:15 PM to 06:45 PM (GMT)"],
        },
      },
      {
        id: "mma-kids-12m",
        planId: "brown-belt",
        title: "12 Months Course — Brown Belt",
        belt: "Brown Belt",
        beltColor: "brown",
        priceINR: "24999",
        priceUSD: "319",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 96 days",
        isActive: true,
        curriculum: [
          "Master level meditation",
          "Master level breathing",
          "10-minute cardio workout",
          "Master level animal stances, catches, blocks, and attacks",
          "Kung-fu tiger, eagle, and snake movements",
          "Advanced level martial arts fighting",
          "Basic level martial arts weapons",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: ["03:30 PM to 05:00 PM (GMT)", "05:15 PM to 06:45 PM (GMT)"],
        },
      },
    ],
  },
  adults: {
    age: "Age: 21 Years+",
    categoryTitle: "Adults Mix Martial Arts",
    description: "Comprehensive martial arts for adults. Enhance overall fitness, practical striking, defense maneuvers, and belt advancement.",
    courses: [
      {
        id: "mma-adults-1m",
        planId: "yellow-belt",
        title: "1 Month Course — Yellow Belt",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        isActive: true,
        curriculum: [
          "Breathing exercises for beginners",
          "Warm-up exercises for beginners",
          "All joints exercises for beginners",
          "Stretching exercises for beginners",
          "Martial arts basic stances for beginners",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["04:30 AM to 05:15 AM (GMT)", "06:00 AM to 06:45 AM (GMT)"],
          eveningBatch: ["07:00 PM to 07:45 PM (GMT)", "08:30 PM to 09:15 PM (GMT)"],
        },
      },
      {
        id: "mma-adults-3m",
        planId: "blue-belt",
        title: "3 Months Course — Blue Belt",
        belt: "Blue Belt",
        beltColor: "blue",
        priceINR: "7999",
        priceUSD: "99",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 24 days",
        isActive: true,
        curriculum: [
          "Breathing exercises for intermediate level",
          "Dynamic warm-up",
          "All joints exercises for intermediate level",
          "Stretching exercises for intermediate level",
          "Martial arts basic movements for intermediate level",
          "Martial arts basic blocks, kicks, punches, and push-ups",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "60 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["04:30 AM to 05:30 AM (GMT)", "06:00 AM to 07:00 AM (GMT)"],
          eveningBatch: ["07:00 PM to 08:00 PM (GMT)", "08:30 PM to 09:30 PM (GMT)"],
        },
      },
      {
        id: "mma-adults-6m",
        planId: "purple-belt",
        title: "6 Month Course — Purple Belt",
        belt: "Purple Belt",
        beltColor: "purple",
        priceINR: "13999",
        priceUSD: "179",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 48 days",
        isActive: true,
        curriculum: [
          "Advanced level meditation",
          "Advanced level breathing",
          "5-minute cardio workout",
          "Advanced level martial arts movements",
          "Animal stances, catches, blocks, and attacks",
          "Basic level martial arts fighting",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["04:30 AM to 06:00 AM (GMT)", "06:00 AM to 07:30 AM (GMT)"],
          eveningBatch: ["07:00 PM to 08:30 PM (GMT)", "08:30 PM to 10:00 PM (GMT)"],
        },
      },
      {
        id: "mma-adults-12m",
        planId: "brown-belt",
        title: "12 Months Course — Brown Belt",
        belt: "Brown Belt",
        beltColor: "brown",
        priceINR: "24999",
        priceUSD: "319",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 96 days",
        isActive: true,
        curriculum: [
          "Master level meditation",
          "Master level breathing",
          "10-minute cardio workout",
          "Master level animal stances, catches, blocks, and attacks",
          "Kung-fu tiger, eagle, and snake movements",
          "Advanced level martial arts fighting",
          "Basic level martial arts weapons",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["04:30 AM to 06:00 AM (GMT)", "06:00 AM to 07:30 AM (GMT)"],
          eveningBatch: ["07:00 PM to 08:30 PM (GMT)", "08:30 PM to 10:00 PM (GMT)"],
        },
      },
    ],
  },
  ladies: {
    age: "Age: 21 Years+",
    categoryTitle: "Ladies Only Martial Arts",
    description: "Exclusive female-only online martial arts sessions focusing on self-defense, core strength, toning, and personal safety.",
    courses: [
      {
        id: "mma-ladies-1m",
        planId: "yellow-belt",
        title: "1 Month Course — Yellow Belt",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        isActive: true,
        curriculum: [
          "Breathing exercises for beginners",
          "Warm-up exercises for beginners",
          "All joints exercises for beginners",
          "Stretching exercises for beginners",
          "Martial arts basic stances for beginners",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["08:00 AM to 08:45 AM (GMT)", "09:30 AM to 10:15 AM (GMT)"],
          eveningBatch: ["07:00 PM to 07:45 PM (GMT)", "08:30 PM to 09:15 PM (GMT)"],
        },
      },
      {
        id: "mma-ladies-3m",
        planId: "blue-belt",
        title: "3 Months Course — Blue Belt",
        belt: "Blue Belt",
        beltColor: "blue",
        priceINR: "7999",
        priceUSD: "99",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 24 days",
        isActive: true,
        curriculum: [
          "Breathing exercises for intermediate level",
          "Dynamic warm-up",
          "All joints exercises for intermediate level",
          "Stretching exercises for intermediate level",
          "Martial arts basic movements for intermediate level",
          "Martial arts basic blocks, kicks, punches, and push-ups",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "60 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["08:00 AM to 09:00 AM (GMT)", "09:30 AM to 10:30 AM (GMT)"],
          eveningBatch: ["07:00 PM to 08:00 PM (GMT)", "08:30 PM to 09:30 PM (GMT)"],
        },
      },
      {
        id: "mma-ladies-6m",
        planId: "purple-belt",
        title: "6 Month Course — Purple Belt",
        belt: "Purple Belt",
        beltColor: "purple",
        priceINR: "13999",
        priceUSD: "179",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 48 days",
        isActive: true,
        curriculum: [
          "Advanced level meditation",
          "Advanced level breathing",
          "5-minute cardio workout",
          "Advanced level martial arts movements",
          "Animal stances, catches, blocks, and attacks",
          "Basic level martial arts fighting",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["08:00 AM to 09:30 AM (GMT)", "09:30 AM to 11:00 AM (GMT)"],
          eveningBatch: ["07:00 PM to 08:30 PM (GMT)", "08:30 PM to 10:00 PM (GMT)"],
        },
      },
      {
        id: "mma-ladies-12m",
        planId: "brown-belt",
        title: "12 Months Course — Brown Belt",
        belt: "Brown Belt",
        beltColor: "brown",
        priceINR: "24999",
        priceUSD: "319",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 96 days",
        isActive: true,
        curriculum: [
          "Master level meditation",
          "Master level breathing",
          "10-minute cardio workout",
          "Master level animal stances, catches, blocks, and attacks",
          "Kung-fu tiger, eagle, and snake movements",
          "Advanced level martial arts fighting",
          "Basic level martial arts weapons",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: ["08:00 AM to 09:30 AM (GMT)", "09:30 AM to 11:00 AM (GMT)"],
          eveningBatch: ["07:00 PM to 08:30 PM (GMT)", "08:30 PM to 10:00 PM (GMT)"],
        },
      },
    ],
  },
};

const FULL_HIIT_DATA = [
  {
    id: "hiit-8d",
    planId: "challenge-8",
    title: "8 Days Challenge for Kids",
    priceINR: "1499",
    priceUSD: "19",
    inclusions: "Everything listed below is included.",
    platform: "Zoom Classes",
    classInfo: "1-hour online class — 8 days",
    isActive: true,
    program: [
      "Advanced level meditation and breathing exercises",
      "Light and easy warm-up sessions",
      "2 days quick full body dynamic workout",
      "3 days back-to-back progressive challenge",
      "3 days high-volume fat-burning and strengthening challenge",
    ],
    schedule: {
      classesWeekly: "2 days",
      availableDays: ["Sunday", "Wednesday"],
      timing: "03:30 PM to 04:30 PM (GMT)",
    },
  },
  {
    id: "hiit-24d",
    planId: "challenge-24",
    title: "24 Days Challenge for Kids",
    priceINR: "3999",
    priceUSD: "49",
    inclusions: "Everything listed below is included.",
    platform: "Zoom Classes",
    classInfo: "1-hour online class — 24 days",
    isActive: true,
    program: [
      "Advanced level meditation and breathing exercises",
      "Light and easy warm-up sessions",
      "2 days quick full body dynamic workout",
      "3 days back-to-back progressive challenge",
      "3 days high-volume fat-burning and strengthening challenge",
      "8 days fat loss and cardio workouts",
      "8 days intense calorie-burning workouts",
    ],
    schedule: {
      classesWeekly: "2 days",
      timing: "03:30 PM to 04:30 PM (GMT)",
    },
  },
  {
    id: "hiit-48d",
    planId: "challenge-48",
    title: "48 Days Challenge for Kids",
    priceINR: "7999",
    priceUSD: "99",
    inclusions: "Everything listed below is included.",
    platform: "Zoom Classes",
    classInfo: "1-hour online class — 48 days",
    isActive: true,
    program: [
      "Advanced level meditation and breathing exercises",
      "Light and easy warm-up sessions",
      "2 days quick full body dynamic workout",
      "3 days back-to-back progressive challenge",
      "3 days high-volume fat-burning and strengthening challenge",
      "8 days fat loss and cardio workouts",
      "8 days intense calorie-burning workouts",
      "8 days intermediate ABC and core",
      "8 days advanced bodyweight loss challenge",
      "8 days yoga classes",
    ],
    schedule: {
      classesWeekly: "2 days",
      timing: "03:30 PM to 04:30 PM (GMT)",
    },
  },
];

export function AdminProgramsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"mma" | "hiit">("mma");
  const [mmaSubCat, setMmaSubCat] = useState<"kids" | "adults" | "ladies">("kids");

  const [mmaData, setMmaData] = useState<any>(FULL_MMA_DATA);
  const [hiitData, setHiitData] = useState<any[]>(FULL_HIIT_DATA);

  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await getAdminProgramsCatalogAction();
        if (res && res.success && res.catalog) {
          const cat = res.catalog as any;
          if (cat.mmaData) setMmaData(cat.mmaData);
          if (cat.hiitData) setHiitData(cat.hiitData);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleSaveCatalog = async () => {
    setIsSaving(true);
    setMsg(null);

    try {
      const catalogPayload = { mmaData, hiitData };
      const res = await updateAdminProgramsCatalogAction(catalogPayload);
      if (res && res.success) {
        setMsg({ type: "success", text: "All 15 course catalog updates published successfully to live website!" });
      } else {
        setMsg({ type: "error", text: res?.error || "Failed to update catalog." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCourseStatus = (courseId: string) => {
    if (activeTab === "mma") {
      setMmaData((prev: any) => ({
        ...prev,
        [mmaSubCat]: {
          ...prev[mmaSubCat],
          courses: prev[mmaSubCat].courses.map((c: any) =>
            c.id === courseId ? { ...c, isActive: c.isActive === false ? true : false } : c
          ),
        },
      }));
    } else {
      setHiitData((prev: any[]) =>
        prev.map((c: any) =>
          c.id === courseId ? { ...c, isActive: c.isActive === false ? true : false } : c
        )
      );
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (activeTab === "mma") {
      setMmaData((prev: any) => ({
        ...prev,
        [mmaSubCat]: {
          ...prev[mmaSubCat],
          courses: prev[mmaSubCat].courses.filter((c: any) => c.id !== courseId),
        },
      }));
    } else {
      setHiitData((prev: any[]) => prev.filter((c: any) => c.id !== courseId));
    }
    if (editingCourse?.id === courseId) setEditingCourse(null);
  };

  const handleAddCourse = () => {
    const newId = `custom-${Date.now()}`;
    if (activeTab === "mma") {
      const newMmaCourse = {
        id: newId,
        planId: "yellow-belt",
        title: "New Martial Arts Course",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        isActive: true,
        curriculum: ["Basic martial arts stance", "Breathing & warm-up"],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday"],
          availableTimings: ["04:00 PM to 05:00 PM (GMT)"],
        },
      };
      setMmaData((prev: any) => ({
        ...prev,
        [mmaSubCat]: {
          ...prev[mmaSubCat],
          courses: [...(prev[mmaSubCat].courses || []), newMmaCourse],
        },
      }));
      setEditingCourse(newMmaCourse);
    } else {
      const newHiitCourse = {
        id: newId,
        planId: "challenge-8",
        title: "New Fitness Challenge",
        priceINR: "1499",
        priceUSD: "19",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        isActive: true,
        program: ["Full body dynamic workout", "HIIT fat loss challenge"],
        schedule: {
          classesWeekly: "2 days",
          timing: "04:00 PM to 05:00 PM (GMT)",
        },
      };
      setHiitData((prev: any[]) => [...prev, newHiitCourse]);
      setEditingCourse(newHiitCourse);
    }
  };

  const handleUpdateEditingField = (field: string, value: any) => {
    if (!editingCourse) return;
    const updated = { ...editingCourse, [field]: value };
    setEditingCourse(updated);

    if (activeTab === "mma") {
      setMmaData((prev: any) => ({
        ...prev,
        [mmaSubCat]: {
          ...prev[mmaSubCat],
          courses: prev[mmaSubCat].courses.map((c: any) => (c.id === editingCourse.id ? updated : c)),
        },
      }));
    } else {
      setHiitData((prev: any[]) => prev.map((c: any) => (c.id === editingCourse.id ? updated : c)));
    }
  };

  const handleCurriculumChange = (idx: number, text: string) => {
    if (!editingCourse) return;
    const key = activeTab === "mma" ? "curriculum" : "program";
    const items = [...(editingCourse[key] || [])];
    items[idx] = text;
    handleUpdateEditingField(key, items);
  };

  const handleAddCurriculumItem = () => {
    if (!editingCourse) return;
    const key = activeTab === "mma" ? "curriculum" : "program";
    const items = [...(editingCourse[key] || []), "New learning topic/exercise"];
    handleUpdateEditingField(key, items);
  };

  const handleDeleteCurriculumItem = (idx: number) => {
    if (!editingCourse) return;
    const key = activeTab === "mma" ? "curriculum" : "program";
    const items = (editingCourse[key] || []).filter((_: any, i: number) => i !== idx);
    handleUpdateEditingField(key, items);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading complete 15-course catalog & pricing...</div>
      </AdminShell>
    );
  }

  const currentMmaCategoryObj = mmaData[mmaSubCat] || { courses: [] };
  const displayedCourses = activeTab === "mma" ? currentMmaCategoryObj.courses || [] : hiitData || [];

  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Complete Course & Program Pricing Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Pre-loaded with all 15 courses across Kids (4), Adults (4), Ladies Only (4), and HIIT Weight Loss (3).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddCourse}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0080FF]" /> Add New Course
            </button>

            <button
              type="button"
              onClick={handleSaveCatalog}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-lg shadow-[#0080FF]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Publishing Catalog..." : "Publish Catalog Updates"}
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

        {/* Primary Category Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#14161D] p-3 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab("mma");
                setEditingCourse(null);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "mma" ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25" : "text-gray-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" /> Mixed Martial Arts ({mmaSubCat === "kids" ? "4 Courses" : mmaSubCat === "adults" ? "4 Courses" : "4 Courses"})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("hiit");
                setEditingCourse(null);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "hiit" ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25" : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" /> HIIT & Weight Loss Challenges (3 Courses)
            </button>
          </div>

          {/* MMA Sub-category Tabs */}
          {activeTab === "mma" && (
            <div className="flex items-center gap-2 bg-[#0F1117] p-1.5 rounded-xl border border-white/10">
              {(
                [
                  { label: "Kids (4 Courses)", key: "kids" },
                  { label: "Adults (4 Courses)", key: "adults" },
                  { label: "Ladies Only (4 Courses)", key: "ladies" },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => {
                    setMmaSubCat(sub.key);
                    setEditingCourse(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mmaSubCat === sub.key ? "bg-[#0080FF] text-white shadow" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Layout: Course List + Full Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Course List (Cards) */}
          <div className={`${editingCourse ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
            {displayedCourses.map((c: any) => (
              <div
                key={c.id}
                onClick={() => setEditingCourse(c)}
                className={`p-5 rounded-2xl bg-[#14161D] border transition-all cursor-pointer shadow-xl relative ${
                  editingCourse?.id === c.id
                    ? "border-[#0080FF] ring-2 ring-[#0080FF]/30"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {c.belt && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {c.belt}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-gray-400">{c.classInfo || c.platform}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      {c.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCourseStatus(c.id);
                      }}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        c.isActive !== false
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-white/10 text-gray-400 border border-white/10"
                      }`}
                      title={c.isActive !== false ? "Active on website" : "Disabled on website"}
                    >
                      {c.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(c.id);
                      }}
                      className="p-1.5 rounded-lg bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#EF4444] border border-[#E50914]/30 transition-all cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white font-[family-name:var(--font-outfit)]">
                      ₹{c.priceINR}
                    </span>
                    <span className="text-xs text-gray-400">(${c.priceUSD} USD)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingCourse(c)}
                    className="text-xs font-bold text-[#0080FF] hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Full Course Fields Drawer / Editor */}
          {editingCourse && (
            <div className="lg:col-span-7 bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#0080FF]" /> Editing Course: {editingCourse.title}
                </h2>

                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="text-xs font-bold text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-white/10"
                >
                  Close Editor
                </button>
              </div>

              {/* 1. Course Title & Belt Badge */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={editingCourse.title || ""}
                    onChange={(e) => handleUpdateEditingField("title", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#0080FF]"
                    placeholder="e.g. 1 Month Course — Yellow Belt"
                  />
                </div>

                {activeTab === "mma" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                        Belt Name / Rank
                      </label>
                      <input
                        type="text"
                        value={editingCourse.belt || ""}
                        onChange={(e) => handleUpdateEditingField("belt", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                        placeholder="e.g. Yellow Belt"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                        Belt Color Style
                      </label>
                      <select
                        value={editingCourse.beltColor || "yellow"}
                        onChange={(e) => handleUpdateEditingField("beltColor", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                      >
                        <option value="yellow">Yellow Belt</option>
                        <option value="blue">Blue Belt</option>
                        <option value="purple">Purple Belt</option>
                        <option value="brown">Brown Belt</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Course Pricing (INR & USD) */}
              <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-3">
                <span className="text-xs font-extrabold uppercase text-white block">
                  Course Pricing (INR & USD)
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                      Price INR (₹)
                    </label>
                    <input
                      type="text"
                      value={editingCourse.priceINR || ""}
                      onChange={(e) => handleUpdateEditingField("priceINR", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                      placeholder="e.g. 2999"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                      Price USD ($)
                    </label>
                    <input
                      type="text"
                      value={editingCourse.priceUSD || ""}
                      onChange={(e) => handleUpdateEditingField("priceUSD", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                      placeholder="e.g. 39"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Badges, Platform & Class Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Provision Badge (e.g. Certification)
                  </label>
                  <input
                    type="text"
                    value={editingCourse.provision || ""}
                    onChange={(e) => handleUpdateEditingField("provision", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                    placeholder="e.g. Certificate will be provided."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Class Format & Duration
                  </label>
                  <input
                    type="text"
                    value={editingCourse.classInfo || ""}
                    onChange={(e) => handleUpdateEditingField("classInfo", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                    placeholder="e.g. 1-hour online class — 8 days"
                  />
                </div>
              </div>

              {/* 4. Curriculum / Syllabus Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-gray-300">
                    Curriculum & Learning Topics:
                  </label>

                  <button
                    type="button"
                    onClick={handleAddCurriculumItem}
                    className="px-3 py-1 rounded-lg bg-[#0080FF]/20 text-[#0080FF] text-xs font-extrabold hover:bg-[#0080FF]/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Topic
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {((activeTab === "mma" ? editingCourse.curriculum : editingCourse.program) || []).map(
                    (topic: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => handleCurriculumChange(idx, e.target.value)}
                          className="flex-grow h-9 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCurriculumItem(idx)}
                          className="p-2 rounded-lg bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#EF4444] border border-[#E50914]/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Publish Button */}
              <button
                type="button"
                onClick={handleSaveCatalog}
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? "Publishing Catalog..." : "Publish Catalog Updates"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
