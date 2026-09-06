"use client";

import React, { useState } from "react";
import { X, Check, Award } from "lucide-react";

interface EditCoachDisciplinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: {
    id: string;
    fullName: string;
    rawDisciplines?: string[];
  } | null;
  onConfirm: (coachId: string, disciplines: string[]) => Promise<void>;
}

const SPECIALIZATION_OPTIONS = [
  "Karate",
  "Kung Fu",
  "Taekwondo",
  "Kickboxing",
  "Yoga",
  "Fitness / Functional Training",
];

export function EditCoachDisciplinesModal({
  isOpen,
  onClose,
  coach,
  onConfirm,
}: EditCoachDisciplinesModalProps) {
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (coach) {
      setSelectedDisciplines(coach.rawDisciplines || []);
    }
  }, [coach]);

  if (!isOpen || !coach) return null;

  const toggleDiscipline = (disc: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(disc) ? prev.filter((d) => d !== disc) : [...prev, disc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(coach.id, selectedDisciplines);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/30 text-[#0080FF] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Edit Coaching Disciplines
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Coach: <span className="text-white font-semibold">{coach.fullName}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-300">
            Select one or multiple teaching disciplines for this coach:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SPECIALIZATION_OPTIONS.map((disc) => {
              const isSelected = selectedDisciplines.includes(disc);
              return (
                <button
                  key={disc}
                  type="button"
                  onClick={() => toggleDiscipline(disc)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#0080FF]/20 border-[#0080FF] text-white shadow-md shadow-[#0080FF]/15"
                      : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span>{disc}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#0080FF] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white text-xs font-extrabold transition-all shadow-lg shadow-[#0080FF]/20"
            >
              {loading ? "Saving..." : "Save Disciplines"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
