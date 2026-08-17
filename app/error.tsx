"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B0E] text-white p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mb-4 text-2xl font-bold">
        !
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-gray-400 max-w-md mb-6 text-sm">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
