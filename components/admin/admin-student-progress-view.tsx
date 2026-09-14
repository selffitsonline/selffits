"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Search,
  Filter,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  FileText,
  Download,
  Users,
  RefreshCw,
  Eye,
  UserCheck,
  Layers,
  Upload,
  Trash2,
  ExternalLink,
  Lock,
  RotateCcw,
} from "lucide-react";
import {
  getAdminStudentProgressListAction,
  getStudentProgressDetailsAction,
  deleteStudentCertificateAction,
} from "@/actions/student-progress.actions";

interface AdminStudentProgressViewProps {
  initialBatches?: any[];
  initialStudents?: any[];
}

const BELT_OPTIONS = [
  "White Belt",
  "Yellow Belt",
  "Orange Belt",
  "Green Belt",
  "Blue Belt",
  "Purple Belt",
  "Brown Belt",
  "Black Belt",
];

const BELT_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  "White Belt": { bg: "bg-gray-200/20", text: "text-gray-200", border: "border-gray-400/30" },
  "Yellow Belt": { bg: "bg-amber-400/20", text: "text-amber-300", border: "border-amber-400/40" },
  "Orange Belt": { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/40" },
  "Green Belt": { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40" },
  "Blue Belt": { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/40" },
  "Purple Belt": { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40" },
  "Brown Belt": { bg: "bg-amber-800/30", text: "text-amber-400", border: "border-amber-700/50" },
  "Black Belt": { bg: "bg-red-950/40", text: "text-red-400", border: "border-red-600/50" },
};

export function AdminStudentProgressView({
  initialBatches = [],
  initialStudents = [],
}: AdminStudentProgressViewProps) {
  const [batches, setBatches] = useState<any[]>(initialBatches || []);
  const [students, setStudents] = useState<any[]>(initialStudents || []);

  // Sync state when props update from server component re-render / page navigation
  React.useEffect(() => {
    setBatches(initialBatches || []);
    setStudents(initialStudents || []);
  }, [initialBatches, initialStudents]);

  // Auto-refresh directory on client mount to capture newly created batches/students
  React.useEffect(() => {
    handleRefreshDirectory();
  }, []);

  // Primary Batch Selector State (Defaults to "ALL" so all students are visible)
  const [selectedBatchId, setSelectedBatchId] = useState<string>("ALL");

  // Student Scope Filter State: "ALL" | "ENROLLED_BATCH" | "DIRECT_UNASSIGNED"
  const [studentScope, setStudentScope] = useState<string>("ALL");

  // Additional Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBeltFilter, setSelectedBeltFilter] = useState("ALL");
  const [selectedExamStatusFilter, setSelectedExamStatusFilter] = useState("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState("ALL");

  const handleResetFilters = () => {
    setStudentScope("ALL");
    setSelectedBatchId("ALL");
    setSelectedDateFilter("ALL");
    setSelectedBeltFilter("ALL");
    setSelectedExamStatusFilter("ALL");
    setSearchQuery("");
  };

  const isFilterActive =
    studentScope !== "ALL" ||
    selectedBatchId !== "ALL" ||
    selectedDateFilter !== "ALL" ||
    selectedBeltFilter !== "ALL" ||
    selectedExamStatusFilter !== "ALL" ||
    searchQuery.trim() !== "";

  // Selected Student Details Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Modals & Action States
  const [showUploadCertModal, setShowUploadCertModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);

  // Modal specific feedback states for Upload Certificate
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  // Toast notification
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form inputs for Certificate Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCertTitle, setUploadCertTitle] = useState("");
  const [uploadBeltName, setUploadBeltName] = useState("Yellow Belt");

  // Selected Batch Metadata Object
  const activeBatch = batches.find((b) => b.id === selectedBatchId);

  const refreshStudentDetails = async (stdId: string, batchIdOverride?: string) => {
    setLoadingDetails(true);
    setDetailsError(null);
    const targetBatch = batchIdOverride !== undefined ? batchIdOverride : selectedBatchId;
    try {
      const res = await getStudentProgressDetailsAction(stdId, targetBatch);
      if (res.success && res.student) {
        setStudentDetails(res.student);
      } else {
        setDetailsError(res.error || "Failed to load student details.");
      }
    } catch (err: any) {
      setDetailsError(err?.message || "Error loading student details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectStudent = (stdId: string) => {
    setSelectedStudentId(stdId);
    refreshStudentDetails(stdId, selectedBatchId);
  };

  const handleRefreshDirectory = async () => {
    const res = await getAdminStudentProgressListAction();
    if (res.success) {
      if (Array.isArray(res.batches) && res.batches.length > 0) setBatches(res.batches);
      if (Array.isArray(res.students) && res.students.length > 0) setStudents(res.students);
    } else {
      console.warn("getAdminStudentProgressListAction warning:", res.error);
    }
  };

  // Filter students by Scope, Batch, Belt, Exam Status, Date, & Search Query
  const filteredStudents = students.filter((std) => {
    // 0. Student Scope Filter
    if (studentScope === "ENROLLED_BATCH" && (!std.batchIds || std.batchIds.length === 0)) {
      return false;
    }
    if (studentScope === "DIRECT_UNASSIGNED" && std.batchIds && std.batchIds.length > 0) {
      return false;
    }

    // 1. Primary Batch Filter
    if (selectedBatchId !== "ALL") {
      if (!std.batchIds || !std.batchIds.includes(selectedBatchId)) {
        return false;
      }
    }

    // 2. Date / Date Range Filter
    if (selectedDateFilter !== "ALL") {
      const stdDateStr = std.latestExamDateISO || std.createdAtISO;
      if (stdDateStr) {
        const stdDate = new Date(stdDateStr);
        const now = new Date();
        if (selectedDateFilter === "THIS_MONTH") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (stdDate < startOfMonth) return false;
        } else if (selectedDateFilter === "LAST_30_DAYS") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (stdDate < thirtyDaysAgo) return false;
        } else if (selectedDateFilter === "THIS_YEAR") {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          if (stdDate < startOfYear) return false;
        }
      }
    }

    // 3. Belt Level Filter
    if (selectedBeltFilter !== "ALL" && std.currentBelt !== selectedBeltFilter) {
      return false;
    }

    // 4. Exam Status Filter
    if (selectedExamStatusFilter !== "ALL" && std.latestExamStatus !== selectedExamStatusFilter) {
      return false;
    }

    // 5. Multi-field Search Query Filter (Name, Email, Phone)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = std.name?.toLowerCase().includes(q);
      const matchEmail = std.email?.toLowerCase().includes(q);
      const matchPhone = std.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    return true;
  });

  // Overview Counts
  const batchStudentsCount = filteredStudents.length;

  // Handlers for Certificate Upload
  const handleOpenUploadCertModal = () => {
    if (!studentDetails) return;
    const initialBelt = studentDetails.batchInfo?.beltLevel || studentDetails.currentBelt || "Yellow Belt";
    setUploadBeltName(initialBelt);
    setUploadCertTitle(`${initialBelt} Graduation Certificate`);
    setUploadFile(null);
    setUploadSuccess(false);
    setUploadSuccessMsg("");
    setUploadErrorMsg("");
    setShowUploadCertModal(true);
  };

  const handleConfirmUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !uploadFile) {
      setUploadErrorMsg("Please select a certificate file to upload.");
      return;
    }
    setSubmitting(true);
    setUploadErrorMsg("");
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("userId", selectedStudentId);
    if (studentDetails?.batchInfo?.id) {
      formData.append("batchId", studentDetails.batchInfo.id);
    }
    formData.append("beltName", uploadBeltName);
    formData.append("title", uploadCertTitle || `${uploadBeltName} Graduation Certificate`);

    try {
      const res = await fetch("/api/admin/upload-certificate", {
        method: "POST",
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { success: false, error: `Server response error HTTP ${res.status}: ${res.statusText || "Upload failed"}` };
      }
      setSubmitting(false);

      if (res.ok && data.success) {
        setUploadSuccess(true);
        setUploadSuccessMsg(data.message || "Certificate uploaded successfully!");
        setNotification({ message: data.message || "Certificate uploaded successfully!", type: "success" });
        setUploadFile(null);
        await refreshStudentDetails(selectedStudentId);
        await handleRefreshDirectory();
      } else {
        const errorText = data.error || data.message || `Upload failed with status HTTP ${res.status}`;
        setUploadErrorMsg(errorText);
        setNotification({ message: errorText, type: "error" });
      }
    } catch (err: any) {
      setSubmitting(false);
      const errMsg = err?.message || "An error occurred while uploading file.";
      setUploadErrorMsg(errMsg);
      setNotification({ message: errMsg, type: "error" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Handler for Deleting Certificate
  const handleDeleteCertificate = async (certificateId: string) => {
    if (!confirm("Are you sure you want to delete this certificate? This action will permanently remove the record and file.")) {
      return;
    }
    setDeletingCertId(certificateId);
    const res = await deleteStudentCertificateAction({ certificateId });
    setDeletingCertId(null);

    if (res.success) {
      setNotification({ message: res.message || "Certificate deleted successfully.", type: "success" });
      if (selectedStudentId) {
        await refreshStudentDetails(selectedStudentId);
      }
      await handleRefreshDirectory();
    } else {
      setNotification({ message: res.error || "Failed to delete certificate.", type: "error" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs hover:underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-3">
              <Award className="w-7 h-7 text-[#0080FF]" /> Student Progress & Certification
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Select a batch below to manage student progress and issue official graduation certificates.
            </p>
          </div>
          <button
            onClick={handleRefreshDirectory}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0080FF]" /> Refresh Batches
          </button>
        </div>

        {/* TOP SECTION: BATCH SELECTION & MANAGEMENT FILTERS WORKSPACE */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#14161D] via-[#1A1D27] to-[#14161D] border border-[#0080FF]/30 shadow-2xl space-y-5">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0080FF]/20 border border-[#0080FF]/40 flex items-center justify-center text-[#0080FF] font-extrabold shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#0080FF] tracking-wider">
                  Management Context
                </span>
                <h3 className="text-base font-extrabold text-white font-[family-name:var(--font-outfit)]">
                  Batch & Progress Controls
                </h3>
              </div>
            </div>

            {/* INTEGRATED TOP CONTROLS TOOLBAR */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              {/* Search Query Input */}
              <div className="relative min-w-[200px] flex-1 xl:flex-none">
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
                />
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3" />
              </div>

              {/* 0. Student Scope Filter */}
              <div className="flex items-center gap-1.5 bg-[#0F1117] border border-white/10 rounded-xl px-3 h-10">
                <Users className="w-3.5 h-3.5 text-[#0080FF] shrink-0" />
                <select
                  value={studentScope}
                  onChange={(e) => setStudentScope(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#14161D]">All Students</option>
                  <option value="ENROLLED_BATCH" className="bg-[#14161D]">Batch Students</option>
                  <option value="DIRECT_UNASSIGNED" className="bg-[#14161D]">Unassigned Students</option>
                </select>
              </div>

              {/* 1. Primary Batch Selector */}
              <div className="min-w-[240px] flex-1 xl:flex-none">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border-2 border-[#0080FF] text-white text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-[#0080FF]/50 shadow-lg cursor-pointer"
                >
                  <option value="ALL" className="bg-[#14161D]">
                    🌐 All Batches ({students.length} Total Students)
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#14161D]">
                      🥋 {b.name} — {b.programTitle} ({b.capacityLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Date / Date Range Filter */}
              <div className="flex items-center gap-1.5 bg-[#0F1117] border border-white/10 rounded-xl px-3 h-10">
                <Calendar className="w-3.5 h-3.5 text-[#0080FF] shrink-0" />
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#14161D]">All Dates</option>
                  <option value="THIS_MONTH" className="bg-[#14161D]">This Month</option>
                  <option value="LAST_30_DAYS" className="bg-[#14161D]">Last 30 Days</option>
                  <option value="THIS_YEAR" className="bg-[#14161D]">This Year</option>
                </select>
              </div>

              {/* 3. Belt Level Filter */}
              <div className="flex items-center gap-1.5 bg-[#0F1117] border border-white/10 rounded-xl px-3 h-10">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={selectedBeltFilter}
                  onChange={(e) => setSelectedBeltFilter(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#14161D]">All Belts</option>
                  {BELT_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-[#14161D]">{b}</option>
                  ))}
                </select>
              </div>

              {/* 4. Reset Filters Button */}
              {isFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-2 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Reset all active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE BATCH METADATA BANNER (IF BATCH SELECTED) */}
          {activeBatch && (
            <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold">Batch Code & Exam Date</span>
                <p className="font-mono text-[#0080FF] font-bold">{activeBatch.batchId}</p>
                <p className="font-extrabold text-white text-sm">{activeBatch.name}</p>
                <p className="text-amber-400 font-bold flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5" /> Exam: {activeBatch.examDate || "Not Set"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold">Program & Coach</span>
                <p className="font-bold text-white truncate">{activeBatch.programTitle}</p>
                <p className="text-gray-400 flex items-center gap-1 font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-[#10B981]" /> {activeBatch.coachName} ({activeBatch.coachRank})
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold">Belt Level & Schedule</span>
                <p className="font-bold text-amber-300">🥋 {activeBatch.beltLevel || "Yellow Belt"}</p>
                <p className="text-[#0080FF] font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {activeBatch.clockTiming}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold">Enrolled Capacity</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-400">{activeBatch.capacityLabel} Seats</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                    {activeBatch.status}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px]">Database Linked Students</p>
              </div>
            </div>
          )}
        </div>

        {/* Overview Stats Bar for Currently Selected Batch View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#14161D] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                {selectedBatchId === "ALL" ? "Total Registered Students" : "Students in Selected Batch"}
              </p>
              <h3 className="text-2xl font-black text-white mt-1 font-[family-name:var(--font-outfit)]">
                {batchStudentsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Configured Batch Exam Date</p>
              <h3 className="text-lg font-extrabold text-amber-400 mt-1 font-[family-name:var(--font-outfit)]">
                {activeBatch?.examDate || "Select a Specific Batch"}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-5 rounded-2xl flex items-center justify-between sm:col-span-2 lg:col-span-1">
            <div>
              <p className="text-xs text-gray-400">Batch Target Belt Level</p>
              <h3 className="text-lg font-extrabold text-emerald-400 mt-1 font-[family-name:var(--font-outfit)]">
                🥋 {activeBatch?.beltLevel || "Batch Specific"}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* STUDENT DIRECTORY TABLE FOR SELECTED BATCH */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1117] text-gray-400 font-extrabold uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Student Profile</th>
                  <th className="p-4">Assigned Batch & Program</th>
                  <th className="p-4">Current Belt</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500">
                      <Users className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-gray-400">
                        {selectedBatchId === "ALL"
                          ? "No matching student records found."
                          : `No students assigned to batch "${activeBatch?.name || "Selected Batch"}" in the database.`}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {selectedBatchId !== "ALL"
                          ? "Assign students to this batch in Batch Management or select 'All Batches'."
                          : "Try adjusting search criteria or belt filters."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => {
                    const beltStyle = BELT_COLOR_MAP[std.currentBelt] || BELT_COLOR_MAP["White Belt"];
                    return (
                      <tr
                        key={std.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleSelectStudent(std.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0080FF] to-[#0055B3] flex items-center justify-center font-black text-white text-sm shrink-0">
                              {std.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm hover:text-[#0080FF] transition-colors">
                                {std.name}
                              </p>
                              <p className="text-gray-400 text-[11px]">{std.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-gray-300">
                          <p className="text-white font-bold">{std.activeProgram}</p>
                          {std.batchNames && std.batchNames.length > 0 ? (
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {std.batchNames.map((bn: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-[#0080FF]/15 text-[#0080FF] text-[10px] font-bold border border-[#0080FF]/30"
                                >
                                  {bn}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-[10px]">Direct Student</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${beltStyle.bg} ${beltStyle.text} ${beltStyle.border}`}
                          >
                            🥋 {std.currentBelt}
                          </span>
                        </td>

                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectStudent(std.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white text-xs font-bold transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> Manage Progress
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Student Progress Workspace Modal */}
        {selectedStudentId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#14161D] border border-white/10 w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0080FF]/20 text-[#0080FF] border border-[#0080FF]/30">
                      Student Achievement Profile
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-[family-name:var(--font-outfit)]">
                    {studentDetails?.name || "Loading Student..."}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {studentDetails?.email} • {studentDetails?.phone}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDetails(null);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {loadingDetails ? (
                <div className="py-12 text-center text-gray-400 space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#0080FF] animate-spin mx-auto" />
                  <p className="text-xs font-bold">Loading student progress and batch details...</p>
                </div>
              ) : detailsError || !studentDetails ? (
                <div className="py-12 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-amber-400">{detailsError || "Failed to load student progress details."}</p>
                  <button
                    onClick={() => refreshStudentDetails(selectedStudentId!, selectedBatchId)}
                    className="px-4 py-2 bg-[#0080FF] hover:bg-[#0066CC] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Current Belt & Batch Exam Date Overview Card */}
                  <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/10 space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {/* Left: Current Belt Rank */}
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-medium">Current Belt Rank</span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-1.5 rounded-full text-base font-black border uppercase ${
                              (BELT_COLOR_MAP[studentDetails.currentBelt] || BELT_COLOR_MAP["White Belt"]).bg
                            } ${
                              (BELT_COLOR_MAP[studentDetails.currentBelt] || BELT_COLOR_MAP["White Belt"]).text
                            } ${
                              (BELT_COLOR_MAP[studentDetails.currentBelt] || BELT_COLOR_MAP["White Belt"]).border
                            }`}
                          >
                            🥋 {studentDetails.currentBelt}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 pt-1">
                          Award Date: <span className="text-white font-semibold">{studentDetails.beltAwardedAt}</span>
                        </p>
                      </div>

                      {/* Middle: Batch Exam Date Display */}
                      <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-1 min-w-[240px]">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                          Assigned Batch Exam Date
                        </span>
                        {studentDetails.batchInfo?.examDate ? (
                          <div className="space-y-1.5">
                            <p className="text-sm font-black text-amber-400 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-amber-400" />
                              {studentDetails.batchInfo.examDate}
                            </p>
                            {studentDetails.batchInfo.isExamDatePassed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Exam Date Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                                <Clock className="w-3 h-3" /> Upcoming Exam
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No exam date configured for batch.</p>
                        )}
                      </div>

                      {/* Right: Actions (Upload Certificate) */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={handleOpenUploadCertModal}
                          disabled={!studentDetails.batchInfo?.isExamDatePassed}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            studentDetails.batchInfo?.isExamDatePassed
                              ? "bg-gradient-to-r from-[#0080FF] to-[#0055B3] text-white shadow-md shadow-[#0080FF]/20 hover:opacity-90 cursor-pointer"
                              : "bg-gray-800/60 text-gray-500 border border-white/5 cursor-not-allowed opacity-60"
                          }`}
                          title={
                            !studentDetails.batchInfo?.isExamDatePassed
                              ? "Certificate upload unlocks after the Batch Exam Date"
                              : "Upload Belt Certificate"
                          }
                        >
                          {!studentDetails.batchInfo?.isExamDatePassed ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload Certificate
                        </button>
                      </div>
                    </div>

                    {!studentDetails.batchInfo?.isExamDatePassed && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          <strong>Notice:</strong> Certificate upload action remains locked until the Batch Exam Date (<strong>{studentDetails.batchInfo?.examDate || "Not Set"}</strong>) has passed.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section: Issued Certificates */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#F59E0B]" /> Issued Certificates
                      </h3>
                      <span className="text-xs text-gray-400 font-semibold">
                        {studentDetails.certificates.length} Certificate(s) Uploaded
                      </span>
                    </div>

                    {studentDetails.certificates.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#0F1117] border border-white/5 text-center space-y-2">
                        <FileText className="w-8 h-8 text-gray-600 mx-auto opacity-50" />
                        <p className="text-xs text-gray-400">No certificates issued to this student yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {studentDetails.certificates.map((cert: any) => (
                          <div
                            key={cert.id}
                            className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                                    🥋 {cert.beltName}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-white mt-1.5">{cert.title}</h4>
                                  <p className="text-[11px] text-gray-400">{cert.programTitle}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[9px] font-black shrink-0">
                                  VERIFIED
                                </span>
                              </div>

                              <div className="text-[10px] text-gray-400 space-y-0.5 bg-[#14161D] p-2.5 rounded-xl border border-white/5 font-mono">
                                <p>ID: <span className="text-gray-200">{cert.certificateNumber}</span></p>
                                <p>Uploaded: <span className="text-gray-200">{cert.issuedDate}</span></p>
                              </div>
                            </div>

                            {/* Certificate Actions: View, Download, Delete */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                              <a
                                href={`${cert.fileUrl}?inline=true`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 border border-white/10"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#0080FF]" /> View
                              </a>

                              <a
                                href={cert.fileUrl}
                                download
                                className="flex-1 py-2 rounded-xl bg-[#0080FF]/20 hover:bg-[#0080FF]/30 text-[#0080FF] text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#0080FF]/30"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>

                              <button
                                onClick={() => handleDeleteCertificate(cert.id)}
                                disabled={deletingCertId === cert.id}
                                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-500/30"
                                title="Delete Certificate"
                              >
                                {deletingCertId === cert.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Upload Certificate */}
        {showUploadCertModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#14161D] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#0080FF]" /> Upload Belt Certificate Document
                </h3>
                <button onClick={() => setShowUploadCertModal(false)} className="text-gray-400 hover:text-white text-xs font-bold">
                  ✕
                </button>
              </div>

              {/* ERROR NOTIFICATION STATE INSIDE MODAL */}
              {uploadErrorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleConfirmUploadCertificate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Belt Level *</label>
                  <select
                    value={uploadBeltName}
                    onChange={(e) => {
                      setUploadBeltName(e.target.value);
                      setUploadCertTitle(`${e.target.value} Graduation Certificate`);
                      setUploadSuccess(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold focus:outline-none focus:border-[#0080FF]"
                  >
                    {BELT_OPTIONS.map((b) => (
                      <option key={b} value={b} className="bg-[#14161D]">{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    value={uploadCertTitle}
                    onChange={(e) => {
                      setUploadCertTitle(e.target.value);
                      setUploadSuccess(false);
                    }}
                    placeholder="e.g. Yellow Belt Graduation Certificate"
                    className="w-full p-2.5 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold focus:outline-none focus:border-[#0080FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Certificate Document File (PDF / Image) *</label>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadSuccess(false);
                      }
                    }}
                    className="w-full p-2 rounded-xl bg-[#0F1117] border border-white/10 text-gray-300 font-semibold file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0080FF] file:text-white hover:file:bg-[#0066CC] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0F1117] border border-white/5 space-y-1 text-[11px] text-gray-400">
                  <p>Student: <span className="text-white font-bold">{studentDetails?.name}</span></p>
                  <p>Batch: <span className="text-white font-bold">{studentDetails?.batchInfo?.name || "Assigned Batch"}</span></p>
                  <p>Exam Date: <span className="text-amber-400 font-bold">{studentDetails?.batchInfo?.examDate || "N/A"}</span></p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadCertModal(false);
                      setUploadSuccess(false);
                      setUploadSuccessMsg("");
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                  >
                    {uploadSuccess ? "Close" : "Cancel"}
                  </button>

                  {uploadSuccess ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadCertModal(false);
                        setUploadSuccess(false);
                        setUploadSuccessMsg("");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all animate-in fade-in"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Certificate Uploaded Successfully!
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || !uploadFile}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0055B3] text-white font-bold shadow-md shadow-[#0080FF]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        "Upload Certificate"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
