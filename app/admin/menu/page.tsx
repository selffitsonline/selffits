"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Plus, Save, Trash2, CheckCircle2, AlertCircle, LayoutList, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminMenuItemsAction, updateAdminMenuItemsAction } from "@/actions/admin.actions";

export default function AdminMenuManagementPage() {
  const [activeTab, setActiveTab] = useState<"HEADER" | "FOOTER">("HEADER");
  const [headerMenu, setHeaderMenu] = useState<any[]>([]);
  const [footerMenu, setFooterMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadMenus() {
      try {
        const res = await getAdminMenuItemsAction();
        if (res && res.success) {
          setHeaderMenu(res.headerMenu || []);
          setFooterMenu(res.footerMenu || []);
        }
      } catch (err) {
        console.error("Failed to load menus:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenus();
  }, []);

  const currentList = activeTab === "HEADER" ? headerMenu : footerMenu;
  const setCurrentList = (updater: (prev: any[]) => any[]) => {
    if (activeTab === "HEADER") {
      setHeaderMenu(updater);
    } else {
      setFooterMenu(updater);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: `menu_${activeTab.toLowerCase()}_${Date.now()}`,
      label: activeTab === "HEADER" ? "New Header Link" : "New Footer Link",
      href: "/new-route",
      order: currentList.length + 1,
      isEnabled: true,
    };
    setCurrentList((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setCurrentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setCurrentList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAllMenus = async () => {
    setIsSaving(true);
    try {
      const res = await updateAdminMenuItemsAction(headerMenu, footerMenu);
      if (res && res.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err: any) {
      console.error("Save menu error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading website menu configurations...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto relative">
        {/* Header Title & Global Save */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Categorized Navigation Menu Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Categorized management for Header Top Navigation and Footer Quick Links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0080FF]" /> Add {activeTab === "HEADER" ? "Header" : "Footer"} Link
            </button>

            <button
              type="button"
              onClick={handleSaveAllMenus}
              disabled={isSaving}
              className={`relative overflow-hidden px-5 py-2.5 rounded-xl text-white font-extrabold text-xs transition-all duration-300 transform active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
                isSaved
                  ? "bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[#10B981]/25 ring-2 ring-[#10B981]/50 scale-105"
                  : isSaving
                  ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] animate-pulse"
                  : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] hover:from-[#0070E0] hover:to-[#1D4ED8] shadow-[#0080FF]/25"
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
                  <span>Saved Live!</span>
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  <span>Save Navigation Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Selection: HEADER vs FOOTER */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#14161D] border border-white/10 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("HEADER")}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "HEADER"
                ? "bg-[#0080FF] text-white shadow-lg shadow-[#0080FF]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Navigation className="w-4 h-4" />
            📌 Header Menu (Top Navigation Bar)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FOOTER")}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "FOOTER"
                ? "bg-[#0080FF] text-white shadow-lg shadow-[#0080FF]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            📌 Footer Menu (Bottom Page Quick Links)
          </button>
        </div>

        {/* List Table */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300">
              {activeTab === "HEADER" ? "Header Navigation Links" : "Footer Navigation Quick Links"} ({currentList.length} Items)
            </span>
            <span className="text-[11px] text-[#0080FF] font-bold">
              Changes save permanently and update live across public website
            </span>
          </div>

          <div className="grid grid-cols-12 text-xs font-extrabold uppercase tracking-wider text-gray-400 pb-2 border-b border-white/10 px-3">
            <span className="col-span-1 text-center">Order</span>
            <span className="col-span-4">Display Label</span>
            <span className="col-span-4">Target Link / Route</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-1 text-center">Action</span>
          </div>

          {currentList.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              No links in {activeTab === "HEADER" ? "Header" : "Footer"} menu. Click &quot;Add Link&quot; above to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-3 p-3 rounded-xl bg-[#0F1117] border border-white/5 text-xs"
                >
                  <div className="col-span-1 text-center font-bold text-gray-400">
                    #{index + 1}
                  </div>

                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateItem(item.id, "label", e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-medium focus:outline-none focus:border-[#0080FF]"
                    />
                  </div>

                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleUpdateItem(item.id, "href", e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 font-mono text-gray-300 focus:outline-none focus:border-[#0080FF]"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleUpdateItem(item.id, "isEnabled", !item.isEnabled)}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        item.isEnabled
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-white/10 text-gray-400 border border-white/10"
                      }`}
                    >
                      {item.isEnabled ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#EF4444] border border-[#E50914]/30 transition-all cursor-pointer"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
