"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { StudentShell } from "@/components/student/student-shell";
import { User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { COUNTRIES, getCountryByNameOrCode, validatePhoneNumberForCountry, Country } from "@/lib/countries";
import { CountryDropdown, DialCodeDropdown } from "@/components/ui/country-phone-selector";

export default function StudentProfilePage() {
  const { data: session } = useSession();

  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    firstName: "Demo",
    lastName: "Student",
    email: session?.user?.email || "student@selffits.com",
    country: "India",
    phone: "+91 9876543210",
    emergencyContact: "+91 9876500000 (Parent)",
  });

  const selectedCountry = getCountryByNameOrCode(profileData.country);

  // Extract national digits
  const getNationalDigits = (fullPhone: string, dialCode: string) => {
    let clean = fullPhone.trim();
    if (clean.startsWith(dialCode)) {
      clean = clean.slice(dialCode.length).trim();
    }
    return clean.replace(/[^\d]/g, "");
  };

  const [nationalPhone, setNationalPhone] = useState(
    getNationalDigits(profileData.phone, selectedCountry.dialCode)
  );

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleCountrySelect = (countryObj: Country) => {
    const newPhone = nationalPhone ? `${countryObj.dialCode} ${nationalPhone}` : `${countryObj.dialCode} `;
    setProfileData({ ...profileData, country: countryObj.name, phone: newPhone });
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = e.target.value.replace(/[^\d]/g, "");
    setNationalPhone(cleanDigits);
    setProfileData({
      ...profileData,
      phone: cleanDigits ? `${selectedCountry.dialCode} ${cleanDigits}` : "",
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const phoneCheck = validatePhoneNumberForCountry(profileData.phone, profileData.country);
    if (!phoneCheck.isValid) {
      setErrorMsg(phoneCheck.message || "Invalid phone number for selected country.");
      return;
    }

    setSavedMsg("Profile information updated successfully!");
    setTimeout(() => setSavedMsg(null), 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setSavedMsg("Password updated successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSavedMsg(null), 4000);
  };

  return (
    <StudentShell>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Profile & Account Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Update your personal contact details, country, emergency contacts, and account security.
          </p>
        </div>

        {savedMsg && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {savedMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#EF4444] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Profile Info Form */}
        <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <User className="w-5 h-5 text-[#E50914]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117]/50 border border-white/5 text-gray-400 text-xs cursor-not-allowed"
              />
            </div>

            {/* Country & Phone Number on the SAME line/row with single unified phone field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Country Selection FIRST (Flag + Name ONLY) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Country
                </label>
                <CountryDropdown
                  value={profileData.country}
                  onChange={handleCountrySelect}
                />
              </div>

              {/* 2. Phone Number Section SECOND (Unified single input container) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center w-full h-11 rounded-xl bg-[#0F1117] border border-white/10 focus-within:border-[#E50914] focus-within:ring-1 focus-within:ring-[#E50914] transition-all">
                  <DialCodeDropdown
                    value={selectedCountry.dialCode}
                    selectedCountry={selectedCountry}
                    onChange={handleCountrySelect}
                    seamless
                  />
                  <div className="w-[1px] h-5 bg-white/15 shrink-0" />
                  <input
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={nationalPhone}
                    onChange={handlePhoneInputChange}
                    className="w-full h-full px-3.5 bg-transparent text-white text-xs focus:outline-none placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Emergency Contact
              </label>
              <input
                type="text"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#E50914] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#E50914]/20 cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Lock className="w-5 h-5 text-[#0080FF]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Security & Password
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0080FF] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#0080FF]/20 cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </StudentShell>
  );
}
