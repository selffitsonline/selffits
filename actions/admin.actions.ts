"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAdminDashboardStatsAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access to Admin Portal." };
    }

    const [
      totalStudents,
      activeEnrollments,
      totalPayments,
      pendingCoachApps,
      approvedCoaches,
      recentPayments,
      recentEnrollments,
      programs,
    ] = await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.enrollment.count({ where: { status: "ACTIVE" } }),
      db.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      db.coachApplication.count({ where: { status: "PENDING" } }),
      db.coachApplication.count({ where: { status: "APPROVED" } }),
      db.payment.findMany({
        where: { status: "SUCCESS" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          enrollment: {
            include: { membershipPlan: { select: { name: true } } },
          },
        },
      }),
      db.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          membershipPlan: { select: { name: true, totalClasses: true } },
        },
      }),
      db.membershipPlan.findMany({
        select: {
          id: true,
          name: true,
          priceINR: true,
          totalClasses: true,
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

    const totalRevenueINR = totalPayments._sum.amount ? Number(totalPayments._sum.amount) : 0;

    const formattedRecentPayments = recentPayments.map((p) => ({
      id: p.id,
      userName: p.user.name,
      userEmail: p.user.email,
      planName: p.enrollment?.membershipPlan?.name || "Martial Arts Plan",
      amount: `₹${p.amount}`,
      date: p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: p.status,
    }));

    const formattedRecentEnrollments = recentEnrollments.map((e) => ({
      id: e.id,
      userName: e.user.name,
      userEmail: e.user.email,
      planName: e.membershipPlan?.name || "Membership Plan",
      status: e.status,
      classes: `${e.remainingClasses} / ${e.totalClassesGranted}`,
      startDate: e.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));

    return {
      success: true,
      stats: {
        totalStudents,
        activeEnrollments,
        totalRevenueINR,
        successfulTransactions: totalPayments._count.id || 0,
        pendingCoachApps,
        approvedCoaches,
        recentPayments: formattedRecentPayments,
        recentEnrollments: formattedRecentEnrollments,
        programs: programs.map((prg) => ({
          id: prg.id,
          name: prg.name,
          priceINR: Number(prg.priceINR),
          totalClasses: prg.totalClasses,
          enrolledCount: prg._count.enrollments,
        })),
      },
    };
  } catch (err: any) {
    console.error("getAdminDashboardStatsAction error:", err);
    return { success: false, error: "Failed to fetch admin stats." };
  }
}

// 2. MENU MANAGEMENT SERVER ACTIONS (HEADER & FOOTER)
export async function getAdminMenuItemsAction() {
  try {
    const [headerSetting, footerSetting] = await Promise.all([
      db.websiteSettings.findUnique({ where: { key: "header_menu" } }),
      db.websiteSettings.findUnique({ where: { key: "footer_menu" } }),
    ]);

    const defaultHeaderMenu = [
      { id: "h1", label: "Home", href: "/", order: 1, isEnabled: true },
      { id: "h2", label: "Programs", href: "/programs", order: 2, isEnabled: true },
      { id: "h3", label: "Coaches", href: "/coaches", order: 3, isEnabled: true },
      { id: "h4", label: "About Us", href: "/about", order: 4, isEnabled: true },
      { id: "h5", label: "Success Stories", href: "/success-stories", order: 5, isEnabled: true },
    ];

    const defaultFooterMenu = [
      { id: "f1", label: "Home", href: "/", order: 1, isEnabled: true },
      { id: "f2", label: "All Programs", href: "/programs", order: 2, isEnabled: true },
      { id: "f3", label: "Master Coaches", href: "/coaches", order: 3, isEnabled: true },
      { id: "f4", label: "About Academy", href: "/about", order: 4, isEnabled: true },
      { id: "f5", label: "Success Stories", href: "/success-stories", order: 5, isEnabled: true },
      { id: "f6", label: "FAQ", href: "/faq", order: 6, isEnabled: true },
      { id: "f7", label: "Become a Coach", href: "/become-coach", order: 7, isEnabled: true },
      { id: "f8", label: "Contact Support", href: "/contact", order: 8, isEnabled: true },
    ];

    return {
      success: true,
      headerMenu: (headerSetting?.value as any[]) || defaultHeaderMenu,
      footerMenu: (footerSetting?.value as any[]) || defaultFooterMenu,
    };
  } catch (err: any) {
    console.error("getAdminMenuItemsAction error:", err);
    return { success: false, error: "Failed to load header and footer menus." };
  }
}

export async function updateAdminMenuItemsAction(headerMenu: any[], footerMenu: any[]) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await Promise.all([
      db.websiteSettings.upsert({
        where: { key: "header_menu" },
        update: { value: headerMenu },
        create: { key: "header_menu", value: headerMenu },
      }),
      db.websiteSettings.upsert({
        where: { key: "footer_menu" },
        update: { value: footerMenu },
        create: { key: "footer_menu", value: footerMenu },
      }),
    ]);

    revalidatePath("/", "layout");
    return { success: true, message: "Header & Footer navigation menus saved successfully!" };
  } catch (err: any) {
    console.error("updateAdminMenuItemsAction error:", err);
    return { success: false, error: "Failed to update menu navigation." };
  }
}

import { storageProvider } from "@/lib/storage";

// 3. HOMEPAGE BANNER CONTENT ACTIONS (MULTI-SLIDE & IMAGE UPLOAD)
export async function getAdminBannerContentAction() {
  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: "homepage_banner" },
    });

    const defaultSlides = [
      {
        id: "slide_1",
        badgeText: "ONLINE FITNESS & MARTIAL ARTS ACADEMY",
        titleMain: "Train Anywhere.",
        titleHighlight: "Transform Yourself!",
        subtitle: "Join live, interactive Martial Arts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official certifications, and world-class instructors.",
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
        subtitle: "Interactive training with expert instructors. Kids, Adults, and Ladies Only dedicated batches.",
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
        subtitle: "Female-led high energy HIIT workouts, fat loss challenges, and real-world self-defense techniques.",
        primaryCtaText: "Join Ladies Batch",
        primaryCtaLink: "/programs#ladies",
        secondaryCtaText: "Contact Support",
        secondaryCtaLink: "/contact",
        imageUrl: "/images/ladies_fitness.png",
        isEnabled: true,
      },
    ];

    if (setting && setting.value) {
      const stored = setting.value as any;
      if (Array.isArray(stored.slides) && stored.slides.length > 0) {
        return { success: true, slides: stored.slides };
      }
      if (stored.badgeText || stored.titleMain) {
        return { success: true, slides: [{ id: "slide_1", ...stored }] };
      }
    }

    return { success: true, slides: defaultSlides };
  } catch (err: any) {
    console.error("getAdminBannerContentAction error:", err);
    return { success: false, error: "Failed to load banner content." };
  }
}

export async function updateAdminBannerContentAction(slides: any[]) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.websiteSettings.upsert({
      where: { key: "homepage_banner" },
      update: { value: { slides } },
      create: { key: "homepage_banner", value: { slides } },
    });

    revalidatePath("/");
    return { success: true, message: "Homepage banner slides updated successfully!" };
  } catch (err: any) {
    console.error("updateAdminBannerContentAction error:", err);
    return { success: false, error: "Failed to update homepage banner." };
  }
}

export async function uploadBannerImageAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file selected." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await storageProvider.uploadFile(buffer, file.name, "banners");
    return { success: true, url: result.publicUrl };
  } catch (err: any) {
    console.error("uploadBannerImageAction error:", err);
    return { success: false, error: "Failed to upload image file." };
  }
}

// 3.5. COMPLETE HOMEPAGE MANAGEMENT SERVER ACTIONS (ALL 8 SECTIONS)
export async function getAdminHomepageManagementAction() {
  try {
    const keys = [
      "homepage_banner",
      "homepage_stats",
      "homepage_programs",
      "homepage_about",
      "homepage_why_choose",
      "homepage_how_it_works",
      "homepage_coaches",
      "homepage_faqs",
      "homepage_testimonials",
    ];

    const settings = await db.websiteSettings.findMany({
      where: { key: { in: keys } },
    });

    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // 1. BANNER SLIDES
    const defaultSlides = [
      {
        id: "slide_1",
        badgeText: "ONLINE FITNESS & MARTIAL ARTS ACADEMY",
        titleMain: "Train Anywhere.",
        titleHighlight: "Transform Yourself!",
        subtitle: "Join live, interactive Martial Arts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official certifications, and world-class instructors.",
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
        subtitle: "Interactive training with expert instructors. Kids, Adults, and Ladies Only dedicated batches.",
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
        subtitle: "Female-led high energy HIIT workouts, fat loss challenges, and real-world self-defense techniques.",
        primaryCtaText: "Join Ladies Batch",
        primaryCtaLink: "/programs#ladies",
        secondaryCtaText: "Contact Support",
        secondaryCtaLink: "/contact",
        imageUrl: "/images/ladies_fitness.png",
        isEnabled: true,
      },
    ];
    let bannerSlides = defaultSlides;
    if (settingsMap["homepage_banner"]?.slides && Array.isArray(settingsMap["homepage_banner"].slides)) {
      bannerSlides = settingsMap["homepage_banner"].slides;
    }

    // 1.5 ACADEMY METRICS & STATS
    const defaultStatsSection = {
      headingBadge: "Academy Metrics & Impact",
      headingTitle: "Proven Excellence Worldwide",
      headingSubtitle: "Transforming lives daily through high-energy live Zoom training, real-time coaching, and official belt advancement.",
      items: [
        { id: "stat_1", value: "2,000+", label: "Active Students" },
        { id: "stat_2", value: "98%", label: "Belt Pass Rate" },
        { id: "stat_3", value: "4.9 / 5", label: "Satisfaction" },
        { id: "stat_4", value: "50+", label: "Live Classes Every Wk" },
        { id: "stat_5", value: "20+", label: "Expert Coaches" },
      ],
    };
    const statsSection = settingsMap["homepage_stats"] || defaultStatsSection;

    // 2. EXPLORE OUR PROGRAMS
    const defaultProgramsSection = {
      headingBadge: "Training Pathways",
      headingTitle: "Explore Our Programs",
      headingSubtitle: "Structured live virtual training paths with customizable weekly schedule frequencies from 1 to 5 Days / Week.",
      items: [
        {
          id: "kids",
          title: "Kids Martial Arts (8-20)",
          category: "MARTIAL ARTS",
          image: "/images/kids_martial_arts.png",
          description: "Build confidence, discipline, focus, and physical coordination in a safe online virtual class environment.",
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
          description: "Master striking techniques, self defense maneuvers, physical conditioning, and martial arts syllabus mastery.",
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
          description: "Empowering female-only live sessions focusing on self-defense, weight management, toning, and personal safety.",
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
          description: "High-intensity calorie-burning workouts designed for fat loss, stamina, and lean muscle building.",
          classes: "4 - 20 Live Sessions",
          duration: "1 - 5 Days / Wk",
          priceStartsUSD: "25",
          href: "/programs?cat=hiit&audience=adults",
        },
      ],
    };
    const programsSection = settingsMap["homepage_programs"] || defaultProgramsSection;

    // 3. ABOUT SELFFITS ACADEMY
    const defaultAboutSection = {
      badgeText: "About SELFFITS Academy",
      headingTitle: "Structured Virtual Martial Arts & Fitness Academy",
      description: "SELFFITS was founded to bring authentic martial arts discipline and high-energy fitness training directly into homes around the globe. We eliminate recorded video fatigue by conducting 100% interactive live sessions.",
      imageUrl: "/images/kids_martial_arts.png",
      ctaText: "Read Our Full Story",
      ctaLink: "/about",
      features: [
        {
          title: "Real-Time Form Correction",
          subtitle: "Coaches observe and guide every stance live.",
          iconType: "check_red",
        },
        {
          title: "Official Belt Certificates",
          subtitle: "Earn recognized certifications upon completion.",
          iconType: "check_blue",
        },
      ],
    };
    const aboutSection = settingsMap["homepage_about"] || defaultAboutSection;

    // 4. WHY CHOOSE SELFFITS?
    const defaultWhyChooseSection = {
      headingBadge: "Academy Value",
      headingTitle: "Why Choose SELFFITS?",
      items: [
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
      ],
    };
    const whyChooseSection = settingsMap["homepage_why_choose"] || defaultWhyChooseSection;

    // 5. HOW SELFFITS WORKS
    const defaultHowItWorksSection = {
      headingBadge: "Structured Academy Pathway",
      headingTitle: "How SELFFITS Works",
      headingSubtitle: "Simple 6-step roadmap from selecting your weekly schedule to belt progression examinations.",
      steps: [
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
          description: "Attend your live online martial arts training through Google Meet with real-time instructor feedback.",
        },
        {
          stepNumber: "05",
          title: "5. Complete 25 Classes → Attend Grading",
          description: "After completing every 25 classes, you become eligible to attend your official grading examination.",
        },
        {
          stepNumber: "06",
          title: "6. Progress Through the Belt Levels 🥋",
          description: "With each successful grading, your belt level progresses: White → Yellow → Green → Blue → Brown → Black.",
        },
      ],
    };
    const howItWorksSection = settingsMap["homepage_how_it_works"] || defaultHowItWorksSection;

    // 6. MEET OUR MASTER COACHES
    const defaultCoachesSection = {
      headingBadge: "World Class Instructors",
      headingTitle: "Meet Our Master Coaches",
      headingSubtitle: "Swipe or click to meet our black belt senseis and master fitness trainers.",
      items: [
        {
          id: "rahul",
          name: "Sensei Rahul Sharma",
          role: "Head Martial Arts Instructor",
          experience: "14+ Years Teaching",
          rank: "4th Dan Black Belt",
          rating: "4.9",
          statusBadge: "Live Form Evaluation Active",
          image: "/images/adults_martial_arts.png",
          bio: "Former national champion specializing in Taekwondo, Karate, and real-time stance evaluation.",
          specialty: "Martial Arts & Skills Progression",
        },
        {
          id: "sarah",
          name: "Sarah Jenkins",
          role: "Lead Fitness & HIIT Coach",
          experience: "9+ Years Master Coaching",
          rank: "Certified Master Trainer",
          rating: "4.9",
          statusBadge: "Live Form Evaluation Active",
          image: "/images/ladies_fitness.png",
          bio: "Transformation specialist focusing on female fitness, fat loss challenges, and conditioning.",
          specialty: "Fitness & Weight Management",
        },
        {
          id: "kenji",
          name: "Master Kenji Sato",
          role: "Kickboxing & Self Defense Lead",
          experience: "12+ Years Experience",
          rank: "3rd Dan Black Belt",
          rating: "4.9",
          statusBadge: "Live Form Evaluation Active",
          image: "/images/hero1.jpg",
          bio: "Expert in strike mechanics, rapid reaction drills, and practical self-defense for all age groups.",
          specialty: "Combat Self Defense",
        },
        {
          id: "priya",
          name: "Priya Kapoor",
          role: "Ladies Only Fitness Coach",
          experience: "8+ Years Coaching",
          rank: "Aerobics & HIIT Specialist",
          rating: "4.9",
          statusBadge: "Live Form Evaluation Active",
          image: "/images/ladies_fitness.png",
          bio: "Dedicated instructor empowering women worldwide through energetic online workout routines.",
          specialty: "Ladies Special Batches",
        },
        {
          id: "alex",
          name: "Master Alex Vance",
          role: "Kids Martial Arts Mentor",
          experience: "10+ Years Experience",
          rank: "2nd Dan Black Belt",
          rating: "4.9",
          statusBadge: "Live Form Evaluation Active",
          image: "/images/kids_martial_arts.png",
          bio: "Specialist in youth discipline, agility building, and virtual skills examination preparation.",
          specialty: "Youth Martial Arts Academy",
        },
        {
          id: "elena",
          name: "Elena Rostova",
          role: "Core Conditioning Specialist",
          experience: "11+ Years Experience",
          rank: "Master Mobility Trainer",
          rating: "4.9",
          statusBadge: "Live Form Evaluation Active",
          image: "/images/weight_loss_hiit.png",
          bio: "Passionate trainer focusing on core strength, muscle stamina building, and posture alignment.",
          specialty: "Core Strength & Fat Shred",
        },
      ],
    };
    const coachesSection = settingsMap["homepage_coaches"] || defaultCoachesSection;

    // 7. FREQUENTLY ASKED QUESTIONS
    const defaultFaqsSection = {
      headingBadge: "Got Questions?",
      headingTitle: "Frequently Asked Questions",
      items: [
        {
          question: "How do live online classes work at SELFFITS?",
          answer: "All classes are held live over Zoom Classes. Once you enroll, you get instant access to your Student Dashboard where today's active live link is displayed 15 minutes before class time. Simply click 'Join Class' to enter your session.",
        },
        {
          question: "Do I need prior martial arts experience or special equipment?",
          answer: "No prior experience is required! Our programs are designed for all levels from complete beginners to advanced practitioners. Basic comfortable athletic clothing and a clear 6x6 ft space at home is all you need to start.",
        },
        {
          question: "Can kids and adults take classes together?",
          answer: "We maintain separate dedicated batches tailored to different age groups and needs: Kids Martial Arts (Ages 8-20), Adults Martial Arts (21+), and Ladies Only Programs.",
        },
        {
          question: "How are Program Completion Certificates issued?",
          answer: "Upon completing your required class count and passing your live virtual skills evaluation with Sensei, official Program Completion Certificates are uploaded directly to your Student Dashboard for high-resolution download.",
        },
        {
          question: "What payment methods do you support?",
          answer: "We support all major payment options globally via Razorpay, including Indian UPI, Credit/Debit Cards, Netbanking, and International Multi-Currency (USD/INR) credit cards.",
        },
      ],
    };
    const faqsSection = settingsMap["homepage_faqs"] || defaultFaqsSection;

    // 8. SUCCESS STORIES & TESTIMONIALS
    const defaultTestimonialsSection = {
      headingBadge: "Success Stories",
      headingTitle: "What Our Students Say",
      headingSubtitle: "Real transformations from students and parents training across the globe.",
      items: [
        {
          id: "test_1",
          quote: "SELFFITS changed my 12-year-old son's routine completely. He passed his curriculum evaluation right from our living room!",
          name: "Priya Nair",
          role: "Parent of Kid Student",
          stars: 5,
          achievement: "Level 3 Mastery Earned",
        },
        {
          id: "test_2",
          quote: "The 5 Days / Week Weight Loss program helped me lose 6 kg while boosting my energy levels. The live trainers correct form in real time!",
          name: "David Miller",
          role: "Adult Student (USA)",
          stars: 5,
          achievement: "5-Day Transformation",
        },
        {
          id: "test_3",
          quote: "The Ladies Only batch is super comfortable and high energy. I feel so much stronger and confident in self-defense.",
          name: "Ananya Roy",
          role: "Ladies Batch Student",
          stars: 5,
          achievement: "Advanced Scholar",
        },
      ],
    };
    const testimonialsSection = settingsMap["homepage_testimonials"] || defaultTestimonialsSection;

    return {
      success: true,
      homepageData: {
        banner: { slides: bannerSlides },
        stats: statsSection,
        programs: programsSection,
        about: aboutSection,
        whyChoose: whyChooseSection,
        howItWorks: howItWorksSection,
        coaches: coachesSection,
        faqs: faqsSection,
        testimonials: testimonialsSection,
      },
    };
  } catch (err: any) {
    console.error("getAdminHomepageManagementAction error:", err);
    return { success: false, error: "Failed to load homepage settings." };
  }
}

export async function updateAdminHomepageSectionAction(sectionKey: string, data: any) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const validKeys = [
      "homepage_banner",
      "homepage_stats",
      "homepage_programs",
      "homepage_about",
      "homepage_why_choose",
      "homepage_how_it_works",
      "homepage_coaches",
      "homepage_faqs",
      "homepage_testimonials",
    ];

    if (!validKeys.includes(sectionKey)) {
      return { success: false, error: `Invalid homepage section key: ${sectionKey}` };
    }

    await db.websiteSettings.upsert({
      where: { key: sectionKey },
      update: { value: data },
      create: { key: sectionKey, value: data },
    });

    revalidatePath("/");
    revalidatePath("/coaches");
    revalidatePath("/programs");
    return { success: true, message: "Section published successfully!" };
  } catch (err: any) {
    console.error("updateAdminHomepageSectionAction error:", err);
    return { success: false, error: "Failed to save section content." };
  }
}

export async function uploadHomepageImageAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file selected." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await storageProvider.uploadFile(buffer, file.name, "homepage");
    return { success: true, url: result.publicUrl };
  } catch (err: any) {
    console.error("uploadHomepageImageAction error:", err);
    return { success: false, error: "Failed to upload image file." };
  }
}

// 4. COACH MANAGEMENT ACTIONS
// 4. COACH MANAGEMENT ACTIONS
export async function getAdminCoachesAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const coaches = await db.coachApplication.findMany({
      where: {
        status: { in: ["APPROVED", "SUSPENDED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = coaches.map((c) => {
      const disciplinesArray = Array.isArray(c.disciplines)
        ? (c.disciplines as string[])
        : typeof c.disciplines === "string"
        ? [c.disciplines]
        : [];

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        highestRank: c.highestRank || "Certified Instructor",
        rawDisciplines: disciplinesArray,
        disciplines: disciplinesArray.length > 0 ? disciplinesArray.join(", ") : "Fitness / Functional Training",
        experience: c.totalExperience || "5+ Years",
        status: c.status,
        isSuspended: c.status === "SUSPENDED",
        resumeUrl: c.resumeUrl || c.qualificationCertsUrl || null,
        createdAt: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
    });

    return { success: true, coaches: formatted };
  } catch (err: any) {
    console.error("getAdminCoachesAction error:", err);
    return { success: false, error: "Failed to fetch coaches list." };
  }
}

export async function toggleSuspendCoachAction(coachId: string, suspend: boolean) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const newStatus = suspend ? "SUSPENDED" : "APPROVED";

    await db.coachApplication.update({
      where: { id: coachId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/coaches");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: suspend
        ? "Coach account suspended successfully."
        : "Coach account reactivated successfully.",
    };
  } catch (err: any) {
    console.error("toggleSuspendCoachAction error:", err);
    return { success: false, error: "Failed to update coach status." };
  }
}

export async function deleteCoachAccountAction(coachId: string) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.coachApplication.delete({
      where: { id: coachId },
    });

    revalidatePath("/admin/coaches");
    revalidatePath("/admin/dashboard");

    return { success: true, message: "Coach account permanently deleted." };
  } catch (err: any) {
    console.error("deleteCoachAccountAction error:", err);
    return { success: false, error: "Failed to delete coach account." };
  }
}

export async function updateCoachDisciplinesAction(coachId: string, disciplines: string[]) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const safeDisciplines = JSON.parse(JSON.stringify(disciplines));

    await db.coachApplication.update({
      where: { id: coachId },
      data: { disciplines: safeDisciplines },
    });

    revalidatePath("/admin/coaches");

    return { success: true, message: "Coach specializations updated successfully." };
  } catch (err: any) {
    console.error("updateCoachDisciplinesAction error:", err);
    return { success: false, error: "Failed to update coach specializations." };
  }
}

// 5. COACH APPLICATIONS & REGISTRATION LEADS
export async function getAdminCoachApplicationsAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    // Exclude APPROVED applications from leads/applications list (they belong in Active Coaches)
    const applications = await db.coachApplication.findMany({
      where: {
        status: { not: "APPROVED" },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = applications.map((app) => {
      const disciplinesArray = Array.isArray(app.disciplines)
        ? (app.disciplines as string[])
        : typeof app.disciplines === "string"
        ? [app.disciplines]
        : [];

      const targetAgeGroupsArray = Array.isArray(app.targetAgeGroups)
        ? (app.targetAgeGroups as string[])
        : typeof app.targetAgeGroups === "string"
        ? [app.targetAgeGroups]
        : [];

      return {
        id: app.id,
        fullName: app.fullName,
        gender: app.gender || null,
        nationality: app.nationality || null,
        phone: app.phone,
        email: app.email,
        location: app.location || null,
        profilePhotoUrl: app.profilePhotoUrl || null,

        rawDisciplines: disciplinesArray,
        disciplines: disciplinesArray.length > 0 ? disciplinesArray.join(", ") : "Martial Arts & Fitness",

        highestRank: app.highestRank || "N/A",
        totalExperience: app.totalExperience || "N/A",
        targetAgeGroups: targetAgeGroupsArray,

        availability: app.availability || {},

        instagramUrl: app.instagramUrl || null,
        facebookUrl: app.facebookUrl || null,
        youtubeUrl: app.youtubeUrl || null,
        websiteUrl: app.websiteUrl || null,
        trainingVideoUrl: app.trainingVideoUrl || null,

        resumeUrl: app.resumeUrl || null,
        qualificationCertsUrl: app.qualificationCertsUrl || null,
        licenseUrl: app.licenseUrl || null,
        idPassportUrl: app.idPassportUrl || null,

        agreedDeclaration: app.agreedDeclaration,
        status: app.status,
        appliedDate: app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        createdAt: app.createdAt.toISOString(),
      };
    });

    return { success: true, applications: formatted };
  } catch (err: any) {
    console.error("getAdminCoachApplicationsAction error:", err);
    return { success: false, error: "Failed to fetch coach applications." };
  }
}

export async function updateCoachApplicationStatusAction(id: string, status: "APPROVED" | "REJECTED") {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.coachApplication.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/coach-applications");
    revalidatePath("/admin/coaches");
    return { success: true, message: `Application ${status.toLowerCase()} successfully.` };
  } catch (err: any) {
    console.error("updateCoachApplicationStatusAction error:", err);
    return { success: false, error: "Failed to update application status." };
  }
}

// 6 & 7. COURSE / PROGRAM & PRICING MANAGEMENT ACTIONS
export async function getAdminProgramsAction() {
  try {
    const plans = await db.membershipPlan.findMany({
      include: {
        program: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { priceINR: "asc" },
    });

    const formatted = plans.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.program?.category || "MARTIAL_ARTS",
      tierType: p.tierType,
      durationMonths: p.durationMonths,
      totalClasses: p.totalClasses,
      priceINR: Number(p.priceINR),
      priceUSD: Number(p.priceUSD),
      isActive: p.isActive,
      enrolledStudents: p._count.enrollments,
    }));

    return { success: true, programs: formatted };
  } catch (err: any) {
    console.error("getAdminProgramsAction error:", err);
    return { success: false, error: "Failed to fetch programs list." };
  }
}

function isLegacyCourseItem(c: any) {
  if (!c || typeof c !== "object") return true;
  const title = (c.title || "").toLowerCase();
  const badge = (c.badge || c.daysBadge || c.belt || "").toLowerCase();
  return (
    title.includes("belt") ||
    title.includes("challenge") ||
    title.includes("1 month course") ||
    title.includes("3 months course") ||
    title.includes("6 month course") ||
    title.includes("12 months course") ||
    badge.includes("belt") ||
    badge.includes("challenge")
  );
}

function sanitizeCatalogData(cat: any) {
  if (!cat || typeof cat !== "object") return null;
  const cleaned: any = {};

  if (cat.mmaData) {
    cleaned.mmaData = {};
    for (const key of ["kids", "adults", "ladies"]) {
      if (cat.mmaData[key]) {
        cleaned.mmaData[key] = {
          ...cat.mmaData[key],
          courses: (cat.mmaData[key].courses || []).filter((c: any) => !isLegacyCourseItem(c)),
        };
      }
    }
  }

  if (cat.hiitData) {
    if (Array.isArray(cat.hiitData)) {
      cleaned.hiitData = cat.hiitData.filter((c: any) => !isLegacyCourseItem(c));
    } else if (typeof cat.hiitData === "object") {
      cleaned.hiitData = {};
      for (const key of ["kids", "adults", "ladies"]) {
        if (cat.hiitData[key]) {
          cleaned.hiitData[key] = {
            ...cat.hiitData[key],
            courses: (cat.hiitData[key].courses || []).filter((c: any) => !isLegacyCourseItem(c)),
          };
        }
      }
    }
  }

  return cleaned;
}

export async function getAdminProgramsCatalogAction() {
  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: "programs_catalog" },
    });

    if (setting && setting.value) {
      const sanitized = sanitizeCatalogData(setting.value);
      return { success: true, catalog: sanitized };
    }

    return { success: true, catalog: null };
  } catch (err: any) {
    console.error("getAdminProgramsCatalogAction error:", err);
    return { success: false, error: "Failed to fetch programs catalog." };
  }
}

export async function updateAdminProgramsCatalogAction(catalogData: any) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.websiteSettings.upsert({
      where: { key: "programs_catalog" },
      update: { value: catalogData },
      create: { key: "programs_catalog", value: catalogData },
    });

    revalidatePath("/programs");
    revalidatePath("/admin/programs");
    return { success: true, message: "Course catalog updated successfully!" };
  } catch (err: any) {
    console.error("updateAdminProgramsCatalogAction error:", err);
    return { success: false, error: "Failed to update course catalog." };
  }
}

// Helper to get formatted program category display name
function getProgramCategoryLabel(program?: { category?: string; targetAudience?: string; title?: string } | null) {
  if (!program) return "General Program";
  if (program.targetAudience === "KIDS") return "Kids Martial Arts";
  if (program.targetAudience === "LADIES_ONLY") return "Ladies Only Programs";
  if (program.category === "FITNESS_WEIGHT_LOSS" || program.category === "FITNESS_HIIT") return "Fitness & Weight Management";
  if (program.category === "MARTIAL_ARTS") return "Adults Martial Arts";
  return program.title || "Martial Arts & Fitness";
}

// Helper to format program level or tier name
function getProgramLevelName(tierType?: string | null, planName?: string | null) {
  if (planName && planName.trim() && !planName.toLowerCase().includes("belt") && !planName.toLowerCase().includes("challenge")) return planName.trim();
  if (!tierType) return "Standard Plan";
  switch (tierType) {
    case "YELLOW_BELT": return "1 Day / Week";
    case "BLUE_BELT": return "3 Days / Week";
    case "PURPLE_BELT": return "4 Days / Week";
    case "BROWN_BELT": return "5 Days / Week";
    case "CHALLENGE_8": return "1 Day / Week";
    case "CHALLENGE_24": return "3 Days / Week";
    case "CHALLENGE_48": return "4 Days / Week";
    case "TRANSFORMATION_96": return "5 Days / Week";
    default: return tierType.replace(/_/g, " ");
  }
}

// 8. STUDENT REGISTRATIONS & MANAGEMENT SYSTEM
export async function getAdminStudentsAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: true,
        enrollments: {
          orderBy: { createdAt: "desc" },
          include: {
            membershipPlan: {
              include: {
                program: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const formattedStudents = students.map((std) => {
      const activeEnrollment = std.enrollments.find(
        (e) => e.status === "ACTIVE" && new Date(e.endDate) >= new Date()
      );

      const hasExpiredEnrollments =
        !activeEnrollment &&
        std.enrollments.length > 0 &&
        std.enrollments.some(
          (e) => e.status === "EXPIRED" || new Date(e.endDate) < new Date() || e.remainingClasses <= 0
        );

      let enrollmentStatus: "ACTIVE" | "EXPIRED" | "UNENROLLED" = "UNENROLLED";
      if (activeEnrollment) {
        enrollmentStatus = "ACTIVE";
      } else if (hasExpiredEnrollments) {
        enrollmentStatus = "EXPIRED";
      }

      const totalSpentNum = std.payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((acc, p) => acc + Number(p.amount), 0);

      const formattedEnrollments = std.enrollments.map((e) => {
        const prg = e.membershipPlan?.program;
        const totalGranted = e.totalClassesGranted || 0;
        const remaining = e.remainingClasses || 0;
        const completed = Math.max(0, totalGranted - remaining);

        const joinedDateFormatted = e.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const joinedTimeFormatted = e.createdAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return {
          id: e.id,
          programTitle: prg?.title || e.membershipPlan?.name || "Martial Arts Program",
          programCategory: prg?.category || "MARTIAL_ARTS",
          categoryLabel: getProgramCategoryLabel(prg),
          membershipPlanName: e.membershipPlan?.name || getProgramLevelName(e.membershipPlan?.tierType),
          courseLevel: getProgramLevelName(e.membershipPlan?.tierType, e.membershipPlan?.name),
          startDate: e.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          endDate: e.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          rawEndDate: e.endDate.toISOString(),
          joinedTimestamp: `Joined: ${joinedDateFormatted} • ${joinedTimeFormatted}`,
          totalClassesGranted: totalGranted,
          remainingClasses: remaining,
          completedClasses: completed,
          status: e.status,
        };
      });

      const formattedPayments = std.payments.map((p) => ({
        id: p.id,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId || "Direct Auth",
        amount: Number(p.amount),
        currency: p.currency,
        formattedAmount: `${p.currency === "USD" ? "$" : "₹"}${p.amount}`,
        status: p.status,
        date: p.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      const activePrg = activeEnrollment?.membershipPlan?.program;

      const activeClassTiming = activeEnrollment
        ? activeEnrollment.classTiming || "03:30 PM to 04:15 PM (GMT)"
        : null;

      const activeJoinedDate = activeEnrollment
        ? activeEnrollment.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;
      const activeJoinedTime = activeEnrollment
        ? activeEnrollment.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        : null;
      const activeEnrollmentFullTimestamp = activeEnrollment
        ? `Joined: ${activeJoinedDate} • ${activeJoinedTime}`
        : null;

      const activeCourseLevel = activeEnrollment
        ? getProgramLevelName(activeEnrollment.membershipPlan?.tierType, activeEnrollment.membershipPlan?.name)
        : null;

        const activeSelectedDays = activeEnrollment && Array.isArray(activeEnrollment.selectedDays)
          ? (activeEnrollment.selectedDays as string[])
          : ["Sunday", "Wednesday", "Saturday"];

        return {
          id: std.id,
          name: std.name,
          firstName: std.firstName || "",
          lastName: std.lastName || "",
          email: std.email,
          phone: std.studentProfile?.phone || "Not provided",
          country: std.studentProfile?.country || "Not specified",
          city: std.studentProfile?.city || "Not specified",
          age: std.studentProfile?.age ? `${std.studentProfile.age} Yrs` : "Not specified",
          gender: std.studentProfile?.gender || "Not specified",
          emergencyContact: std.studentProfile?.emergencyContact || "None",
          isBlocked: std.isBlocked || false,
          accountStatus: std.isBlocked ? "BLOCKED" : "ACTIVE",
          joinedDate: std.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          enrollmentStatus,
          activeProgram: activePrg?.title || activeEnrollment?.membershipPlan?.name || (hasExpiredEnrollments ? "Expired Membership" : "Unenrolled"),
          activeCategory: activePrg?.category || null,
          activeCategoryLabel: activeEnrollment ? getProgramCategoryLabel(activePrg) : "None",
          activeCourseLevel: activeCourseLevel || "Standard Level",
          activeClassTiming: activeClassTiming || "03:30 PM to 04:15 PM (GMT)",
          activeDaysPerWeek: activeEnrollment?.daysPerWeek || 3,
          activeSelectedDays: activeSelectedDays,
          activeSelectedBatch: activeEnrollment?.selectedBatch || activeClassTiming || "2nd Batch — 02:30 PM to 03:30 PM (GMT)",
          activeMonthlyPrice: activeEnrollment?.monthlyPrice ? Number(activeEnrollment.monthlyPrice) : null,
          activeTimezone: activeEnrollment?.timezone || "GMT (UTC+0)",
          activeEnrollmentFullTimestamp,
          totalEnrollments: std.enrollments.length,
          remainingClasses: activeEnrollment ? activeEnrollment.remainingClasses : 0,
          totalClasses: activeEnrollment ? activeEnrollment.totalClassesGranted : 0,
          completedClasses: activeEnrollment
            ? Math.max(0, activeEnrollment.totalClassesGranted - activeEnrollment.remainingClasses)
            : 0,
          expiryDate: activeEnrollment
            ? activeEnrollment.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : null,
          totalSpentNum,
          totalSpent: `₹${totalSpentNum.toLocaleString("en-IN")}`,
          enrollments: formattedEnrollments,
          payments: formattedPayments,
        };
      });

    return { success: true, students: formattedStudents };
  } catch (err: any) {
    console.error("getAdminStudentsAction error:", err);
    return { success: false, error: "Failed to fetch students list." };
  }
}

export async function getAdminStudentCategoriesAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const programs = await db.program.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        targetAudience: true,
      },
      orderBy: { title: "asc" },
    });

    const categorySet = new Set<string>();
    categorySet.add("Kids Martial Arts");
    categorySet.add("Adults Martial Arts");
    categorySet.add("Ladies Only Programs");
    categorySet.add("Fitness & Weight Management");

    programs.forEach((p) => {
      const label = getProgramCategoryLabel(p);
      if (label) categorySet.add(label);
    });

    return {
      success: true,
      categories: Array.from(categorySet),
      programs: programs.map((p) => ({
        id: p.id,
        title: p.title,
        categoryLabel: getProgramCategoryLabel(p),
      })),
    };
  } catch (err: any) {
    console.error("getAdminStudentCategoriesAction error:", err);
    return { success: false, error: "Failed to fetch program categories." };
  }
}

export async function toggleBlockStudentAction(userId: string, isBlocked: boolean) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const student = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!student || student.role !== "STUDENT") {
      return { success: false, error: "Target student account not found." };
    }

    await db.user.update({
      where: { id: userId },
      data: { isBlocked },
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: isBlocked
        ? `Student (${student.email}) has been blocked successfully.`
        : `Student (${student.email}) has been unblocked successfully.`,
    };
  } catch (err: any) {
    console.error("toggleBlockStudentAction error:", err);
    return { success: false, error: "Failed to update student block status." };
  }
}


// 9. PAYMENT MANAGEMENT ACTIONS
export async function getAdminPaymentsAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const payments = await db.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        enrollment: {
          include: { membershipPlan: { select: { name: true } } },
        },
      },
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      studentName: p.user.name,
      studentEmail: p.user.email,
      courseName: p.enrollment?.membershipPlan?.name || "Martial Arts Enrollment",
      amount: `${p.currency === "USD" ? "$" : "₹"}${p.amount}`,
      status: p.status,
      razorpayOrderId: p.razorpayOrderId,
      paymentId: p.razorpayPaymentId || "Direct Card Auth",
      date: p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    }));

    return { success: true, payments: formatted };
  } catch (err: any) {
    console.error("getAdminPaymentsAction error:", err);
    return { success: false, error: "Failed to fetch payment records." };
  }
}
