"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import {
  submitCoachApplicationAction,
  uploadCoachResumeAction,
} from "@/actions/coach-application.actions";
import {
  CountryDropdown,
  DialCodeDropdown,
} from "@/components/ui/country-phone-selector";
import {
  Country,
  DEFAULT_COUNTRY,
  getCountryByNameOrCode,
  validatePhoneNumberForCountry,
} from "@/lib/countries";
import {
  User,
  Sparkles,
  Mail,
  Phone,
  Calendar,
  Globe,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
  Send,
  FileUp,
  Award,
  Briefcase,
  MapPin,
} from "lucide-react";

const YEARS_OF_EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1-2 years",
  "3-5 years",
  "5-8 years",
  "8-10 years",
  "10+ years",
];

export default function BecomeCoachPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Full Name *
  const [fullName, setFullName] = useState("");

  // 2. Date of Birth *
  const [dateOfBirth, setDateOfBirth] = useState("");

  // 3. Gender *
  const [gender, setGender] = useState("");

  // 4. Nationality *
  const [nationalityCountry, setNationalityCountry] = useState<Country>(
    getCountryByNameOrCode("India")
  );

  // 5. Phone / WhatsApp *
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneDigits, setPhoneDigits] = useState("");

  // 6. Email Address *
  const [email, setEmail] = useState("");

  // 7. Current Location / Country *
  const [locationCountry, setLocationCountry] = useState<Country>(
    getCountryByNameOrCode("India")
  );

  // 8. Belt Level *
  const [beltLevel, setBeltLevel] = useState("");

  // 9. Years of Experience *
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  // 10. Instagram Link (Optional - NO "Optional" label display)
  const [instagramUrl, setInstagramUrl] = useState("");

  // 11. Resume Upload * (Mandatory File)
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");

  // Handle Resume File Selection
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (![".pdf", ".doc", ".docx"].includes(ext)) {
        setErrorMsg("Please select a PDF, DOC, or DOCX resume document.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Resume file size must be less than 10MB.");
        return;
      }
      setErrorMsg(null);
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Full Name Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    // 2. Date of Birth Validation
    if (!dateOfBirth.trim()) {
      setErrorMsg("Please select your Date of Birth.");
      return;
    }
    const dobDate = new Date(dateOfBirth);
    const today = new Date();
    if (isNaN(dobDate.getTime()) || dobDate >= today) {
      setErrorMsg("Please select a valid past Date of Birth.");
      return;
    }

    // 3. Gender Validation
    if (!gender.trim()) {
      setErrorMsg("Please select your gender.");
      return;
    }

    // 4. Nationality Validation
    if (!nationalityCountry.name) {
      setErrorMsg("Please select your nationality.");
      return;
    }

    // 5. Phone / WhatsApp Validation
    if (!phoneDigits.trim()) {
      setErrorMsg("Please enter your Phone / WhatsApp number.");
      return;
    }
    const phoneVal = validatePhoneNumberForCountry(phoneDigits, phoneCountry.name);
    if (!phoneVal.isValid) {
      setErrorMsg(phoneVal.message || "Please enter a valid phone number.");
      return;
    }

    // 6. Email Address Validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // 7. Current Location / Country Validation
    if (!locationCountry.name) {
      setErrorMsg("Please select your Current Location / Country.");
      return;
    }

    // 8. Belt Level Validation
    if (!beltLevel.trim()) {
      setErrorMsg("Please type your exact belt/rank level.");
      return;
    }

    // 9. Years of Experience Validation
    if (!yearsOfExperience.trim()) {
      setErrorMsg("Please select your years of coaching experience.");
      return;
    }

    // 10. Instagram Link Validation (Optional, but if typed must be URL format)
    if (instagramUrl.trim()) {
      const trimmedInsta = instagramUrl.trim();
      if (
        !trimmedInsta.includes("instagram.com/") &&
        !trimmedInsta.startsWith("http://") &&
        !trimmedInsta.startsWith("https://")
      ) {
        setErrorMsg("Please enter a valid Instagram URL (e.g. https://instagram.com/username).");
        return;
      }
    }

    // 11. Resume Upload Mandatory Validation
    if (!resumeFile) {
      setErrorMsg("Resume upload is mandatory. Please attach your resume file.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload Resume File via API Route (eliminates React Flight RPC #441)
      const resumeFormData = new FormData();
      resumeFormData.append("file", resumeFile);

      const uploadResponse = await fetch("/api/coach-application/upload-resume", {
        method: "POST",
        body: resumeFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success || !uploadData.url) {
        setErrorMsg(uploadData.error || "Failed to upload resume file. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Submit Full Application to Database via API Route
      const submitResponse = await fetch("/api/coach-application/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          gender: gender.trim(),
          nationality: nationalityCountry.name.trim(),
          phone: phoneDigits.trim(),
          countryCallingCode: phoneCountry.dialCode.trim(),
          email: email.trim(),
          location: locationCountry.name.trim(),
          beltLevel: beltLevel.trim(),
          yearsOfExperience: yearsOfExperience.trim(),
          instagramUrl: instagramUrl.trim() || undefined,
          resumeUrl: uploadData.url,
        }),
      });

      const submitData = await submitResponse.json();

      if (submitResponse.ok && submitData.success) {
        // Step 3: Redirect to Thank You page ONLY after successful DB submission
        router.push("/become-coach/success");
      } else {
        setErrorMsg(submitData.error || "Application submission failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err?.message || "An unexpected error occurred during submission. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        {/* Page Hero Header */}
        <section className="max-w-3xl mx-auto px-4 text-center space-y-4 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold border border-[#E50914]/30 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Coach Recruitment Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white">
            BECOME A SELFFITS COACH
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join SELFFITS as an elite fitness or martial arts coach. Teach students worldwide through live interactive sessions.
          </p>
        </section>

        {/* Registration Form Container */}
        <section className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/40 text-[#EF4444] text-sm text-center flex items-center justify-center gap-2 font-semibold animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-10 rounded-3xl space-y-8 shadow-2xl">
              
              {/* Form Title Banner */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] font-bold shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight">
                    Coach Registration Form
                  </h2>
                  <p className="text-xs text-gray-400">
                    Complete all mandatory fields (<span className="text-[#E50914]">*</span>) to submit your application.
                  </p>
                </div>
              </div>

              {/* 11 Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Full Name * */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    1. Full Name <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm transition-all"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Date of Birth * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    2. Date of Birth <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min="1940-01-01"
                      max={new Date().toISOString().split("T")[0]}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm transition-all"
                    />
                    <Calendar className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Gender * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    3. Gender <span className="text-[#E50914]">*</span>
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white focus:outline-none focus:border-[#E50914] text-sm cursor-pointer transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* 4. Nationality * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    4. Nationality <span className="text-[#E50914]">*</span>
                  </label>
                  <CountryDropdown
                    value={nationalityCountry.name}
                    onChange={(country) => setNationalityCountry(country)}
                  />
                </div>

                {/* 5. Phone / WhatsApp * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    5. Phone / WhatsApp <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="flex h-11 rounded-xl bg-[#0F1117] border border-white/10 focus-within:border-[#E50914] transition-all overflow-hidden">
                    <DialCodeDropdown
                      selectedCountry={phoneCountry}
                      value={phoneCountry.dialCode}
                      onChange={(c) => setPhoneCountry(c)}
                      seamless
                    />
                    <input
                      type="tel"
                      required
                      placeholder="98470 12345"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value)}
                      className="w-full h-full px-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* 6. Email Address * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    6. Email Address <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="coach@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm transition-all"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 7. Current Location / Country * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    7. Current Location / Country <span className="text-[#E50914]">*</span>
                  </label>
                  <CountryDropdown
                    value={locationCountry.name}
                    onChange={(country) => setLocationCountry(country)}
                  />
                </div>

                {/* 8. Belt Level * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    8. Belt Level <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Type your exact belt level (e.g. 4th Dan Black Belt)"
                      value={beltLevel}
                      onChange={(e) => setBeltLevel(e.target.value)}
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm transition-all"
                    />
                    <Award className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 9. Years of Experience * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    9. Years of Experience <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-[#0F1117] border border-white/10 text-white focus:outline-none focus:border-[#E50914] text-sm cursor-pointer transition-all"
                    >
                      <option value="">Select Experience</option>
                      {YEARS_OF_EXPERIENCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <Briefcase className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 10. Instagram Link (Optional - NO "Optional" label) */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    10. Instagram Link
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://instagram.com/yourhandle"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full h-11 px-4 pl-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm transition-all"
                    />
                    <Globe className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 11. Resume Upload * (Mandatory) */}
                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    11. Resume Upload <span className="text-[#E50914]">*</span>
                  </label>
                  
                  <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-[#E50914] rounded-xl cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.05] text-center space-y-2">
                      <FileUp className="w-8 h-8 text-[#E50914] animate-pulse" />
                      <div>
                        <span className="text-sm font-extrabold text-white block">
                          Click to Select Resume File
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          Supported formats: PDF, DOC, DOCX (Max 10 MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                    </label>

                    {resumeFileName ? (
                      <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <Check className="w-4 h-4 shrink-0" />
                          <span className="truncate">Attached: {resumeFileName}</span>
                        </div>
                        <span className="text-[10px] bg-[#10B981]/20 px-2 py-0.5 rounded-md uppercase font-extrabold">
                          Ready
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 text-center italic">
                        No resume attached yet. Resume upload is mandatory for coach applications.
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-black text-base uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Submitting Application..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Coach Application
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center pt-1">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>All submitted applications are stored securely in SELFFITS Coach Recruitment DB</span>
              </div>

            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
