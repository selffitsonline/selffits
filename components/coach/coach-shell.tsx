"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Video,
  Users,
  Calendar,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Globe,
  Award,
} from "lucide-react";

interface CoachShellProps {
  children: React.ReactNode;
  coachName?: string;
  highestRank?: string;
}

export function CoachShell({ children, coachName, highestRank }: CoachShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Coach Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
    { name: "Assigned Batches", href: "/coach/dashboard#batches", icon: Layers },
    { name: "Live Class Hub", href: "/coach/dashboard#upcoming-class", icon: Video },
    { name: "Enrolled Students", href: "/coach/dashboard#students", icon: Users },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const displayName = coachName || session?.user?.name || "Coach";
  const displayRank = highestRank || "Certified Instructor";

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex selection:bg-[#E50914] selection:text-white">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-[#14161D] border-r border-white/10 shrink-0 fixed inset-y-0 left-0 z-40 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <Link href="/coach/dashboard" className="flex items-center group">
            <Image
              src="/logo-updated.jpg"
              alt="SELFFITS Logo"
              width={200}
              height={70}
              priority
              className="h-12 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Coach Profile Quick Card */}
        <div className="p-4 m-4 rounded-xl bg-[#0F1117] border border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E50914] to-[#F59E0B] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-lg shadow-[#E50914]/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#10B981]">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              Master Coach
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-2 space-y-1 flex-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}

          {/* Integrated Logout Button */}
          <div className="pt-3 pb-4">
            <div className="border-t border-white/10 mb-3" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-gray-300 hover:text-[#EF4444] bg-[#0F1117] hover:bg-[#E50914]/15 border border-white/10 hover:border-[#E50914]/30 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-[#E50914]" />
                <span>Logout Coach Portal</span>
              </div>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#0A0B0E]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E50914]/20 text-[#E50914] text-[10px] font-black uppercase tracking-wider border border-[#E50914]/30 hidden sm:inline-flex items-center gap-1">
                <Award className="w-3 h-3" /> Coach Portal
              </span>
              <h1 className="text-base sm:text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                Instructor Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-[#0080FF]" />
              <span className="hidden sm:inline">Main Website</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#14161D] border-b border-white/10 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto shadow-2xl">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === item.href
                    ? "bg-[#E50914] text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#EF4444]"
            >
              <LogOut className="w-5 h-5" />
              Logout Coach Portal
            </button>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
