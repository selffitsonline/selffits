import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#07080A] border-t-[0.5px] border-white/10 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Column 1: Brand Info */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-updated.jpg"
                alt="SELFFITS Logo"
                width={160}
                height={55}
                className="h-10 w-auto object-contain rounded"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              SELFFITS is a Global Online Fitness & Martial Arts Academy empowering kids, adults, and women worldwide through real-time interactive live coaching on Zoom Classes.
            </p>
            <div className="flex items-center gap-4 text-gray-400 pt-2">
              <span className="text-xs font-semibold text-gray-400">Join our community</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-[family-name:var(--font-outfit)]">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">All Programs</Link>
              </li>
              <li>
                <Link href="/coaches" className="hover:text-white transition-colors">Master Coaches</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Academy</Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-white transition-colors">Success Stories</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions (FAQ)</Link>
              </li>
              <li>
                <Link href="/become-coach" className="hover:text-[#E50914] font-bold text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                  Become a SELFFITS Coach
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Academy Programs */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-[family-name:var(--font-outfit)]">
              Programs
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/programs/kids-martial-arts" className="hover:text-white transition-colors">Kids Martial Arts</Link>
              </li>
              <li>
                <Link href="/programs/adults-karate" className="hover:text-white transition-colors">Adults Karate & Self Defence</Link>
              </li>
              <li>
                <Link href="/programs/ladies-fitness" className="hover:text-white transition-colors">Ladies Only Fitness</Link>
              </li>
              <li>
                <Link href="/programs/weight-loss" className="hover:text-white transition-colors">Weight Loss & HIIT</Link>
              </li>
              <li>
                <Link href="/programs/belt-certifications" className="hover:text-white transition-colors">Belt Certifications</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-[family-name:var(--font-outfit)]">
              Contact
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E50914] shrink-0" />
                <a href="mailto:support@selffits.com" className="hover:text-white transition-colors">
                  support@selffits.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E50914] shrink-0" />
                <a href="tel:+919847012345" className="hover:text-white transition-colors">
                  +91 98470 12345
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                <span>Global Online Academy (Headquartered in India)</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Razorpay Secure PCI-DSS Multi-Currency Payments</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-[0.5px] border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-center sm:text-left">
          <p>© {new Date().getFullYear()} SELFFITS Academy. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
