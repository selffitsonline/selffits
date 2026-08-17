import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const superAdminPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // Super Admin Account
  await prisma.user.upsert({
    where: { email: "superadmin@selffits.com" },
    update: {},
    create: {
      firstName: "Super",
      lastName: "Admin",
      name: "Super Admin",
      email: "superadmin@selffits.com",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  // Admin Account
  await prisma.user.upsert({
    where: { email: "admin@selffits.com" },
    update: {},
    create: {
      firstName: "Academy",
      lastName: "Admin",
      name: "Academy Admin",
      email: "admin@selffits.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Verified Student Account
  const studentUser = await prisma.user.upsert({
    where: { email: "student@selffits.com" },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Student",
      name: "Demo Student",
      email: "student@selffits.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      emailVerified: new Date(),
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      phone: "+91 9876543210",
      country: "India",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
