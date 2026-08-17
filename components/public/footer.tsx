import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#07080A] border-t border-white/10 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Column 1: Brand Info */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.jpg"
                alt="SELFFITS Logo"
                width={160}
                height={55}
                className="h-10 w-auto object-contain rounded"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              SELFFITS is a Global Online Fitness & Martial Arts Academy empowering kids, adults, and women worldwide through real-time interactive live coaching on Google Meet & Zoom.
            </p>
            <div className="flex items-center gap-4 text-gray-400 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                Live Virtual Classroom Operating 24/7 Worldwide
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 font-[family-name:var(--font-outfit)]">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Academy</Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">All Programs</Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-white transition-colors">Membership & Pricing</Link>
              </li>
              <li>
                <Link href="/coaches" className="hover:text-white transition-colors">Master Coaches</Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-white transition-colors">Success Stories</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Program Pathways */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 font-[family-name:var(--font-outfit)]">
              Training Programs
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/programs?category=KIDS" className="hover:text-white transition-colors">Kids Martial Arts (8-20)</Link>
              </li>
              <li>
                <Link href="/programs?category=ADULTS" className="hover:text-white transition-colors">Adults Martial Arts (21+)</Link>
              </li>
              <li>
                <Link href="/programs?category=LADIES_ONLY" className="hover:text-white transition-colors">Ladies Only Programs</Link>
              </li>
              <li>
                <Link href="/programs?category=WEIGHT_LOSS" className="hover:text-white transition-colors">Weight Loss Challenge</Link>
              </li>
              <li>
                <Link href="/programs?category=HIIT" className="hover:text-white transition-colors">HIIT Fitness Training</Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-white transition-colors">Official Belt Certification</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Academy Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 font-[family-name:var(--font-outfit)]">
              Global Support
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                <span className="break-all">support@selffits.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#0080FF] shrink-0 mt-0.5" />
                <span>WhatsApp: +91 98765 43210</span>
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
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-center sm:text-left">
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
