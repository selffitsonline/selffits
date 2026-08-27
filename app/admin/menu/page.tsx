"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/student/../../components/admin/admin-shell";
import { Menu as MenuIcon, Plus, Save, Trash2, CheckCircle2, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { getAdminMenuItemsAction, updateAdminMenuItemsAction } from "@/actions/admin.actions";

export default function AdminMenuManagementPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadMenu() {
      const res = await getAdminMenuItemsAction();
      if (res && res.success && res.menuItems) {
        setMenuItems(res.menuItems);
      }
      setIsLoading(false);
    }
    loadMenu();
  }, []);

  const handleAddItem = () => {
    const newItem = {
      id: `menu_${Date.now()}`,
      label: "New Navigation Item",
      href: "/new-page",
      order: menuItems.length + 1,
      isEnabled: true,
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveMenu = async () => {
    setIsSaving(true);
    setMsg(null);
    const res = await updateAdminMenuItemsAction(menuItems);
    if (res.success) {
      setMsg({ type: "success", text: res.message || "Menu navigation saved successfully!" });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to save menu." });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading website menu navigation...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Website Navigation Menu Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage website header navigation links, display labels, routes, and active visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Menu Item
            </button>

            <button
              type="button"
              onClick={handleSaveMenu}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-lg shadow-[#0080FF]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Navigation Changes"}
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

        <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-12 text-xs font-extrabold uppercase tracking-wider text-gray-400 pb-2 border-b border-white/10 px-3">
            <span className="col-span-1 text-center">Order</span>
            <span className="col-span-4">Display Label</span>
            <span className="col-span-4">Target Link / Route</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-1 text-center">Action</span>
          </div>

          <div className="space-y-3">
            {menuItems.map((item, index) => (
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
                    title="Delete Menu Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
