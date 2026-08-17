"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserCheck, Plus, Trash2, Edit3, Check } from "lucide-react";

export default function AdminCoachesPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [coaches, setCoaches] = useState([
    {
      id: "c-1",
      name: "Sensei Rahul Sharma",
      role: "Head Martial Arts Instructor",
      experience: "14+ Years Experience",
      rank: "4th Dan Black Belt",
      image: "/images/adults_martial_arts.png",
    },
    {
      id: "c-2",
      name: "Sarah Jenkins",
      role: "Lead Fitness & HIIT Coach",
      experience: "9+ Years Experience",
      rank: "Master Trainer",
      image: "/images/ladies_fitness.png",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    experience: "",
    rank: "",
  });

  const handleAddCoach = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoach = {
      id: `c-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      experience: formData.experience,
      rank: formData.rank,
      image: "/images/adults_martial_arts.png",
    };
    setCoaches([...coaches, newCoach]);
    setFormData({ name: "", role: "", experience: "", rank: "" });
    setSuccessMsg("New coach added successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteCoach = (id: string) => {
    setCoaches(coaches.filter((c) => c.id !== id));
    setSuccessMsg("Coach record deleted.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <AdminShell>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Coach Directory Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Add master instructors, update bio credentials, and manage teaching staff profiles.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Add Coach Form */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <UserCheck className="w-5 h-5 text-[#0080FF]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Add New Instructor
            </h2>
          </div>

          <form onSubmit={handleAddCoach} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Coach Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sensei Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Title / Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="Master Kickboxing Coach"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Teaching Experience
                </label>
                <input
                  type="text"
                  placeholder="10+ Years Experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Rank / Accreditation
                </label>
                <input
                  type="text"
                  placeholder="3rd Dan Black Belt"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0080FF] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#0080FF]/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Instructor to Roster
            </button>
          </form>
        </div>

        {/* Coaches Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coaches.map((c) => (
            <div key={c.id} className="bg-[#14161D] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <Image src={c.image} alt={c.name} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-white font-[family-name:var(--font-outfit)]">{c.name}</h3>
                <p className="text-xs font-semibold text-[#E50914]">{c.role}</p>
                <p className="text-[11px] text-gray-400">{c.experience} • {c.rank}</p>
                <button
                  onClick={() => handleDeleteCoach(c.id)}
                  className="mt-2 text-xs text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Coach
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
