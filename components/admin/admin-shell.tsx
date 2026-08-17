"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Link2,
  Users,
  BookOpen,
  CreditCard,
  Award,
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  PlusCircle,
  UserCheck,
  UserPlus,
  Layers,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNavItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Daily Live Links", href: "/admin/live-links", icon: Link2, badge: "CRITICAL" },
    { name: "Student Directory", href: "/admin/students", icon: Users },
    { name: "Program Catalog", href: "/admin/programs", icon: BookOpen },
    { name: "Membership Plans", href: "/admin/memberships", icon: Layers },
    { name: "Enrollments", href: "/admin/enrollments", icon: UserPlus },
    { name: "Orders & Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Certificates", href: "/admin/certificates", icon: Award },
    { name: "Coach Directory", href: "/admin/coaches", icon: UserCheck },
    { name: "Website CMS", href: "/admin/content", icon: Globe },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const adminName = session?.user?.name || "System Admin";
  const adminRole = session?.user?.role || "ADMIN";

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col md:flex-row">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#14161D] border-r border-white/10 shrink-0 sticky top-0 h-screen z-40">
        {/* Header with Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center group">
            <Image
              src="/logo.jpg"
              alt="SELFFITS Logo"
              width={200}
              height={70}
              priority
              className="h-12 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Admin Badge */}
        <div className="p-4 m-4 rounded-xl bg-[#0F1117] border border-[#0080FF]/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0080FF] to-[#2563EB] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{adminName}</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0080FF] uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 text-[#0080FF]" />
              {adminRole}
            </span>
          </div>
        </div>

        {/* Admin Nav */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#0080FF] text-white shadow-lg shadow-[#0080FF]/25 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E50914]/20 text-[#E50914] text-[9px] font-extrabold border border-[#E50914]/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#0A0B0E]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0080FF]/15 text-[#0080FF] text-[10px] font-extrabold uppercase tracking-wider border border-[#0080FF]/30">
                Academy Control Panel
              </span>
              <h1 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] hidden sm:block">
                Admin Management System
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/live-links"
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-md shadow-[#E50914]/20 flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Update Today&apos;s Link</span>
              <span className="sm:hidden">Live Link</span>
            </Link>

            <div className="flex items-center gap-2 p-1.5 pr-3 sm:pr-4 rounded-full bg-[#14161D] border border-white/10 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0080FF] flex items-center justify-center font-bold text-white text-xs shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white hidden sm:inline">{adminName}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#14161D] border-b border-white/10 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto shadow-2xl">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${
                  pathname === item.href ? "bg-[#0080FF] text-white" : "text-gray-300 hover:bg-white/5"
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

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
