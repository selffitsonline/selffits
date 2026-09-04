import { PrismaClient, Role, ProgramCategory, AgeGroup, MembershipTier, EnrollmentStatus, PaymentStatus, CoachAppStatus, BatchStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with programs, plans, active student enrollments, and payments...");

  // Wipe obsolete saved catalog settings so outdated belt/challenge cards are cleared
  await prisma.websiteSettings.deleteMany({
    where: { key: "programs_catalog" },
  });

  const superAdminPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // 1. Super Admin Account
  await prisma.user.upsert({
    where: { email: "superadmin@selffits.com" },
    update: {},
    create: {
      firstName: "Super",
      lastName: "Admin",
      name: "Super Admin",
      email: "superadmin@selffits.com",
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  // 2. Admin Account
  await prisma.user.upsert({
    where: { email: "admin@selffits.com" },
    update: {},
    create: {
      firstName: "Academy",
      lastName: "Admin",
      name: "Academy Admin",
      email: "admin@selffits.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  // 3. Programs
  const kungFuPrg = await prisma.program.upsert({
    where: { slug: "kung-fu-mastery" },
    update: {},
    create: {
      title: "Kung Fu",
      slug: "kung-fu-mastery",
      category: ProgramCategory.MARTIAL_ARTS,
      targetAudience: AgeGroup.ADULTS,
      description: "Traditional Shaolin Kung Fu stance, forms, and combat technique training.",
    },
  });

  const karatePrg = await prisma.program.upsert({
    where: { slug: "karate-kids" },
    update: {},
    create: {
      title: "Karate",
      slug: "karate-kids",
      category: ProgramCategory.MARTIAL_ARTS,
      targetAudience: AgeGroup.KIDS,
      description: "Shotokan Karate skills program for kids and teenagers.",
    },
  });

  const taekwondoPrg = await prisma.program.upsert({
    where: { slug: "taekwondo-adults" },
    update: {},
    create: {
      title: "Taekwondo",
      slug: "taekwondo-adults",
      category: ProgramCategory.MARTIAL_ARTS,
      targetAudience: AgeGroup.ADULTS,
      description: "Dynamic kicks, sparring, and official skills certifications.",
    },
  });

  const ladiesFitnessPrg = await prisma.program.upsert({
    where: { slug: "ladies-fitness-hiit" },
    update: {},
    create: {
      title: "Fitness & Weight Management",
      slug: "ladies-fitness-hiit",
      category: ProgramCategory.FITNESS_HIIT,
      targetAudience: AgeGroup.LADIES_ONLY,
      description: "High-intensity calorie burner and female self-defense program.",
    },
  });

  // 4. Membership Plans (1-5 Days / Week)
  const kungFuBlueBelt = await prisma.membershipPlan.upsert({
    where: { id: "plan-kungfu-blue" },
    update: { name: "3 Days / Week" },
    create: {
      id: "plan-kungfu-blue",
      programId: kungFuPrg.id,
      name: "3 Days / Week",
      tierType: MembershipTier.BLUE_BELT,
      durationMonths: 1,
      totalClasses: 12,
      priceINR: 4399,
      priceUSD: 55,
    },
  });

  const karateYellowBelt = await prisma.membershipPlan.upsert({
    where: { id: "plan-karate-yellow" },
    update: { name: "1 Day / Week" },
    create: {
      id: "plan-karate-yellow",
      programId: karatePrg.id,
      name: "1 Day / Week",
      tierType: MembershipTier.YELLOW_BELT,
      durationMonths: 1,
      totalClasses: 4,
      priceINR: 1999,
      priceUSD: 25,
    },
  });

  const taekwondoBrownBelt = await prisma.membershipPlan.upsert({
    where: { id: "plan-tkd-brown" },
    update: { name: "5 Days / Week" },
    create: {
      id: "plan-tkd-brown",
      programId: taekwondoPrg.id,
      name: "5 Days / Week",
      tierType: MembershipTier.BROWN_BELT,
      durationMonths: 1,
      totalClasses: 20,
      priceINR: 6799,
      priceUSD: 85,
    },
  });

  const ladiesChallenge8 = await prisma.membershipPlan.upsert({
    where: { id: "plan-ladies-c8" },
    update: { name: "2 Days / Week" },
    create: {
      id: "plan-ladies-c8",
      programId: ladiesFitnessPrg.id,
      name: "2 Days / Week",
      tierType: MembershipTier.CHALLENGE_8,
      durationMonths: 1,
      totalClasses: 8,
      priceINR: 3199,
      priceUSD: 40,
    },
  });

  // 5. Students & Active Enrollments
  // Student 1: Demo Student (Kung Fu - Blue Belt)
  const student1 = await prisma.user.upsert({
    where: { email: "student@selffits.com" },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Student",
      name: "Demo Student",
      email: "student@selffits.com",
      passwordHash: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: student1.id },
    update: {},
    create: {
      userId: student1.id,
      phone: "+91 9876543210",
      country: "India",
      city: "Mumbai",
    },
  });

  // Specific Joined Date/Time: Aug 26, 2026 @ 10:30 AM
  const joinDate1 = new Date("2026-08-26T10:30:00.000Z");
  const endDate1 = new Date("2027-02-26T10:30:00.000Z");

  const enroll1 = await prisma.enrollment.upsert({
    where: { id: "enrollment-demo-student" },
    update: {
      classTiming: "03:30 PM to 04:15 PM (GMT)",
      createdAt: joinDate1,
      startDate: joinDate1,
      endDate: endDate1,
      status: EnrollmentStatus.ACTIVE,
    },
    create: {
      id: "enrollment-demo-student",
      userId: student1.id,
      membershipPlanId: kungFuBlueBelt.id,
      classTiming: "03:30 PM to 04:15 PM (GMT)",
      startDate: joinDate1,
      endDate: endDate1,
      totalClassesGranted: 48,
      remainingClasses: 36,
      status: EnrollmentStatus.ACTIVE,
      createdAt: joinDate1,
    },
  });

  await prisma.payment.upsert({
    where: { razorpayOrderId: "order_demo_1001" },
    update: {},
    create: {
      userId: student1.id,
      enrollmentId: enroll1.id,
      razorpayOrderId: "order_demo_1001",
      razorpayPaymentId: "pay_demo_1001",
      amount: 14999,
      currency: "INR",
      status: PaymentStatus.SUCCESS,
      createdAt: joinDate1,
    },
  });

  // Student 2: Rahul Sharma (Karate - Yellow Belt)
  const student2 = await prisma.user.upsert({
    where: { email: "rahul@selffits.com" },
    update: {},
    create: {
      firstName: "Rahul",
      lastName: "Sharma",
      name: "Rahul Sharma",
      email: "rahul@selffits.com",
      passwordHash: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: student2.id },
    update: {},
    create: {
      userId: student2.id,
      phone: "+91 9812345678",
      country: "India",
      city: "Delhi",
    },
  });

  // Specific Joined Date/Time: Aug 26, 2026 @ 6:00 PM
  const joinDate2 = new Date("2026-08-26T18:00:00.000Z");
  const endDate2 = new Date("2026-11-26T18:00:00.000Z");

  const enroll2 = await prisma.enrollment.upsert({
    where: { id: "enrollment-rahul" },
    update: {
      classTiming: "06:00 PM to 06:45 PM (GMT)",
      createdAt: joinDate2,
      startDate: joinDate2,
      endDate: endDate2,
      status: EnrollmentStatus.ACTIVE,
    },
    create: {
      id: "enrollment-rahul",
      userId: student2.id,
      membershipPlanId: karateYellowBelt.id,
      classTiming: "06:00 PM to 06:45 PM (GMT)",
      startDate: joinDate2,
      endDate: endDate2,
      totalClassesGranted: 24,
      remainingClasses: 20,
      status: EnrollmentStatus.ACTIVE,
      createdAt: joinDate2,
    },
  });

  await prisma.payment.upsert({
    where: { razorpayOrderId: "order_rahul_1002" },
    update: {},
    create: {
      userId: student2.id,
      enrollmentId: enroll2.id,
      razorpayOrderId: "order_rahul_1002",
      razorpayPaymentId: "pay_rahul_1002",
      amount: 7999,
      currency: "INR",
      status: PaymentStatus.SUCCESS,
      createdAt: joinDate2,
    },
  });

  // Student 3: Priya Patel (Ladies HIIT - Challenge 8)
  const student3 = await prisma.user.upsert({
    where: { email: "priya@selffits.com" },
    update: {},
    create: {
      firstName: "Priya",
      lastName: "Patel",
      name: "Priya Patel",
      email: "priya@selffits.com",
      passwordHash: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: student3.id },
    update: {},
    create: {
      userId: student3.id,
      phone: "+91 9765432109",
      country: "India",
      city: "Bangalore",
    },
  });

  const joinDate3 = new Date("2026-08-25T09:15:00.000Z");
  const endDate3 = new Date("2026-10-25T09:15:00.000Z");

  const enroll3 = await prisma.enrollment.upsert({
    where: { id: "enrollment-priya" },
    update: {
      classTiming: "10:30 AM to 11:15 AM (GMT)",
      createdAt: joinDate3,
      startDate: joinDate3,
      endDate: endDate3,
      status: EnrollmentStatus.ACTIVE,
    },
    create: {
      id: "enrollment-priya",
      userId: student3.id,
      membershipPlanId: ladiesChallenge8.id,
      classTiming: "10:30 AM to 11:15 AM (GMT)",
      startDate: joinDate3,
      endDate: endDate3,
      totalClassesGranted: 16,
      remainingClasses: 12,
      status: EnrollmentStatus.ACTIVE,
      createdAt: joinDate3,
    },
  });

  await prisma.payment.upsert({
    where: { razorpayOrderId: "order_priya_1003" },
    update: {},
    create: {
      userId: student3.id,
      enrollmentId: enroll3.id,
      razorpayOrderId: "order_priya_1003",
      razorpayPaymentId: "pay_priya_1003",
      amount: 5999,
      currency: "INR",
      status: PaymentStatus.SUCCESS,
      createdAt: joinDate3,
    },
  });

  // 6. Approved Coaches
  const coach1 = await prisma.coachApplication.upsert({
    where: { id: "coach-master-rahul" },
    update: { status: CoachAppStatus.APPROVED },
    create: {
      id: "coach-master-rahul",
      fullName: "Master Rahul Sharma",
      email: "coach.rahul@selffits.com",
      phone: "+91 9876500001",
      disciplines: ["Kung Fu", "Taekwondo"],
      highestRank: "5th Dan Black Belt",
      totalExperience: "12+ Years",
      targetAgeGroups: ["ADULTS", "TEENS"],
      specializations: ["Shaolin Forms", "Sparring"],
      availability: ["Morning", "Evening"],
      status: CoachAppStatus.APPROVED,
    },
  });

  const coach2 = await prisma.coachApplication.upsert({
    where: { id: "coach-[#0080FF]-ananya" },
    update: { status: CoachAppStatus.APPROVED },
    create: {
      id: "coach-[#0080FF]-ananya",
      fullName: "Sensei Ananya Roy",
      email: "ananya.roy@selffits.com",
      phone: "+91 9876500002",
      disciplines: ["Karate", "Yoga"],
      highestRank: "3rd Dan Black Belt",
      totalExperience: "8+ Years",
      targetAgeGroups: ["KIDS", "LADIES_ONLY"],
      specializations: ["Kata", "Functional Fitness"],
      availability: ["Morning", "Evening"],
      status: CoachAppStatus.APPROVED,
    },
  });

  // 7. Batches & Student Assignments
  const batch1 = await prisma.batch.upsert({
    where: { batchId: "BATCH-KUNGFU-101" },
    update: { meetingUrl: "https://meet.google.com/selffits-kungfu-live" },
    create: {
      batchId: "BATCH-KUNGFU-101",
      name: "Kung Fu Shaolin Morning Batch",
      programId: kungFuPrg.id,
      membershipPlanId: kungFuBlueBelt.id,
      coachId: coach1.id,
      dayCombination: "Sunday & Wednesday",
      timeSlot: "Morning",
      clockTiming: "09:00 AM to 09:45 AM (GMT)",
      meetingUrl: "https://meet.google.com/selffits-kungfu-live",
      maxCapacity: 8,
      status: BatchStatus.ACTIVE,
    },
  });

  const batch2 = await prisma.batch.upsert({
    where: { batchId: "BATCH-KARATE-202" },
    update: { meetingUrl: "https://meet.google.com/selffits-karate-live" },
    create: {
      batchId: "BATCH-KARATE-202",
      name: "Karate Kids Evening Warriors",
      programId: karatePrg.id,
      membershipPlanId: karateYellowBelt.id,
      coachId: coach2.id,
      dayCombination: "Monday & Thursday",
      timeSlot: "Evening",
      clockTiming: "04:00 PM to 04:45 PM (GMT)",
      meetingUrl: "https://meet.google.com/selffits-karate-live",
      maxCapacity: 8,
      status: BatchStatus.ACTIVE,
    },
  });

  await prisma.batchStudent.upsert({
    where: { batchId_userId: { batchId: batch1.id, userId: student1.id } },
    update: {},
    create: {
      batchId: batch1.id,
      userId: student1.id,
    },
  });

  await prisma.batchStudent.upsert({
    where: { batchId_userId: { batchId: batch2.id, userId: student2.id } },
    update: {},
    create: {
      batchId: batch2.id,
      userId: student2.id,
    },
  });

  console.log("Seeding completed successfully with active student enrollments, belt levels, coaches, and batches!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
