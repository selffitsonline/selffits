"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Video,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Calendar,
  Flame,
} from "lucide-react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { CoachesCarousel } from "@/components/public/coaches-carousel";
import { ProgramsCarousel } from "@/components/public/programs-carousel";
import { TestimonialsCarousel } from "@/components/public/testimonials-carousel";

const DEFAULT_HERO_SLIDES = [
  {
    id: "slide_1",
    badgeText: "ONLINE FITNESS & MARTIAL ARTS ACADEMY",
    titleMain: "Train Anywhere.",
    titleHighlight: "Transform Yourself!",
    subtitle:
      "Join live, interactive Martial Arts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official certifications, and world-class instructors.",
    primaryCtaText: "Join Academy Now",
    primaryCtaLink: "/programs",
    secondaryCtaText: "View Programs",
    secondaryCtaLink: "/programs",
    imageUrl: "/images/hero1.jpg",
    isEnabled: true,
  },
  {
    id: "slide_2",
    badgeText: "LIVE VIRTUAL ZOOM CLASSES",
    titleMain: "Master Martial Arts & Fitness.",
    titleHighlight: "Earn Official Certification!",
    subtitle:
      "Interactive training with expert instructors. Kids, Adults, and Ladies Only dedicated batches.",
    primaryCtaText: "Explore Programs",
    primaryCtaLink: "/programs",
    secondaryCtaText: "Meet Master Coaches",
    secondaryCtaLink: "/coaches",
    imageUrl: "/images/hero2.jpg",
    isEnabled: true,
  },
  {
    id: "slide_3",
    badgeText: "FEMALE FITNESS & SELF DEFENSE",
    titleMain: "Empower Your Spirit.",
    titleHighlight: "Ladies Only Batches!",
    subtitle:
      "Female-led high energy HIIT workouts, fat loss challenges, and real-world self-defense techniques.",
    primaryCtaText: "Join Ladies Batch",
    primaryCtaLink: "/programs#ladies",
    secondaryCtaText: "Contact Support",
    secondaryCtaLink: "/contact",
    imageUrl: "/images/ladies_fitness.png",
    isEnabled: true,
  },
];

interface HomePageClientProps {
  initialData?: any;
}

export function HomePageClient({ initialData }: HomePageClientProps) {
  // Synchronously initialize state with server-fetched DB data on 1st render
  const [heroSlides, setHeroSlides] = useState<any[]>(
    () => initialData?.banner?.slides && initialData.banner.slides.length > 0
      ? initialData.banner.slides
      : DEFAULT_HERO_SLIDES
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const [statsData, setStatsData] = useState<any>(() => initialData?.stats || null);
  const [programsData, setProgramsData] = useState<any>(() => initialData?.programs || null);
  const [beltSyllabusData, setBeltSyllabusData] = useState<any>(() => initialData?.beltSyllabus || null);
  const [fitnessJourneyData, setFitnessJourneyData] = useState<any>(() => initialData?.fitnessJourney || null);
  const [activeBeltId, setActiveBeltId] = useState<string>("white_belt");
  const [aboutData, setAboutData] = useState<any>(() => initialData?.about || null);
  const [whyChooseData, setWhyChooseData] = useState<any>(() => initialData?.whyChoose || null);
  const [howItWorksData, setHowItWorksData] = useState<any>(() => initialData?.howItWorks || null);
  const [coachesData, setCoachesData] = useState<any>(() => initialData?.coaches || null);
  const [faqsData, setFaqsData] = useState<any>(() => initialData?.faqs || null);
  const [testimonialsData, setTestimonialsData] = useState<any>(() => initialData?.testimonials || null);

  // Sync state if initialData props change
  useEffect(() => {
    if (initialData) {
      if (initialData.banner?.slides && initialData.banner.slides.length > 0) {
        setHeroSlides(initialData.banner.slides);
      }
      if (initialData.stats) setStatsData(initialData.stats);
      if (initialData.programs) setProgramsData(initialData.programs);
      if (initialData.beltSyllabus) setBeltSyllabusData(initialData.beltSyllabus);
      if (initialData.fitnessJourney) setFitnessJourneyData(initialData.fitnessJourney);
      if (initialData.about) setAboutData(initialData.about);
      if (initialData.whyChoose) setWhyChooseData(initialData.whyChoose);
      if (initialData.howItWorks) setHowItWorksData(initialData.howItWorks);
      if (initialData.coaches) setCoachesData(initialData.coaches);
      if (initialData.faqs) setFaqsData(initialData.faqs);
      if (initialData.testimonials) setTestimonialsData(initialData.testimonials);
    }
  }, [initialData]);

  const activeSlides = heroSlides.filter((s) => s.isEnabled);
  const activeSlideCount = activeSlides.length > 0 ? activeSlides.length : 1;

  useEffect(() => {
    if (activeSlideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlideCount);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlideCount]);

  const activeSlide = activeSlides[currentSlide] || activeSlides[0] || heroSlides[0];

  const stats = statsData || {
    headingBadge: "Academy Metrics & Impact",
    headingTitle: "Proven Excellence Worldwide",
    headingSubtitle:
      "Transforming lives daily through high-energy live Zoom training, real-time coaching, and official belt advancement.",
    items: [
      { id: "stat_1", value: "2,000+", label: "Active Students" },
      { id: "stat_2", value: "98%", label: "Belt Pass Rate" },
      { id: "stat_3", value: "4.9 / 5", label: "Satisfaction" },
      { id: "stat_4", value: "50+", label: "Live Classes Every Wk" },
      { id: "stat_5", value: "20+", label: "Expert Coaches" },
    ],
  };
  const statsItems = stats.items || [];

  const programs = programsData?.items || [
    {
      id: "kids",
      title: "Kids Martial Arts (8-20)",
      category: "MARTIAL ARTS",
      image: "/images/kids_martial_arts.png",
      description:
        "Build confidence, discipline, focus, and physical coordination in a safe online virtual class environment.",
      classes: "4 - 20 Live Classes",
      duration: "1 - 5 Days / Wk",
      priceStartsUSD: "25",
      href: "/programs?cat=mma&audience=kids",
    },
    {
      id: "adults",
      title: "Adults Martial Arts (21+)",
      category: "MARTIAL ARTS",
      image: "/images/adults_martial_arts.png",
      description:
        "Master striking techniques, self defense maneuvers, physical conditioning, and martial arts syllabus mastery.",
      classes: "4 - 20 Live Classes",
      duration: "1 - 5 Days / Wk",
      priceStartsUSD: "25",
      href: "/programs?cat=mma&audience=adults",
    },
    {
      id: "ladies",
      title: "Ladies Only Programs",
      category: "LADIES SPECIAL",
      image: "/images/ladies_fitness.png",
      description:
        "Empowering female-only live sessions focusing on self-defense, weight management, toning, and personal safety.",
      classes: "4 - 20 Live Classes",
      duration: "1 - 5 Days / Wk",
      priceStartsUSD: "25",
      href: "/programs?cat=mma&audience=ladies",
    },
    {
      id: "weight-loss",
      title: "Fitness & Weight Management",
      category: "FITNESS & WEIGHT",
      image: "/images/weight_loss_hiit.png",
      description:
        "High-intensity calorie-burning workouts designed for fat loss, stamina, and lean muscle building.",
      classes: "4 - 20 Live Sessions",
      duration: "1 - 5 Days / Wk",
      priceStartsUSD: "25",
      href: "/programs?cat=hiit&audience=adults",
    },
  ];

  const about = aboutData || {
    badgeText: "About SELFFITS Academy",
    headingTitle: "Structured Virtual Martial Arts & Fitness Academy",
    description:
      "SELFFITS was founded to bring authentic martial arts discipline and high-energy fitness training directly into homes around the globe. We eliminate recorded video fatigue by conducting 100% interactive live sessions.",
    imageUrl: "/images/kids_martial_arts.png",
    ctaText: "Read Our Full Story",
    ctaLink: "/about",
  };

  const whyChooseItems = whyChooseData?.items || [
    {
      id: "why_1",
      iconType: "video",
      title: "100% Live Coaching",
      description: "No boring pre-recorded videos. Every class is live over Zoom Classes.",
    },
    {
      id: "why_2",
      iconType: "shield",
      title: "Form Correction",
      description: "Trainers watch your stance and correct techniques live during session.",
    },
    {
      id: "why_3",
      iconType: "award",
      title: "Official Belt Certificates",
      description: "Earn digital belt certificates uploaded directly to your dashboard.",
    },
    {
      id: "why_4",
      iconType: "users",
      title: "Flexible Global Batches",
      description: "Morning and evening batches available across international timezones.",
    },
  ];

  const howItWorksSteps = howItWorksData?.steps || [
    {
      stepNumber: "01",
      title: "1. Choose your Plan",
      description: "Select your preferred training frequency — 1, 2, 3, 4, or 5 days per week.",
    },
    {
      stepNumber: "02",
      title: "2. Choose your Training Days",
      description: "Choose the specific days that work best for your personal schedule.",
    },
    {
      stepNumber: "03",
      title: "3. Choose your Preferred Batch",
      description: "Select your preferred one-hour live class batch timing.",
    },
    {
      stepNumber: "04",
      title: "4. Train Live with Coach",
      description:
        "Attend your live online martial arts training through Google Meet with real-time instructor feedback.",
    },
    {
      stepNumber: "05",
      title: "5. Complete 25 Classes → Attend Grading",
      description:
        "After completing every 25 classes, you become eligible to attend your official grading examination.",
    },
    {
      stepNumber: "06",
      title: "6. Progress Through the Belt Levels 🥋",
      description:
        "With each successful grading, your belt level progresses: White → Yellow → Green → Blue → Brown → Black.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-16 sm:pt-20">
        {/* 1. HERO BANNER SECTION */}
        <section className="relative w-full min-h-[calc(100vh-68px)] flex items-center justify-center overflow-hidden py-8 sm:py-12 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {activeSlides.map((s, idx) => (
              <div
                key={s.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  currentSlide === idx ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={s.imageUrl || "/images/hero1.jpg"}
                  alt={`Hero Background Slide ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  unoptimized
                  className="object-cover object-center w-full h-full"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E]/80 via-[#0A0B0E]/30 to-[#0A0B0E]/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B0E]/40 via-transparent to-[#0A0B0E]/40 pointer-events-none" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 w-full px-4 sm:px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id || currentSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4 flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0B0E]/80 border border-[#E50914]/60 text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  {activeSlide.badgeText}
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] font-[family-name:var(--font-outfit)] text-white">
                  <span className="block">{activeSlide.titleMain}</span>
                  <span className="text-[#E50914] block mt-1 sm:mt-2">
                    {activeSlide.titleHighlight}
                  </span>
                </h1>

                <p className="text-gray-100 text-base sm:text-xl font-semibold max-w-3xl mx-auto leading-relaxed">
                  {activeSlide.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-2xl mx-auto">
                  <Link
                    href={activeSlide.primaryCtaLink || "/programs"}
                    className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-base sm:text-lg hover:opacity-95 transition-all shadow-2xl shadow-[#E50914]/50 hover:translate-y-[-2px] flex items-center justify-center gap-2.5 text-center whitespace-nowrap shrink-0 tracking-wide w-full sm:w-auto"
                  >
                    {activeSlide.primaryCtaText}
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  </Link>
                  <Link
                    href={activeSlide.secondaryCtaLink || "/programs"}
                    className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl bg-[#0A0B0E]/85 backdrop-blur-md border border-white/35 text-white font-bold text-base sm:text-lg hover:bg-white/20 transition-all text-center whitespace-nowrap shrink-0 tracking-wide w-full sm:w-auto shadow-xl"
                  >
                    {activeSlide.secondaryCtaText}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2.5">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx
                    ? "w-8 bg-[#E50914] shadow-md shadow-[#E50914]/50"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 1.5. ACADEMY METRICS & IMPACT (STATS SECTION) */}
        <section className="relative z-20 bg-[#10121A] border-y-[0.5px] border-white/10 py-12 sm:py-16 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-[#E50914]/15 via-[#0080FF]/15 to-[#10B981]/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#E50914] bg-[#E50914]/15 px-3.5 py-1.5 rounded-full border border-[#E50914]/40 inline-block shadow-lg backdrop-blur-md">
                {stats.headingBadge}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-outfit)] text-white tracking-tight">
                {stats.headingTitle}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto">
                {stats.headingSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {statsItems.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className={`bg-[#14161D]/90 border border-white/15 hover:border-[#E50914]/60 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-center items-center group backdrop-blur-md ${
                    idx === 4 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md ${
                      idx === 0
                        ? "bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914]"
                        : idx === 1
                        ? "bg-[#0080FF]/15 border border-[#0080FF]/30 text-[#38BDF8]"
                        : idx === 2
                        ? "bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399]"
                        : idx === 3
                        ? "bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FBBF24]"
                        : "bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#C084FC]"
                    }`}
                  >
                    {idx === 0 && <Users className="w-5 h-5" />}
                    {idx === 1 && <Award className="w-5 h-5" />}
                    {idx === 2 && <Star className="w-5 h-5 fill-[#34D399]" />}
                    {idx === 3 && <Video className="w-5 h-5" />}
                    {idx >= 4 && <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <h3
                    className={`text-2xl sm:text-3xl font-black font-[family-name:var(--font-outfit)] ${
                      idx === 0
                        ? "text-white"
                        : idx === 1
                        ? "text-[#38BDF8]"
                        : idx === 2
                        ? "text-[#34D399]"
                        : idx === 3
                        ? "text-[#FBBF24]"
                        : "text-[#C084FC]"
                    }`}
                  >
                    {item.value}
                  </h3>
                  <p className="text-xs font-bold text-gray-300 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. EXPLORE OUR PROGRAMS */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y-[0.5px] border-white/10 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
                {programsData?.headingBadge || "Training Pathways"}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                {programsData?.headingTitle || "Explore Our Programs"}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                {programsData?.headingSubtitle ||
                  "Structured live virtual training paths with customizable weekly schedule frequencies from 1 to 5 Days / Week."}
              </p>
            </div>

            <ProgramsCarousel items={programs} />
          </div>
        </section>

        {/* 2.5 & 2.6. MARTIAL ARTS & WEIGHT MANAGEMENT LEARNING JOURNEYS */}
        {(() => {
          const beltsList = beltSyllabusData?.belts || [
            {
              id: "white_belt",
              name: "White Belt",
              subtitle: "Foundations & Fundamental Stances",
              isEnabled: true,
              syllabus: [
                "Breathing & mind-body focus exercises",
                "Full joint warm-up & flexibility routines",
                "Martial arts fundamental stances & front kick mechanics",
                "Core strength conditioning & basic self-defense blocks",
                "Dojo etiquette, respect, and discipline basics",
              ],
            },
            {
              id: "yellow_belt",
              name: "Yellow Belt",
              subtitle: "Striking Foundations & Footwork",
              isEnabled: true,
              syllabus: [
                "Jab-Cross punch combination & guard positioning",
                "Roundhouse kick techniques & target accuracy",
                "Basic evasion, ducking, and footwork drills",
                "Upper body blocks & counter-attack timing",
                "Stamina building & high-intensity core sets",
              ],
            },
            {
              id: "green_belt",
              name: "Green Belt",
              subtitle: "Intermediate Striking & Defense",
              isEnabled: true,
              syllabus: [
                "Side kicks, hook kicks & dynamic leg flexibility",
                "Combination striking & distance management",
                "Intermediate wrist escape & release self-defense maneuvers",
                "Reaction time drills & counter-punching precision",
                "Core stability & balance endurance exercises",
              ],
            },
            {
              id: "blue_belt",
              name: "Blue Belt",
              subtitle: "Advanced Form & Sparring Tactics",
              isEnabled: true,
              syllabus: [
                "Spinning back kick & jump kick execution",
                "Advanced defense counters & sweep techniques",
                "Close-range elbow and knee strike combinations",
                "Multi-attacker defense awareness & tactical positioning",
                "Mental resilience & competitive focus conditioning",
              ],
            },
            {
              id: "brown_belt",
              name: "Brown Belt",
              subtitle: "Mastery Level Combat & Control",
              isEnabled: true,
              syllabus: [
                "Precision combination chaining & fluid movement mastery",
                "Joint lock defense & advanced takedown prevention",
                "Speed, power, and kinetic energy striking mechanics",
                "Leadership, junior mentoring & assistant instructor drills",
                "Intensive full-body endurance & power conditioning",
              ],
            },
            {
              id: "black_belt",
              name: "Black Belt",
              subtitle: "Black Belt Excellence & Syllabus Graduation",
              isEnabled: true,
              syllabus: [
                "Full martial arts curriculum mastery & flawless form execution",
                "Real-world situational self-defense & rapid neutralizing drills",
                "Advanced teaching methodology & stance evaluation techniques",
                "Official black belt examination & graduation syllabus completion",
                "Lifelong discipline, philosophy, and academy ambassador leadership",
              ],
            },
          ];

          const activeBelts = beltsList.filter((b: any) => b.isEnabled !== false);
          const selectedBelt = activeBelts.find((b: any) => b.id === activeBeltId) || activeBelts[0] || beltsList[0];

          const getBeltStyle = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes("yellow")) return { bg: "bg-amber-400/20", text: "text-amber-300", border: "border-amber-400/50" };
            if (n.includes("green")) return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" };
            if (n.includes("blue")) return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" };
            if (n.includes("brown")) return { bg: "bg-amber-800/30", text: "text-amber-400", border: "border-amber-700/60" };
            if (n.includes("black")) return { bg: "bg-red-950/50", text: "text-red-400", border: "border-red-600/60" };
            return { bg: "bg-gray-200/20", text: "text-white", border: "border-gray-300/40" };
          };

          const selectedStyle = getBeltStyle(selectedBelt.name);

          const fitnessData = fitnessJourneyData || {
            headingBadge: "WEIGHT MANAGEMENT SYLLABUS",
            headingTitle: "Your Weight Management Journey",
            headingSubtitle:
              "Explore the core fitness, HIIT cardio, muscle endurance, and body transformation modules covered in our Weight Management program.",
            points: [
              "Full-body metabolic warm-up & posture alignment routines",
              "High-Intensity Interval Training (HIIT) for maximum fat burn & stamina",
              "Core strength, abdominal shred & posture stabilization drills",
              "Bodyweight resistance & progressive muscular endurance exercises",
              "Targeted waistline, thigh, and arm toning workouts",
              "Cardiovascular endurance building & active recovery techniques",
              "Nutritional guidelines, hydration habits & daily wellness tracking",
            ],
          };

          const pointsList = fitnessData.points || [];

          return (
            <section className="py-16 sm:py-24 bg-[#0A0B0E] border-b border-white/10 px-4 relative overflow-hidden space-y-16 sm:space-y-20">
              {/* PART 1: YOUR MARTIAL ARTS LEARNING JOURNEY */}
              <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-xs font-black uppercase tracking-widest text-[#E50914] shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    {beltSyllabusData?.headingBadge || "BELT PROGRESSION SYLLABUS"}
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white">
                    {beltSyllabusData?.headingTitle || "Your Martial Arts Learning Journey"}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                    {beltSyllabusData?.headingSubtitle ||
                      "Explore the skills, techniques, and syllabus covered at each belt progression rank from White Belt to Black Belt."}
                  </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 w-full">
                    {activeBelts.map((belt: any) => {
                      const isSelected = selectedBelt.id === belt.id;
                      const style = getBeltStyle(belt.name);

                      return (
                        <button
                          key={belt.id}
                          type="button"
                          onClick={() => setActiveBeltId(belt.id)}
                          className={`px-2 sm:px-2.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center sm:text-left cursor-pointer ${
                            isSelected
                              ? `${style.bg} ${style.border} text-white shadow-xl ring-2 ring-white/20`
                              : "bg-[#14161D] border-white/10 text-gray-400 hover:text-white hover:border-white/25"
                          }`}
                        >
                          <Award className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? style.text : "text-gray-400"}`} />
                          <span className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider whitespace-nowrap ${isSelected ? style.text : "text-gray-200"}`}>
                            {belt.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedBelt && (
                    <div className="w-full bg-[#14161D] border border-white/15 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${selectedStyle.bg} ${selectedStyle.border} ${selectedStyle.text}`}>
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                              {selectedBelt.name}
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">
                              {selectedBelt.subtitle || "Techniques & Learning Syllabus"}
                            </p>
                          </div>
                        </div>

                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto inline-flex items-center justify-center shrink-0 ${selectedStyle.bg} ${selectedStyle.text} ${selectedStyle.border}`}>
                          Official Belt Level
                        </span>
                      </div>

                      <div className="space-y-3 pt-1">
                        {selectedBelt.syllabus && selectedBelt.syllabus.length > 0 ? (
                          <div className="space-y-3">
                            {selectedBelt.syllabus.map((topic: string, tIdx: number) => (
                              <div
                                key={tIdx}
                                className="flex items-start gap-3 text-xs sm:text-sm text-gray-200 font-medium leading-relaxed"
                              >
                                <span className="w-5 h-5 rounded-md bg-[#E50914]/15 text-[#E50914] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                  {tIdx + 1}
                                </span>
                                <span className="flex-1">{topic}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No syllabus points configured for this belt level.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PART 2: YOUR WEIGHT MANAGEMENT JOURNEY */}
              <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-xs font-black uppercase tracking-widest text-[#E50914] shadow-lg">
                    <Flame className="w-3.5 h-3.5" />
                    {fitnessData.headingBadge || "WEIGHT MANAGEMENT SYLLABUS"}
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white">
                    {fitnessData.headingTitle || "Your Weight Management Journey"}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                    {fitnessData.headingSubtitle ||
                      "Explore the core fitness, HIIT cardio, muscle endurance, and body transformation modules covered in our Weight Management program."}
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="w-full bg-[#14161D] border border-white/15 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-[#E50914]/15 border-[#E50914]/40 text-[#E50914] shrink-0">
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                            Fitness & Weight Management
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">
                            Curriculum & Daily Fitness Modules
                          </p>
                        </div>
                      </div>

                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40 self-start sm:self-auto inline-flex items-center justify-center shrink-0">
                        Fat Loss & HIIT Track
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {pointsList.length > 0 ? (
                        <div className="space-y-3">
                          {pointsList.map((topic: string, tIdx: number) => (
                            <div
                              key={tIdx}
                              className="flex items-start gap-3 text-xs sm:text-sm text-gray-200 font-medium leading-relaxed"
                            >
                              <span className="w-5 h-5 rounded-md bg-[#E50914]/15 text-[#E50914] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                {tIdx + 1}
                              </span>
                              <span className="flex-1">{topic}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No weight management syllabus points configured.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 3. ABOUT PREVIEW SECTION */}
        <section className="py-16 sm:py-20 bg-[#0E1015] border-y-[0.5px] border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={about.imageUrl || "/images/kids_martial_arts.png"}
                alt="About Academy"
                width={600}
                height={400}
                className="w-full h-[260px] sm:h-[380px] object-cover"
              />
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                {about.badgeText || "About SELFFITS Academy"}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                {about.headingTitle || "Structured Virtual Martial Arts & Fitness Academy"}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {about.description ||
                  "SELFFITS was founded to bring authentic martial arts discipline and high-energy fitness training directly into homes around the globe."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Real-Time Form Correction</h4>
                    <p className="text-xs text-gray-400">Coaches observe and guide every stance live.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0080FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Belt Certificates</h4>
                    <p className="text-xs text-gray-400">Earn recognized certifications upon completion.</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href={about.ctaLink || "/about"}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#E50914] hover:underline"
                >
                  {about.ctaText || "Read Our Full Story"} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHY CHOOSE SELFFITS */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              {whyChooseData?.headingBadge || "Academy Value"}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
              {whyChooseData?.headingTitle || "Why Choose SELFFITS?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseItems.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E50914]/15 flex items-center justify-center text-[#E50914]">
                  {idx === 0 && <Video className="w-6 h-6" />}
                  {idx === 1 && <ShieldCheck className="w-6 h-6 text-[#0080FF]" />}
                  {idx === 2 && <Award className="w-6 h-6 text-[#10B981]" />}
                  {idx >= 3 && <Users className="w-6 h-6 text-[#F59E0B]" />}
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y-[0.5px] border-white/10 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0080FF]/15 border border-[#0080FF]/30 text-xs font-extrabold uppercase tracking-widest text-[#0080FF]">
                <Sparkles className="w-3.5 h-3.5" />
                {howItWorksData?.headingBadge || "Structured Academy Pathway"}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white">
                {howItWorksData?.headingTitle || "How SELFFITS Works"}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto font-medium">
                {howItWorksData?.headingSubtitle ||
                  "Simple 6-step roadmap from selecting your weekly schedule to belt progression examinations."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {howItWorksSteps.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#14161D] border border-white/15 p-6 sm:p-7 rounded-2xl relative flex flex-col justify-between space-y-4 hover:border-[#E50914]/50 transition-all group shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <span className="text-4xl font-black text-[#E50914]/25 font-[family-name:var(--font-outfit)]">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. MEET OUR MASTER COACHES */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y-[0.5px] border-white/10 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                {coachesData?.headingBadge || "World Class Instructors"}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                {coachesData?.headingTitle || "Meet Our Master Coaches"}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                {coachesData?.headingSubtitle ||
                  "Swipe or click to meet our black belt senseis and master fitness trainers."}
              </p>
            </div>

            <CoachesCarousel items={coachesData?.items} />
          </div>
        </section>

        {/* 7. STUDENT CTA BANNER */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#E50914] via-[#DC2626] to-[#0080FF] p-6 sm:p-12 lg:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-outfit)]">
              Ready to Kickstart Your Journey?
            </h2>
            <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              Join thousands of students training live around the world. Enroll in a belt tier or fitness challenge today.
            </p>
            <div className="pt-4">
              <Link
                href="/programs"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white text-[#0A0B0E] font-black text-sm sm:text-base hover:bg-gray-100 transition-all shadow-xl inline-flex items-center gap-2"
              >
                Enroll in Academy <Sparkles className="w-5 h-5 text-[#E50914]" />
              </Link>
            </div>
          </div>
        </section>

        {/* 8. FREQUENTLY ASKED QUESTIONS */}
        <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              {faqsData?.headingBadge || "Got Questions?"}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
              {faqsData?.headingTitle || "Frequently Asked Questions"}
            </h2>
          </div>

          <FAQAccordion items={faqsData?.items} />
        </section>

        {/* 9. BECOME A SELFFITS COACH CTA */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto rounded-3xl bg-[#14161D] border border-white/15 p-8 sm:p-12 lg:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#E50914]/40 transition-all">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold border border-[#E50914]/30 uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" />
                Instructor Recruitment
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">
                BECOME A SELFFITS COACH
              </h2>
            </div>

            <p className="relative z-10 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.
            </p>

            <div className="relative z-10 pt-2">
              <Link
                href="/become-coach"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-black text-sm sm:text-base uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/30 inline-flex items-center gap-2"
              >
                BECOME A COACH <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 10. SUCCESS STORIES & TESTIMONIALS */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y-[0.5px] border-white/10 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
                {testimonialsData?.headingBadge || "Success Stories"}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                {testimonialsData?.headingTitle || "What Our Students Say"}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                {testimonialsData?.headingSubtitle ||
                  "Real transformations from students and parents training across the globe."}
              </p>
            </div>

            <TestimonialsCarousel items={testimonialsData?.items} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
