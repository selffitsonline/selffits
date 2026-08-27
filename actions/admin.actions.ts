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
      planName: e.membershipPlan?.name || "Belt Tier",
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
        subtitle: "Join live, interactive Martial Arts Belts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official belt certifications, and world-class instructors.",
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
        titleMain: "Master Belt Ranks.",
        titleHighlight: "Earn Official Certification!",
        subtitle: "Interactive training with 4th Dan Black Belt Instructors. Kids, Adults, and Ladies Only dedicated batches.",
        primaryCtaText: "Explore Belt Programs",
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

// 4. COACH MANAGEMENT ACTIONS
export async function getAdminCoachesAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const approvedCoaches = await db.coachApplication.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });

    const formatted = approvedCoaches.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      highestRank: c.highestRank || "Certified Instructor",
      disciplines: Array.isArray(c.disciplines) ? c.disciplines.join(", ") : "Martial Arts & Fitness",
      experience: c.totalExperience || "5+ Years",
      status: "APPROVED",
      createdAt: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));

    return { success: true, coaches: formatted };
  } catch (err: any) {
    console.error("getAdminCoachesAction error:", err);
    return { success: false, error: "Failed to fetch coaches list." };
  }
}

// 5. COACH APPLICATIONS & RESUME DOWNLOADS
export async function getAdminCoachApplicationsAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const applications = await db.coachApplication.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = applications.map((app) => ({
      id: app.id,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      whatsappNumber: app.phone,
      resumeUrl: app.resumeUrl || app.qualificationCertsUrl || null,
      highestRank: app.highestRank || "N/A",
      totalExperience: app.totalExperience || "N/A",
      status: app.status,
      appliedDate: app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      disciplines: Array.isArray(app.disciplines) ? app.disciplines.join(", ") : "Martial Arts & Fitness",
    }));

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

export async function updateAdminProgramPricingAction(id: string, priceINR: number, priceUSD: number, isActive: boolean) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.membershipPlan.update({
      where: { id },
      data: {
        priceINR,
        priceUSD,
        isActive,
      },
    });

    revalidatePath("/programs");
    revalidatePath("/checkout");
    revalidatePath("/admin/programs");
    return { success: true, message: "Program pricing and status updated!" };
  } catch (err: any) {
    console.error("updateAdminProgramPricingAction error:", err);
    return { success: false, error: "Failed to update program pricing." };
  }
}

// 8. STUDENT REGISTRATIONS MANAGEMENT
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
        enrollments: {
          include: { membershipPlan: true },
        },
        payments: {
          where: { status: "SUCCESS" },
          select: { amount: true },
        },
      },
    });

    const formattedStudents = students.map((std) => {
      const activeEnrollment = std.enrollments.find((e) => e.status === "ACTIVE");
      const totalSpent = std.payments.reduce((acc, p) => acc + Number(p.amount), 0);

      return {
        id: std.id,
        name: std.name,
        email: std.email,
        joinedDate: std.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        activeProgram: activeEnrollment?.membershipPlan?.name || "Unenrolled",
        totalEnrollments: std.enrollments.length,
        remainingClasses: activeEnrollment ? activeEnrollment.remainingClasses : 0,
        totalClasses: activeEnrollment ? activeEnrollment.totalClassesGranted : 0,
        totalSpent: `₹${totalSpent}`,
        status: activeEnrollment ? "ACTIVE" : "REGISTERED",
      };
    });

    return { success: true, students: formattedStudents };
  } catch (err: any) {
    console.error("getAdminStudentsAction error:", err);
    return { success: false, error: "Failed to fetch students list." };
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
