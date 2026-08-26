"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { submitCoachApplicationAction } from "@/actions/coach-application.actions";
import {
  User,
  Award,
  Briefcase,
  Sparkles,
  Video,
  Calendar,
  FileText,
  Globe,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
  Send,
  FileUp,
} from "lucide-react";

export default function BecomeCoachPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Personal Information
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profilePhotoName, setProfilePhotoName] = useState("");

  // 2. Coaching Discipline
  const disciplineOptions = [
    "Karate",
    "Kung Fu",
    "Taekwondo",
    "Kickboxing",
    "Yoga",
    "Fitness / Functional Training",
    "Other",
  ];
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [otherDisciplineText, setOtherDisciplineText] = useState("");

  // 3. Qualifications & Certifications
  const [highestRank, setHighestRank] = useState("");
  const [certificationName, setCertificationName] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [yearObtained, setYearObtained] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificateUploadUrl, setCertificateUploadUrl] = useState("");

  // 4. Coaching Experience
  const [totalExperience, setTotalExperience] = useState("");
  const [previousAcademy, setPreviousAcademy] = useState("");
  const [coachingBio, setCoachingBio] = useState("");
  const ageGroupOptions = ["Kids", "Teens", "Adults", "Seniors"];
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);

  // 5. Specializations
  const specializationOptions = [
    "Martial Arts",
    "Self Defence",
    "Fitness Training",
    "Weight Loss",
    "Strength & Conditioning",
    "Flexibility",
    "Yoga & Meditation",
    "Kids Training",
    "Competition Preparation",
    "Online Coaching",
  ];
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  // 6. Online Coaching
  const [hasOnlineExperience, setHasOnlineExperience] = useState("Yes");
  const [preferredPlatform, setPreferredPlatform] = useState("Zoom");
  const [isLiveClassAvailable, setIsLiveClassAvailable] = useState("Yes");

  // 7. Availability Grid (Days x Time Slots)
  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    Monday: ["Morning", "Evening"],
    Tuesday: ["Morning", "Evening"],
    Wednesday: ["Morning", "Evening"],
    Thursday: ["Morning", "Evening"],
    Friday: ["Morning", "Evening"],
    Saturday: ["Morning"],
    Sunday: [],
  });

  const toggleAvailabilitySlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const current = prev[day] || [];
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, [day]: updated };
    });
  };

  // 8. Coach Introduction
  const [aboutSelf, setAboutSelf] = useState("");
  const [whyJoinSelffits, setWhyJoinSelffits] = useState("");
  const [whatMakesGoodCoach, setWhatMakesGoodCoach] = useState("");

  // 9. Portfolio & Social Media
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [trainingVideoUrl, setTrainingVideoUrl] = useState("");

  // 10. Documents Upload States
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");

  const [qualificationCertsUrl, setQualificationCertsUrl] = useState("");
  const [qualificationFileName, setQualificationFileName] = useState("");

  const [licenseUrl, setLicenseUrl] = useState("");
  const [licenseFileName, setLicenseFileName] = useState("");

  const [idPassportUrl, setIdPassportUrl] = useState("");
  const [idPassportFileName, setIdPassportFileName] = useState("");

  // 11. Declaration
  const [agreedDeclaration, setAgreedDeclaration] = useState(false);

  // Toggle helper for arrays
  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Local File Change Handlers (Shows Chosen Filename instantly)
  const handleFileSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (val: string) => void,
    setFileName: (name: string) => void,
    prefix: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setUrl(`${prefix}: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // ONLY Name, Email, and Phone Number are MANDATORY
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (!phone.trim() || digitsOnly.length < 7 || digitsOnly.length > 15) {
      setErrorMsg("Please enter a valid Phone / WhatsApp number (7 to 15 digits).");
      return;
    }
    if (dateOfBirth) {
      const dobDate = new Date(dateOfBirth);
      const today = new Date();
      if (isNaN(dobDate.getTime()) || dobDate >= today) {
        setErrorMsg("Please select a valid past Date of Birth.");
        return;
      }
    }

    setIsSubmitting(true);

    const finalDisciplines = selectedDisciplines.map((d) =>
      d === "Other" && otherDisciplineText.trim() ? `Other: ${otherDisciplineText.trim()}` : d
    );

    const res = await submitCoachApplicationAction({
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      nationality,
      location,
      profilePhotoUrl,

      disciplines: finalDisciplines,

      highestRank,
      certificationName,
      issuingOrganization,
      yearObtained,
      certificateNumber,
      certificateUploadUrl,

      totalExperience,
      previousAcademy,
      coachingBio,
      targetAgeGroups: selectedAgeGroups,

      specializations: selectedSpecializations,

      hasOnlineExperience,
      preferredPlatform,
      isLiveClassAvailable,

      availability,

      aboutSelf,
      whyJoinSelffits,
      whatMakesGoodCoach,

      instagramUrl,
      facebookUrl,
      youtubeUrl,
      websiteUrl,
      trainingVideoUrl,

      resumeUrl,
      qualificationCertsUrl,
      licenseUrl,
      idPassportUrl,

      agreedDeclaration: true,
    });

    if (res.success) {
      router.push("/become-coach/success");
    } else {
      setErrorMsg(res.error || "Application submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        {/* Page Hero Header */}
        <section className="max-w-4xl mx-auto px-4 text-center space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold border border-[#E50914]/30 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Coach Recruitment Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight">
            BECOME A SELFFITS COACH
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join SELFFITS as a professional fitness or martial arts coach and teach students from around the world through live interactive virtual classes.
          </p>
        </section>

        {/* Form Container */}
        <section className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-10">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/40 text-[#EF4444] text-sm text-center flex items-center justify-center gap-2 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ----------------------------------------
                1. Personal Information
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    1. Personal Information
                  </h2>
                  <p className="text-xs text-gray-400">Basic identification and contact details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Full Name <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    min="1940-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white focus:outline-none focus:border-[#E50914] text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indian, American, Japanese"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Phone / WhatsApp <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98470 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Email Address <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="coach@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Current Location / Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kerala, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                {/* Profile Photo Upload Box */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Profile Photo Upload
                  </label>
                  <div className="p-3 rounded-xl bg-[#0F1117] border border-white/10 space-y-2">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer transition-all border border-white/15 w-max">
                      <FileUp className="w-4 h-4 text-[#E50914]" />
                      <span>Choose Photo File...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelection(e, setProfilePhotoUrl, setProfilePhotoName, "Photo")}
                        className="hidden"
                      />
                    </label>
                    {profilePhotoName ? (
                      <p className="text-xs text-[#10B981] font-bold flex items-center gap-1 truncate">
                        <Check className="w-3.5 h-3.5 shrink-0" /> Chosen: {profilePhotoName}
                      </p>
                    ) : (
                      <input
                        type="text"
                        placeholder="Or paste image URL (https://...)"
                        value={profilePhotoUrl}
                        onChange={(e) => setProfilePhotoUrl(e.target.value)}
                        className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                2. Coaching Discipline
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    2. Coaching Discipline
                  </h2>
                  <p className="text-xs text-gray-400">Select all disciplines you are qualified to teach</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {disciplineOptions.map((discipline) => {
                  const isSelected = selectedDisciplines.includes(discipline);
                  return (
                    <button
                      key={discipline}
                      type="button"
                      onClick={() => toggleArrayItem(selectedDisciplines, discipline, setSelectedDisciplines)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#0080FF]/20 border-[#0080FF] text-white shadow-lg shadow-[#0080FF]/15"
                          : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span>{discipline}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#0080FF]" />}
                    </button>
                  );
                })}
              </div>

              {selectedDisciplines.includes("Other") && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Specify Other Discipline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Judo, Krav Maga, Pilates"
                    value={otherDisciplineText}
                    onChange={(e) => setOtherDisciplineText(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] text-sm"
                  />
                </div>
              )}
            </div>

            {/* ----------------------------------------
                3. Qualifications & Certifications
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    3. Qualifications & Certifications
                  </h2>
                  <p className="text-xs text-gray-400">Details of rank degree and accreditation certificates</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Highest Rank / Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4th Dan Black Belt / Master Trainer"
                    value={highestRank}
                    onChange={(e) => setHighestRank(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Certified Martial Arts Instructor"
                    value={certificationName}
                    onChange={(e) => setCertificationName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. World Taekwondo Federation / ACE"
                    value={issuingOrganization}
                    onChange={(e) => setIssuingOrganization(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Year Obtained
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2018"
                    value={yearObtained}
                    onChange={(e) => setYearObtained(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CERT-987654"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Upload Certificates (File or Drive URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={certificateUploadUrl}
                    onChange={(e) => setCertificateUploadUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                4. Coaching Experience
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    4. Coaching Experience
                  </h2>
                  <p className="text-xs text-gray-400">Previous academy teaching experience and target age groups</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Total Coaching Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Years"
                    value={totalExperience}
                    onChange={(e) => setTotalExperience(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Previous Academy / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. National Dojang Academy"
                    value={previousAcademy}
                    onChange={(e) => setPreviousAcademy(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Describe Your Coaching Experience
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a brief summary of your teaching history and student success stories..."
                  value={coachingBio}
                  onChange={(e) => setCoachingBio(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Age Groups You Can Coach:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ageGroupOptions.map((ageGroup) => {
                    const isSelected = selectedAgeGroups.includes(ageGroup);
                    return (
                      <button
                        key={ageGroup}
                        type="button"
                        onClick={() => toggleArrayItem(selectedAgeGroups, ageGroup, setSelectedAgeGroups)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-[#F59E0B]/20 border-[#F59E0B] text-white"
                            : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {ageGroup}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                5. Specializations
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    5. Specializations
                  </h2>
                  <p className="text-xs text-gray-400">Select all applicable specializations</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {specializationOptions.map((spec) => {
                  const isSelected = selectedSpecializations.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleArrayItem(selectedSpecializations, spec, setSelectedSpecializations)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-[#E50914]/25"
                          : "bg-[#0F1117] border-white/10 text-gray-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------
                6. Online Coaching
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    6. Online Coaching
                  </h2>
                  <p className="text-xs text-gray-400">Virtual class experience and platform readiness</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Previous online coaching experience?
                  </label>
                  <div className="flex items-center gap-2">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHasOnlineExperience(opt)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          hasOnlineExperience === opt
                            ? "bg-[#0080FF] border-[#0080FF] text-white"
                            : "bg-[#0F1117] border-white/10 text-gray-400"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Preferred Platform:
                  </label>
                  <div className="flex items-center gap-2">
                    {["Zoom", "Other"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPreferredPlatform(opt)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          preferredPlatform === opt
                            ? "bg-[#0080FF] border-[#0080FF] text-white"
                            : "bg-[#0F1117] border-white/10 text-gray-400"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Available for live online classes?
                  </label>
                  <div className="flex items-center gap-2">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIsLiveClassAvailable(opt)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isLiveClassAvailable === opt
                            ? "bg-[#0080FF] border-[#0080FF] text-white"
                            : "bg-[#0F1117] border-white/10 text-gray-400"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                7. Availability Table
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    7. Availability
                  </h2>
                  <p className="text-xs text-gray-400">Click to select available teaching time slots for each day</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-bold uppercase">
                      <th className="py-3 px-2 text-left">Day</th>
                      {timeSlots.map((slot) => (
                        <th key={slot} className="py-3 px-2">{slot}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daysList.map((day) => {
                      const daySlots = availability[day] || [];
                      return (
                        <tr key={day} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-3 px-2 font-bold text-white text-left">{day}</td>
                          {timeSlots.map((slot) => {
                            const isChecked = daySlots.includes(slot);
                            return (
                              <td key={slot} className="py-3 px-2">
                                <button
                                  type="button"
                                  onClick={() => toggleAvailabilitySlot(day, slot)}
                                  className={`w-full py-2 rounded-lg border font-semibold text-[11px] transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-[#10B981]/25 border-[#10B981] text-[#10B981] font-extrabold"
                                      : "bg-[#0F1117] border-white/10 text-gray-500 hover:text-white"
                                  }`}
                                >
                                  {isChecked ? "✓ Selected" : "—"}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ----------------------------------------
                8. Coach Introduction
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    8. Coach Introduction
                  </h2>
                  <p className="text-xs text-gray-400">Tell us about your philosophy and motivation</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Tell us about yourself
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share your personal journey in fitness or martial arts..."
                    value={aboutSelf}
                    onChange={(e) => setAboutSelf(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Why would you like to join SELFFITS?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What excites you about teaching in SELFFITS global virtual academy?..."
                    value={whyJoinSelffits}
                    onChange={(e) => setWhyJoinSelffits(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    What makes you a good coach?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Highlight your key teaching strengths, patience, form evaluation techniques..."
                    value={whatMakesGoodCoach}
                    onChange={(e) => setWhatMakesGoodCoach(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                9. Portfolio & Social Media
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    9. Portfolio & Social Media
                  </h2>
                  <p className="text-xs text-gray-400">Social profiles and demo training videos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Instagram Profile Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Facebook Profile Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourhandle"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    YouTube Channel Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@yourchannel"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Website / Portfolio Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Training Videos — Upload File or Video URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or Google Drive demo video link"
                    value={trainingVideoUrl}
                    onChange={(e) => setTrainingVideoUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                10. Documents Upload Section
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                    10. Documents Upload
                  </h2>
                  <p className="text-xs text-gray-400">Choose document files directly from your device OR paste Drive links</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 10a. CV / Resume */}
                <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-200">
                      CV / Resume
                    </label>
                    <span className="text-[10px] text-gray-400">PDF, DOC, DOCX</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-[#10B981] rounded-xl cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.05] text-center space-y-2">
                    <FileUp className="w-6 h-6 text-[#10B981]" />
                    <span className="text-xs font-bold text-white">Click to Select CV File</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileSelection(e, setResumeUrl, setResumeFileName, "CV")}
                      className="hidden"
                    />
                  </label>

                  {resumeFileName ? (
                    <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-1.5 truncate">
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">Selected: {resumeFileName}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Or paste Google Drive PDF Link"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-xs"
                    />
                  )}
                </div>

                {/* 10b. Qualification Certificates */}
                <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-200">
                      Qualification Certificates
                    </label>
                    <span className="text-[10px] text-gray-400">PDF, ZIP, Images</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-[#10B981] rounded-xl cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.05] text-center space-y-2">
                    <FileUp className="w-6 h-6 text-[#10B981]" />
                    <span className="text-xs font-bold text-white">Click to Select Certificates</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      onChange={(e) => handleFileSelection(e, setQualificationCertsUrl, setQualificationFileName, "Certs")}
                      className="hidden"
                    />
                  </label>

                  {qualificationFileName ? (
                    <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-1.5 truncate">
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">Selected: {qualificationFileName}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Or paste Certificates Folder Link"
                      value={qualificationCertsUrl}
                      onChange={(e) => setQualificationCertsUrl(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-xs"
                    />
                  )}
                </div>

                {/* 10c. Instructor License */}
                <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-200">
                      Instructor License
                    </label>
                    <span className="text-[10px] text-gray-400">PDF, JPG, PNG</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-[#10B981] rounded-xl cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.05] text-center space-y-2">
                    <FileUp className="w-6 h-6 text-[#10B981]" />
                    <span className="text-xs font-bold text-white">Click to Select License File</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelection(e, setLicenseUrl, setLicenseFileName, "License")}
                      className="hidden"
                    />
                  </label>

                  {licenseFileName ? (
                    <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-1.5 truncate">
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">Selected: {licenseFileName}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Or paste License Document Link"
                      value={licenseUrl}
                      onChange={(e) => setLicenseUrl(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-xs"
                    />
                  )}
                </div>

                {/* 10d. ID / Passport */}
                <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-200">
                      ID / Passport
                    </label>
                    <span className="text-[10px] text-gray-400">PDF, JPG, PNG</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-[#10B981] rounded-xl cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.05] text-center space-y-2">
                    <FileUp className="w-6 h-6 text-[#10B981]" />
                    <span className="text-xs font-bold text-white">Click to Select ID/Passport</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelection(e, setIdPassportUrl, setIdPassportFileName, "ID")}
                      className="hidden"
                    />
                  </label>

                  {idPassportFileName ? (
                    <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-1.5 truncate">
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">Selected: {idPassportFileName}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Or paste Passport Copy Link"
                      value={idPassportUrl}
                      onChange={(e) => setIdPassportUrl(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] text-xs"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                11. Declaration & Final Button
            ---------------------------------------- */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  11. Declaration
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  &ldquo;I confirm that the information provided is accurate and that I am qualified to teach the disciplines selected above. I authorize SELFFITS to verify my qualifications and experience.&rdquo;
                </p>

                <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedDeclaration}
                    onChange={(e) => setAgreedDeclaration(e.target.checked)}
                    className="w-5 h-5 accent-[#E50914] rounded cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-white">
                    I agree to the above declaration. <span className="text-[#E50914]">*</span>
                  </span>
                </label>
              </div>

              {/* FINAL SUBMIT BUTTON */}
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
                    Apply to Become a SELFFITS Coach
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
