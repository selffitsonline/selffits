import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  roleEnumEnsured?: boolean;
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const client = globalForPrisma.prisma ?? prismaClientSingleton();

globalForPrisma.prisma = client;

export async function ensureDatabaseEnums() {
  if (globalForPrisma.roleEnumEnsured) return;
  try {
    await client.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COACH';`);
    await client.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';`);
    globalForPrisma.roleEnumEnsured = true;
  } catch (err) {
    // Graceful ignore if unsupported or already exists
  }
}

export const db = client;
