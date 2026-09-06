"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  Image as ImageIcon,
  BookOpen,
  Users,
  CreditCard,
  UserCheck,
  FileText,
  Video,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
  Sparkles,
  Layers,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminName = session?.user?.name || "Administrator";
  const adminEmail = session?.user?.email || "admin@selffits.com";
  const roleBadge = "ADMIN";

  const navigationItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Menu Management", href: "/admin/menu", icon: MenuIcon },
    { label: "Homepage Management", href: "/admin/banner", icon: ImageIcon },
    { label: "Programs & Pricing", href: "/admin/programs", icon: BookOpen },
    { label: "Registered Students", href: "/admin/students", icon: Users },
    { label: "Batch Management", href: "/admin/batches", icon: Layers },
    { label: "Payments & Revenue", href: "/admin/payments", icon: CreditCard },
    { label: "Active Coaches", href: "/admin/coaches", icon: UserCheck },
    { label: "Coach Leads & Resumes", href: "/admin/coach-applications", icon: FileText },
    { label: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex selection:bg-[#0080FF] selection:text-white">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#14161D] border-r border-white/10 p-6 justify-between fixed inset-y-0 left-0 z-40">
        <div className="space-y-6">
          {/* Admin Header / Logo */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-updated.jpg"
                alt="SELFFITS Logo"
                width={120}
                height={40}
                className="h-9 w-auto object-contain rounded-md"
              />
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#0080FF]/20 text-[#0080FF] border border-[#0080FF]/30">
              {roleBadge}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white shadow-lg shadow-[#0080FF]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Profile & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1117] border border-white/10">
            <div className="truncate">
              <p className="text-xs font-extrabold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-gray-400 truncate">{adminEmail}</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full py-2.5 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#EF4444] border border-[#E50914]/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Admin Header Bar */}
        <header className="h-16 bg-[#14161D]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-extrabold text-white font-[family-name:var(--font-outfit)] hidden sm:block">
              SELFFITS Academy Control Panel
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0080FF]" /> View Live Website
            </Link>

            <div className="w-8 h-8 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/40 flex items-center justify-center text-[#0080FF] font-black text-xs">
              {adminName[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
            <div className="w-72 bg-[#14161D] p-6 space-y-6 flex flex-col justify-between border-r border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="font-extrabold text-white text-sm">Admin Navigation</span>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white text-xs font-bold"
                  >
                    Close ✕
                  </button>
                </div>
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-[#0080FF] text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full py-2.5 rounded-xl bg-[#E50914]/20 text-[#EF4444] text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
