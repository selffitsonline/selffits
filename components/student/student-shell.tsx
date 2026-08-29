"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Film,
  Award,
  BarChart3,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Globe,
} from "lucide-react";

interface StudentShellProps {
  children: React.ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Programs", href: "/dashboard/programs", icon: BookOpen },
    { name: "My Certificates", href: "/dashboard/certificates", icon: Award },
    { name: "My Progress", href: "/dashboard/progress", icon: BarChart3 },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Profile & Settings", href: "/dashboard/profile", icon: User },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const userDisplayName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "student@selffits.com";

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex selection:bg-[#0080FF] selection:text-white">
      {/* Desktop Sidebar Navigation (Fixed Full Viewport Height Architecture) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#14161D] border-r border-white/10 shrink-0 fixed inset-y-0 left-0 z-40 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center group">
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

        {/* Student Profile Quick Card */}
        <div className="p-4 m-4 rounded-xl bg-[#0F1117] border border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E50914] to-[#0080FF] flex items-center justify-center font-bold text-white text-sm shrink-0">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{userDisplayName}</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0080FF]">
              <ShieldCheck className="w-3 h-3 text-[#0080FF]" />
              Student Account
            </span>
          </div>
        </div>

        {/* Nav Links + Integrated Logout Button */}
        <nav className="px-4 py-2 space-y-1 flex-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
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

          {/* Unified Divider Line & Integrated Logout Button */}
          <div className="pt-3 pb-4">
            <div className="border-t border-white/10 mb-3" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-gray-300 hover:text-[#EF4444] bg-[#0F1117] hover:bg-[#E50914]/15 border border-white/10 hover:border-[#E50914]/30 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-[#E50914]" />
                <span>Logout Account</span>
              </div>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area (Offset by md:pl-64 for fixed sidebar) */}
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

            <h1 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] hidden sm:block">
              Student Dashboard
            </h1>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-[#0080FF]" />
              <span>Main Website</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-[#14161D] border border-white/15 text-gray-300 hover:text-white hover:border-white/30 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5 text-[#0080FF]" />
                <span className="text-xs font-bold text-white hidden sm:inline">Notifications</span>
                <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#14161D] border border-white/15 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <h4 className="text-xs font-bold text-white">Notifications</h4>
                    <span className="text-[10px] text-[#0080FF] font-semibold">2 New</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-[#0F1117] text-xs space-y-1">
                      <p className="font-semibold text-white">Live Class Starting Soon</p>
                      <p className="text-[11px] text-gray-400">Adults Martial Arts batch starts in 15 mins.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0F1117] text-xs space-y-1">
                      <p className="font-semibold text-white">New Certificate Issued</p>
                      <p className="text-[11px] text-gray-400">Your Yellow Belt Certificate is ready to download.</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-center text-xs text-[#E50914] font-semibold mt-3 hover:underline"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#14161D] border-b border-white/10 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto shadow-2xl">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
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
              Logout
            </button>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
