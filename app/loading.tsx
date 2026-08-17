import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B0E] text-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#14161D]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm tracking-wider uppercase text-gray-400 font-medium">
        Loading SELFFITS Academy...
      </p>
    </div>
  );
}
