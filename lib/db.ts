import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  roleEnumEnsured?: boolean;
  couponTablesEnsured?: boolean;
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

export async function ensureCouponTables() {
  if (globalForPrisma.couponTablesEnsured) return;
  try {
    const stmts = [
      `DO $$ BEGIN CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "description" TEXT,
        "discountType" "DiscountType" NOT NULL,
        "discountValue" DECIMAL(10,2) NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "startDate" TIMESTAMP(3),
        "expiryDate" TIMESTAMP(3),
        "maxUsageTotal" INTEGER,
        "maxUsagePerUser" INTEGER,
        "usageCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");`,
      `CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code");`,
      `CREATE INDEX IF NOT EXISTS "Coupon_isActive_idx" ON "Coupon"("isActive");`,
      `CREATE TABLE IF NOT EXISTS "CouponUsage" (
        "id" TEXT NOT NULL,
        "couponId" TEXT NOT NULL,
        "userId" TEXT,
        "userEmail" TEXT,
        "paymentId" TEXT,
        "orderId" TEXT,
        "discountApplied" DECIMAL(10,2) NOT NULL,
        "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "CouponUsage_couponId_orderId_key" ON "CouponUsage"("couponId", "orderId");`,
      `CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");`,
      `CREATE INDEX IF NOT EXISTS "CouponUsage_userId_idx" ON "CouponUsage"("userId");`,
      `CREATE INDEX IF NOT EXISTS "CouponUsage_userEmail_idx" ON "CouponUsage"("userEmail");`,
      `DO $$ BEGIN ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "martialArtsType" TEXT;`,
      `ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;`,
      `ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(10,2);`,
      `ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "originalAmount" DECIMAL(10,2);`,
      `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;`,
      `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(10,2);`,
      `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "originalAmount" DECIMAL(10,2);`
    ];

    for (const stmt of stmts) {
      await client.$executeRawUnsafe(stmt);
    }

    globalForPrisma.couponTablesEnsured = true;
  } catch (err) {
    console.error("ensureCouponTables error:", err);
  }
}

export const db = client;
