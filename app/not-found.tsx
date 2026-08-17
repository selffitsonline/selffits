import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B0E] text-white p-6 text-center">
      <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-[#0080FF] mb-2">
        404
      </h1>
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        You kicked into unknown territory!
      </h2>
      <p className="text-gray-400 max-w-md mb-6 text-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 inline-flex items-center gap-2"
      >
        Return to Home Page
      </Link>
    </div>
  );
}
