"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, User } from "lucide-react";

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Membership", href: "/membership" },
    { name: "Coaches", href: "/coaches" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-[#0A0B0E]/90 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50 py-3"
          : "bg-transparent border-transparent py-4"
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
            className="h-10 sm:h-14 md:h-16 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
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
            Login
          </Link>
          <Link
            href="/membership"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#E50914] to-[#FF1E27] hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/25 hover:translate-y-[-1px]"
          >
            Join Academy
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#14161D] border-b border-white/10 max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-2 max-w-full">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    pathname === link.href
                      ? "text-[#E50914] bg-[#E50914]/10 font-bold"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl text-center font-semibold text-white border border-white/15 hover:bg-white/5"
                >
                  Student Login
                </Link>
                <Link
                  href="/membership"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl text-center font-bold text-white bg-gradient-to-r from-[#E50914] to-[#FF1E27]"
                >
                  Join Academy Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
