"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  User,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";

// Custom Inline SVG Icons for Social Media Platforms (Guarantees zero build errors)
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when full-screen mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Coaches", href: "/coaches" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "WhatsApp Support",
      href: "https://wa.me/919847012345",
      icon: WhatsAppIcon,
      color: "hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/30",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/selffits.online",
      icon: InstagramIcon,
      color: "hover:text-[#E1306C] hover:bg-[#E1306C]/10 hover:border-[#E1306C]/30",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@selffits",
      icon: YoutubeIcon,
      color: "hover:text-[#FF0000] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30",
    },
    {
      name: "Facebook",
      href: "https://facebook.com/selffits",
      icon: FacebookIcon,
      color: "hover:text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30",
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b py-2.5 sm:py-3 ${
          isScrolled
            ? "bg-[#0A0B0E]/90 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50"
            : "bg-[#0A0B0E]/40 backdrop-blur-md border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Standalone Logo Image */}
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src="/logo.jpg"
              alt="SELFFITS Logo"
              width={240}
              height={85}
              priority
              className="h-9 sm:h-11 md:h-12 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-[#E50914] bg-[#E50914]/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Student Login
            </Link>
            <Link
              href="/programs"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#E50914] to-[#FF1E27] hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/25 hover:translate-y-[-1px]"
            >
              Join Academy
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center bg-white/5 border border-white/10 active:scale-95"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Premium Full-Screen Mobile Navigation Overlay (Right Slide-In) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[100] bg-[#0A0B0E] backdrop-blur-3xl flex flex-col justify-between overflow-y-auto px-5 py-5 min-h-screen"
          >
            {/* Ambient Background Lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E50914]/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0080FF]/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Drawer Top Header: Single Clean Logo + Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/logo.jpg"
                    alt="SELFFITS Logo"
                    width={240}
                    height={85}
                    className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-md"
                  />
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all shadow-md active:scale-90"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links with Micro-Animations */}
              <nav className="space-y-1.5 pt-1">
                {navLinks.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * idx, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-bold transition-all border ${
                          isActive
                            ? "text-white bg-gradient-to-r from-[#E50914]/30 to-[#E50914]/10 border-[#E50914]/60 shadow-md shadow-[#E50914]/15"
                            : "text-gray-300 hover:text-white bg-white/[0.03] hover:bg-white/10 border-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {isActive && <Sparkles className="w-4 h-4 text-[#E50914]" />}
                          {link.name}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-[#E50914] translate-x-1" : "opacity-40"}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions, Social Media Icons & Direct Support */}
            <div className="relative z-10 pt-6 mt-6 space-y-6">
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 px-3 rounded-2xl text-center font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98"
                >
                  <User className="w-4 h-4 text-[#38BDF8]" />
                  Student Login
                </Link>

                <Link
                  href="/programs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 px-3 rounded-2xl text-center font-black text-sm text-white bg-gradient-to-r from-[#E50914] to-[#FF1E27] hover:opacity-95 shadow-xl shadow-[#E50914]/35 flex items-center justify-center gap-1.5 active:scale-98"
                >
                  Join Academy
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Social Media Links - Airy & Borderless */}
              <div className="space-y-3 pt-1 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  Connect With Us
                </p>
                <div className="flex items-center justify-center gap-4">
                  {socialLinks.map((soc) => {
                    const IconComponent = soc.icon;
                    return (
                      <a
                        key={soc.name}
                        href={soc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-2xl bg-white/[0.06] text-gray-200 transition-all shadow-md ${soc.color} active:scale-90`}
                        aria-label={soc.name}
                        title={soc.name}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Clean Support Contact Info - No Boxes, Minimalist */}
              <div className="pt-1 text-center pb-2">
                <div className="flex items-center justify-center gap-5 text-xs font-semibold text-gray-400">
                  <a href="tel:+919847012345" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#E50914]" />
                    +91 98470 12345
                  </a>
                  <span className="text-white/20">•</span>
                  <a href="mailto:support@selffits.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                    support@selffits.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
