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

// 2. MENU MANAGEMENT SERVER ACTIONS
export async function getAdminMenuItemsAction() {
  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: "header_menu" },
    });

    if (setting && setting.value) {
      return { success: true, menuItems: setting.value as any[] };
    }

    // Default Navigation Menu Structure
    const defaultMenu = [
      { id: "1", label: "Home", href: "/", order: 1, isEnabled: true },
      { id: "2", label: "Programs", href: "/programs", order: 2, isEnabled: true },
      { id: "3", label: "Coaches", href: "/coaches", order: 3, isEnabled: true },
      { id: "4", label: "About Us", href: "/about", order: 4, isEnabled: true },
      { id: "5", label: "Success Stories", href: "/success-stories", order: 5, isEnabled: true },
      { id: "6", label: "Become a Coach", href: "/become-coach", order: 6, isEnabled: true },
      { id: "7", label: "Contact", href: "/contact", order: 7, isEnabled: true },
    ];

    return { success: true, menuItems: defaultMenu };
  } catch (err: any) {
    console.error("getAdminMenuItemsAction error:", err);
    return { success: false, error: "Failed to load menu items." };
  }
}

export async function updateAdminMenuItemsAction(menuItems: any[]) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.websiteSettings.upsert({
      where: { key: "header_menu" },
      update: { value: menuItems },
      create: { key: "header_menu", value: menuItems },
    });

    revalidatePath("/", "layout");
    return { success: true, message: "Website menu navigation updated successfully!" };
  } catch (err: any) {
    console.error("updateAdminMenuItemsAction error:", err);
    return { success: false, error: "Failed to update menu navigation." };
  }
}

// 3. HOMEPAGE BANNER CONTENT ACTIONS
export async function getAdminBannerContentAction() {
  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: "homepage_banner" },
    });

    if (setting && setting.value) {
      return { success: true, banner: setting.value as any };
    }

    const defaultBanner = {
      title: "Master Authentic Martial Arts & Virtual Fitness",
      subtitle: "Join India's premier online martial arts academy. Live interactive training with certified master instructors from the comfort of your home.",
      ctaText: "Enroll & Start Training",
      ctaLink: "/programs",
      imageUrl: "/images/hero_banner.jpg",
      isEnabled: true,
    };

    return { success: true, banner: defaultBanner };
  } catch (err: any) {
    console.error("getAdminBannerContentAction error:", err);
    return { success: false, error: "Failed to load banner content." };
  }
}

export async function updateAdminBannerContentAction(bannerData: any) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.websiteSettings.upsert({
      where: { key: "homepage_banner" },
      update: { value: bannerData },
      create: { key: "homepage_banner", value: bannerData },
    });

    revalidatePath("/");
    return { success: true, message: "Homepage banner updated successfully!" };
  } catch (err: any) {
    console.error("updateAdminBannerContentAction error:", err);
    return { success: false, error: "Failed to update homepage banner." };
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
