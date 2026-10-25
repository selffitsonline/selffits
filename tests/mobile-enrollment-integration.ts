/**
 * SELFFITS Mobile Enrollment API — Automated Integration & Security Test Suite
 * 
 * Verifies POST /api/v1/student/enroll:
 * 1. Missing Bearer token rejection (401)
 * 2. Malformed Bearer token rejection (401)
 * 3. Expired token rejection (401)
 * 4. Coach-to-Student role isolation rejection (403)
 * 5. Malformed JSON payload rejection (400)
 * 6. Missing required parameters validation (400)
 * 7. Days per week mismatch validation (400)
 * 8. Invalid training day / rest day validation (400)
 * 9. Non-existent batch ID validation (400)
 * 10. Invalid coupon code rejection (400)
 * 11. Server-side price calculation accuracy (Base price + Diet Addon)
 * 12. Successful enrollment transaction (active enrollment + payment authorization)
 * 13. Duplicate active enrollment prevention (409)
 */

import crypto from "crypto";
import { SignJWT } from "jose";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import {
  signMobileToken,
  getMobileSigningKey,
  MOBILE_JWT_ISSUER,
  MOBILE_JWT_AUDIENCE,
  MOBILE_TOKEN_TYPE,
} from "@/lib/mobile-auth";
import { POST as enrollHandler } from "@/app/api/v1/student/enroll/route";
import { POST as createOrderHandler } from "@/app/api/v1/payments/create-order/route";
import { POST as testCheckoutHandler } from "@/app/api/v1/payments/test-checkout/route";
import { getDefaultScheduleConfig, getCompositeDbKey } from "@/lib/schedule-config";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
  }
}

async function main() {
  console.log("==================================================================");
  console.log("SELFFITS Mobile Enrollment Integration & Security Test Suite");
  console.log("==================================================================");

  // 1. Setup or retrieve mock test student and coach in database
  let testStudent = await db.user.findFirst({
    where: { email: "test.student.enroll@selffits.test" },
  });

  if (!testStudent) {
    testStudent = await db.user.create({
      data: {
        email: "test.student.enroll@selffits.test",
        name: "Test Student Enroll",
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    });
  }

  let testCoach = await db.user.findFirst({
    where: { email: "test.coach.enroll@selffits.test" },
  });

  if (!testCoach) {
    testCoach = await db.user.create({
      data: {
        email: "test.coach.enroll@selffits.test",
        name: "Test Coach Enroll",
        role: Role.COACH,
        emailVerified: new Date(),
      },
    });
  }

  // Clean up any lingering active test enrollments for testStudent
  await db.enrollment.deleteMany({
    where: { userId: testStudent.id },
  });

  const studentToken = await signMobileToken(testStudent);
  const coachToken = await signMobileToken(testCoach);

  // Valid batch and schedule configuration from active database settings
  const configKey = getCompositeDbKey("mma", "kids");
  const setting = await db.websiteSettings.findUnique({ where: { key: configKey } });
  const storedConfig = setting?.value as any;
  const validBatchId = storedConfig?.batchTimings?.[0]?.id || "batch-1";

  const fitnessConfigKey = getCompositeDbKey("fitness", "kids");
  const fitnessSetting = await db.websiteSettings.findUnique({ where: { key: fitnessConfigKey } });
  const storedFitnessConfig = fitnessSetting?.value as any;
  const validFitnessBatchId = storedFitnessConfig?.batchTimings?.[0]?.id || "fitness-batch-1";

  // -------------------------------------------------------------
  // Test 1: Missing Bearer Token -> 401
  // -------------------------------------------------------------
  await runTest("Rejects unauthenticated request without token (401)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const body = await res.json();
    assert(body.success === false, "Expected success: false");
    assert(body.error?.code === "MISSING_BEARER_TOKEN", `Expected MISSING_BEARER_TOKEN, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 2: Malformed Bearer Token -> 401
  // -------------------------------------------------------------
  await runTest("Rejects malformed token (401)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer not.a.valid.jwt.token",
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const body = await res.json();
    assert(
      body.error?.code === "INVALID_TOKEN" || body.error?.code === "INVALID_TOKEN_SIGNATURE",
      `Expected INVALID_TOKEN or INVALID_TOKEN_SIGNATURE, got ${body.error?.code}`
    );
  });

  // -------------------------------------------------------------
  // Test 3: Expired Token -> 401
  // -------------------------------------------------------------
  await runTest("Rejects expired token (401)", async () => {
    const expiredSecret = getMobileSigningKey();
    const expiredJwt = await new SignJWT({
      sub: testStudent.id,
      email: testStudent.email,
      role: testStudent.role,
      name: testStudent.name,
      type: MOBILE_TOKEN_TYPE,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .setIssuer(MOBILE_JWT_ISSUER)
      .setAudience(MOBILE_JWT_AUDIENCE)
      .sign(expiredSecret);

    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${expiredJwt}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "TOKEN_EXPIRED", `Expected TOKEN_EXPIRED, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 4: Role Isolation (Coach role cannot enroll as Student) -> 403
  // -------------------------------------------------------------
  await runTest("Rejects Coach role attempting student enrollment (403)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${coachToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "FORBIDDEN_ROLE", `Expected FORBIDDEN_ROLE, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 5: Malformed JSON Body -> 400
  // -------------------------------------------------------------
  await runTest("Rejects unparseable non-JSON body (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: "this is not json {",
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "INVALID_JSON_BODY", `Expected INVALID_JSON_BODY, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 6: Validation Failed (Missing required fields) -> 400
  // -------------------------------------------------------------
  await runTest("Rejects payload missing required fields (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        // missing audienceGroup, daysPerWeek, selectedDays, batchId
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "VALIDATION_FAILED", `Expected VALIDATION_FAILED, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 7: Selected Days mismatch with daysPerWeek -> 400
  // -------------------------------------------------------------
  await runTest("Rejects selectedDays count mismatching daysPerWeek (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday", "Monday"], // 2 days passed for 1 day plan
        batchId: validBatchId,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "INVALID_DAYS_COUNT", `Expected INVALID_DAYS_COUNT, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 8: Invalid Training Day (Rest Day) -> 400
  // -------------------------------------------------------------
  await runTest("Rejects rest day or invalid training day (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Friday"], // In kids MMA, Friday is typically a rest day
        batchId: validBatchId,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "INVALID_TRAINING_DAY", `Expected INVALID_TRAINING_DAY, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 9: Non-existent / Inactive Batch ID -> 400
  // -------------------------------------------------------------
  await runTest("Rejects non-existent batch ID (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: "non-existent-batch-uuid",
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "INVALID_BATCH", `Expected INVALID_BATCH, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 10: Invalid Coupon Code Rejection -> 400
  // -------------------------------------------------------------
  await runTest("Rejects invalid coupon code (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        couponCode: "FAKE_INVALID_PROMO_CODE",
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "INVALID_COUPON", `Expected INVALID_COUPON, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 11: Authorizes Direct Card Submission Without Gateway Signature (Website Parity) -> 201
  // -------------------------------------------------------------
  let test11EnrollmentId: string | null = null;
  await runTest("Authorizes direct test-card submission with website parity (201)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        paymentMethod: "card",
        currency: "USD",
        // Direct test card authorization matching website
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(body.data?.enrollmentId, "Expected valid enrollmentId");
    assert(body.data.amountPaid === 25, `Expected amountPaid 25, got ${body.data.amountPaid}`);
    assert(body.data.status === "ACTIVE", `Expected status ACTIVE, got ${body.data.status}`);
    test11EnrollmentId = body.data.enrollmentId;

    const paymentRecord = await db.payment.findFirst({
      where: { enrollmentId: test11EnrollmentId! },
    });
    assert(paymentRecord?.status === "SUCCESS", "Expected payment status SUCCESS");
    assert(paymentRecord?.razorpaySignature === "direct_card_authorization", "Expected signature direct_card_authorization");
  });

  if (test11EnrollmentId) {
    await db.payment.deleteMany({ where: { enrollmentId: test11EnrollmentId } });
    await db.enrollment.delete({ where: { id: test11EnrollmentId } });
    test11EnrollmentId = null;
  }

  // -------------------------------------------------------------
  // Test 12: Authorizes direct_card_authorization Marker (Website Parity) -> 201
  // -------------------------------------------------------------
  let test12EnrollmentId: string | null = null;
  await runTest("Authorizes direct_card_authorization marker matching website (201)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        paymentMethod: "card",
        currency: "USD",
        razorpayOrderId: `card_order_${Date.now()}`,
        razorpayPaymentId: `card_pay_${Date.now()}`,
        razorpaySignature: "direct_card_authorization",
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(body.data?.status === "ACTIVE", `Expected status ACTIVE, got ${body.data?.status}`);
    test12EnrollmentId = body.data.enrollmentId;

    const paymentRecord = await db.payment.findFirst({
      where: { enrollmentId: test12EnrollmentId! },
    });
    assert(paymentRecord?.status === "SUCCESS", "Expected payment status SUCCESS");
    assert(paymentRecord?.razorpaySignature === "direct_card_authorization", "Expected direct_card_authorization in DB");
  });

  if (test12EnrollmentId) {
    await db.payment.deleteMany({ where: { enrollmentId: test12EnrollmentId } });
    await db.enrollment.delete({ where: { id: test12EnrollmentId } });
    test12EnrollmentId = null;
  }

  // -------------------------------------------------------------
  // Test 13: Rejects Invalid / Tampered Payment Signature -> 400
  // -------------------------------------------------------------
  await runTest("Rejects tampered payment signature (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        paymentMethod: "card",
        currency: "USD",
        razorpayOrderId: "order_fake_123",
        razorpayPaymentId: "pay_fake_456",
        razorpaySignature: "invalid_hmac_sha256_signature_hex",
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const body = await res.json();
    assert(body.error?.code === "INVALID_PAYMENT_SIGNATURE", `Expected INVALID_PAYMENT_SIGNATURE, got ${body.error?.code}`);
  });

  // -------------------------------------------------------------
  // Test 14: Successful Enrollment with Cryptographically Verified Signature
  // -------------------------------------------------------------
  let createdEnrollmentId: string | null = null;
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;
  const gatewaySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_selffits_secret_key";
  const validGatewaySignature = crypto
    .createHmac("sha256", gatewaySecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  await runTest("Authorizes enrollment with cryptographically verified HMAC-SHA256 signature (201)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        includeDietNutrition: true, // Should add $10 ($25 + $10 = $35)
        currency: "USD",
        razorpayOrderId: testOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validGatewaySignature,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(body.data?.enrollmentId, "Expected valid enrollmentId");
    createdEnrollmentId = body.data.enrollmentId;

    // Base plan for 1 day/wk is $25, diet nutrition is $10 -> total should be $35
    assert(body.data.amountPaid === 35, `Expected amountPaid 35, got ${body.data.amountPaid}`);
    assert(body.data.status === "ACTIVE", `Expected status ACTIVE, got ${body.data.status}`);
    assert(body.data.totalClassesGranted === 4, `Expected totalClassesGranted 4, got ${body.data.totalClassesGranted}`);
    assert(body.data.remainingClasses === 4, `Expected remainingClasses 4, got ${body.data.remainingClasses}`);

    // Verify database record was created with verified signature
    const paymentRecord = await db.payment.findFirst({
      where: { enrollmentId: createdEnrollmentId! },
    });
    assert(!!paymentRecord, "Expected payment record in database");
    assert(paymentRecord?.status === "SUCCESS", "Expected payment status SUCCESS");
    assert(paymentRecord?.razorpaySignature === validGatewaySignature, "Expected verified razorpaySignature in DB");
    assert(paymentRecord?.razorpayOrderId === testOrderId, "Expected verified razorpayOrderId in DB");
    assert(paymentRecord?.razorpayPaymentId === testPaymentId, "Expected verified razorpayPaymentId in DB");
  });

  // -------------------------------------------------------------
  // Test 15: Duplicate Active Enrollment Prevention -> 409
  // -------------------------------------------------------------
  await runTest("Prevents duplicate active enrollment for the same program (409)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        razorpayOrderId: `order_dup_${Date.now()}`,
        razorpayPaymentId: `pay_dup_${Date.now()}`,
        razorpaySignature: "valid_or_dummy_sig",
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 409, `Expected status 409, got ${res.status}`);
    const body = await res.json();
    assert(body.success === false, "Expected success: false");
    assert(body.error?.code === "DUPLICATE_ACTIVE_ENROLLMENT", `Expected DUPLICATE_ACTIVE_ENROLLMENT, got ${body.error?.code}`);
  });

  // Clean up created test data from Test 14
  if (createdEnrollmentId) {
    await db.payment.deleteMany({ where: { enrollmentId: createdEnrollmentId } });
    await db.enrollment.delete({ where: { id: createdEnrollmentId } });
    createdEnrollmentId = null;
  }

  // -------------------------------------------------------------
  // Test 16: 100% Promotional Coupon Discount ($0 final amount) -> 201
  // -------------------------------------------------------------
  const testCouponCode = `TEST_FREE_100_${Date.now()}`;
  const promoCoupon = await db.coupon.create({
    data: {
      code: testCouponCode,
      discountType: "PERCENTAGE",
      discountValue: 100,
      description: "100% Free Test Coupon",
      isActive: true,
      maxUsageTotal: 10,
    },
  });

  await runTest("Authorizes 100% promotional coupon enrollment without payment gateway (201)", async () => {
    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        couponCode: testCouponCode,
        currency: "USD",
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(body.data?.amountPaid === 0, `Expected amountPaid 0, got ${body.data?.amountPaid}`);
    assert(body.data?.discountAmount === 25, `Expected discountAmount 25, got ${body.data?.discountAmount}`);
    createdEnrollmentId = body.data.enrollmentId;

    const paymentRecord = await db.payment.findFirst({
      where: { enrollmentId: createdEnrollmentId! },
    });
    assert(paymentRecord?.amount.toNumber() === 0, "Expected payment amount 0");
    assert(paymentRecord?.razorpaySignature === "authorized_promotional_coupon", "Expected signature authorized_promotional_coupon");
  });

  // Clean up promo coupon and test data
  if (createdEnrollmentId) {
    await db.couponUsage.deleteMany({ where: { couponId: promoCoupon.id } });
    await db.payment.deleteMany({ where: { enrollmentId: createdEnrollmentId } });
    await db.enrollment.delete({ where: { id: createdEnrollmentId } });
    createdEnrollmentId = null;
  }
  await db.coupon.delete({ where: { id: promoCoupon.id } });

  // -------------------------------------------------------------
  // Test 17: False Duplicate Enrollment Detection Across Different Programs
  // (User enrolled in Adult MMA / Kung Fu CAN enroll in Kids Martial Arts)
  // -------------------------------------------------------------
  let adultProgramEnrollmentId: string | null = null;
  await runTest("Allows enrollment in Kids Martial Arts when student has active enrollment in another program", async () => {
    // 1. Create an active enrollment for the test student in another program (e.g. Adult MMA / Kung Fu)
    let adultProgram = await db.program.findFirst({
      where: { category: "MARTIAL_ARTS", targetAudience: "ADULTS" },
    });
    if (!adultProgram) {
      adultProgram = await db.program.create({
        data: {
          title: "Adults Mixed Martial Arts",
          slug: "mma-adults",
          category: "MARTIAL_ARTS",
          targetAudience: "ADULTS",
          description: "Adult Training",
        },
      });
    }

    let adultPlan = await db.membershipPlan.findFirst({ where: { programId: adultProgram.id } });
    if (!adultPlan) {
      adultPlan = await db.membershipPlan.create({
        data: {
          programId: adultProgram.id,
          name: "1 Day / Week Membership Plan",
          tierType: "BLUE_BELT",
          durationMonths: 1,
          totalClasses: 4,
          priceINR: 1999,
          priceUSD: 25,
        },
      });
    }

    const activeAdultEnrollment = await db.enrollment.create({
      data: {
        userId: testStudent.id,
        membershipPlanId: adultPlan.id,
        martialArtsType: "Kung Fu",
        classTiming: "04:00 PM to 05:00 PM (GMT)",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        monthlyPrice: 25,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days active
        totalClassesGranted: 4,
        remainingClasses: 4,
        status: "ACTIVE",
      },
    });
    adultProgramEnrollmentId = activeAdultEnrollment.id;

    // 2. Now attempt to enroll in Kids Martial Arts
    const kidsOrderId = `order_kids_distinct_${Date.now()}`;
    const kidsPayId = `pay_kids_distinct_${Date.now()}`;
    const kidsSig = crypto
      .createHmac("sha256", gatewaySecret)
      .update(`${kidsOrderId}|${kidsPayId}`)
      .digest("hex");

    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        currency: "USD",
        razorpayOrderId: kidsOrderId,
        razorpayPaymentId: kidsPayId,
        razorpaySignature: kidsSig,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(body.data?.programTitle === "Kids Martial Arts", `Expected Kids Martial Arts, got ${body.data?.programTitle}`);

    // Clean up created enrollment
    if (body.data?.enrollmentId) {
      await db.payment.deleteMany({ where: { enrollmentId: body.data.enrollmentId } });
      await db.enrollment.delete({ where: { id: body.data.enrollmentId } });
    }
    if (adultProgramEnrollmentId) {
      await db.enrollment.delete({ where: { id: adultProgramEnrollmentId } });
      adultProgramEnrollmentId = null;
    }
  });

  // -------------------------------------------------------------
  // Test 18: Stale / Expired Enrollment Does Not Block Re-enrollment
  // -------------------------------------------------------------
  await runTest("Allows re-enrollment when previous enrollment is expired", async () => {
    // 1. Create an expired enrollment in Kids Martial Arts
    const kidsProgram = await db.program.findFirst({
      where: { slug: "mma-kids" },
    });
    const kidsPlan = kidsProgram ? await db.membershipPlan.findFirst({ where: { programId: kidsProgram.id } }) : null;

    let expiredEnrollmentId: string | null = null;
    if (kidsProgram && kidsPlan) {
      const expiredEnrollment = await db.enrollment.create({
        data: {
          userId: testStudent.id,
          membershipPlanId: kidsPlan.id,
          martialArtsType: "Karate",
          classTiming: "04:00 PM to 05:00 PM (GMT)",
          daysPerWeek: 1,
          selectedDays: ["Sunday"],
          monthlyPrice: 25,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
          totalClassesGranted: 4,
          remainingClasses: 0,
          status: "ACTIVE", // Even if status flag is ACTIVE, endDate < now means expired!
        },
      });
      expiredEnrollmentId = expiredEnrollment.id;
    }

    const renewOrderId = `order_renew_${Date.now()}`;
    const renewPayId = `pay_renew_${Date.now()}`;
    const renewSig = crypto
      .createHmac("sha256", gatewaySecret)
      .update(`${renewOrderId}|${renewPayId}`)
      .digest("hex");

    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validBatchId,
        martialArtsType: "Karate",
        currency: "USD",
        razorpayOrderId: renewOrderId,
        razorpayPaymentId: renewPayId,
        razorpaySignature: renewSig,
      }),
    });

    const res = await enrollHandler(req);
    assert(res.status === 201, `Expected status 201 for renewal of expired enrollment, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");

    if (body.data?.enrollmentId) {
      await db.payment.deleteMany({ where: { enrollmentId: body.data.enrollmentId } });
      await db.enrollment.delete({ where: { id: body.data.enrollmentId } });
    }
    if (expiredEnrollmentId) {
      await db.enrollment.delete({ where: { id: expiredEnrollmentId } });
    }
  });

  // -------------------------------------------------------------
  // Test 19: Payment Gateway Order Creation (POST /api/v1/payments/create-order)
  // -------------------------------------------------------------
  let generatedOrderId: string | null = null;
  await runTest("Initializes payment gateway order with authoritative server pricing (200)", async () => {
    const req = new Request("http://localhost:3000/api/v1/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "fitness",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validFitnessBatchId,
        includeDietNutrition: false,
        currency: "USD",
      }),
    });

    const res = await createOrderHandler(req);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(!!body.data?.orderId, "Expected valid orderId");
    assert(body.data?.amount === 20, `Expected amount 20, got ${body.data?.amount}`);
    assert(body.data?.isTestMode === true, "Expected isTestMode to be true");
    generatedOrderId = body.data.orderId;

    // Verify PENDING record exists in database
    const pendingPayment = await db.payment.findUnique({
      where: { razorpayOrderId: generatedOrderId! },
    });
    assert(!!pendingPayment, "Expected pending payment in DB");
    assert(pendingPayment?.status === "PENDING", `Expected status PENDING, got ${pendingPayment?.status}`);
  });

  // -------------------------------------------------------------
  // Test 20: Gateway Test Card Authorization (POST /api/v1/payments/test-checkout)
  // -------------------------------------------------------------
  let authorizedPaymentId: string | null = null;
  let authorizedSignature: string | null = null;
  await runTest("Processes test payment authorization and returns valid HMAC signature (200)", async () => {
    assert(!!generatedOrderId, "Order ID required from Test 19");

    const req = new Request("http://localhost:3000/api/v1/payments/test-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        orderId: generatedOrderId,
        cardNumber: "4242 4242 4242 4242",
        cardExpiry: "12/28",
        cardCvv: "123",
      }),
    });

    const res = await testCheckoutHandler(req);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "Expected success: true");
    assert(!!body.data?.razorpayPaymentId, "Expected payment ID");
    assert(!!body.data?.razorpaySignature, "Expected signature");

    authorizedPaymentId = body.data.razorpayPaymentId;
    authorizedSignature = body.data.razorpaySignature;

    // Verify that the signature returned by test-checkout matches HMAC-SHA256
    const expectedSig = crypto
      .createHmac("sha256", gatewaySecret)
      .update(`${generatedOrderId}|${authorizedPaymentId}`)
      .digest("hex");
    assert(authorizedSignature === expectedSig, "Expected test-checkout signature to match HMAC-SHA256");
  });

  // -------------------------------------------------------------
  // Test 21: Failed Payment Handling (Declined Card) -> 400
  // -------------------------------------------------------------
  await runTest("Rejects declined test card and does not activate enrollment (400)", async () => {
    // Create a temporary order to test decline
    const orderReq = new Request("http://localhost:3000/api/v1/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "fitness",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validFitnessBatchId,
        currency: "USD",
      }),
    });
    const orderRes = await createOrderHandler(orderReq);
    const orderBody = await orderRes.json();
    const declineOrderId = orderBody.data?.orderId;

    // Submit card ending in 0000 (simulated decline)
    const payReq = new Request("http://localhost:3000/api/v1/payments/test-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        orderId: declineOrderId,
        cardNumber: "4242 4242 4242 0000", // Decline card
        cardExpiry: "12/28",
        cardCvv: "123",
      }),
    });

    const payRes = await testCheckoutHandler(payReq);
    assert(payRes.status === 400, `Expected status 400, got ${payRes.status}`);
    const payBody = await payRes.json();
    assert(payBody.error?.code === "PAYMENT_DECLINED", `Expected PAYMENT_DECLINED, got ${payBody.error?.code}`);

    // Verify the payment record remains PENDING and no enrollment was created
    const payRecord = await db.payment.findUnique({
      where: { razorpayOrderId: declineOrderId },
    });
    assert(payRecord?.status === "PENDING", "Payment record should remain PENDING");
    assert(payRecord?.enrollmentId === null, "No enrollment should be attached");

    // Clean up temporary order
    await db.payment.delete({ where: { razorpayOrderId: declineOrderId } });
  });

  // -------------------------------------------------------------
  // Test 22: End-to-End Enrollment Activation with Verified Gateway Flow (Issue 2 Fix Verification)
  // -------------------------------------------------------------
  let activatedEnrollmentId: string | null = null;
  await runTest("Activates paid Kids Fitness enrollment with verified gateway signature from test flow (201)", async () => {
    assert(!!generatedOrderId && !!authorizedPaymentId && !!authorizedSignature, "Valid order, pay ID, and signature required");

    const req = new Request("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        programCategory: "fitness",
        audienceGroup: "kids",
        daysPerWeek: 1,
        selectedDays: ["Sunday"],
        batchId: validFitnessBatchId,
        currency: "USD",
        paymentMethod: "card",
        razorpayOrderId: generatedOrderId,
        razorpayPaymentId: authorizedPaymentId,
        razorpaySignature: authorizedSignature,
      }),
    });

    const res = await enrollHandler(req);
    const body = await res.json();
    assert(res.status === 201, `Expected status 201, got ${res.status}: ${JSON.stringify(body)}`);
    assert(body.success === true, "Expected success: true");
    assert(body.data?.programTitle === "Kids Fitness & Weight Management", `Expected Kids Fitness, got ${body.data?.programTitle}`);
    assert(body.data?.amountPaid === 20, `Expected amountPaid 20, got ${body.data?.amountPaid}`);
    assert(body.data?.status === "ACTIVE", `Expected status ACTIVE, got ${body.data?.status}`);
    activatedEnrollmentId = body.data?.enrollmentId;

    // Verify database payment was updated from PENDING to SUCCESS
    const updatedPayment = await db.payment.findUnique({
      where: { razorpayOrderId: generatedOrderId! },
    });
    assert(updatedPayment?.status === "SUCCESS", `Expected payment SUCCESS, got ${updatedPayment?.status}`);
    assert(updatedPayment?.enrollmentId === activatedEnrollmentId, "Expected payment linked to enrollment");
    assert(updatedPayment?.razorpaySignature === authorizedSignature, "Expected payment signature stored in DB");

    // Clean up created data
    if (activatedEnrollmentId) {
      await db.payment.deleteMany({ where: { enrollmentId: activatedEnrollmentId } });
      await db.enrollment.delete({ where: { id: activatedEnrollmentId } });
      activatedEnrollmentId = null;
    }
  });

  await db.payment.deleteMany({
    where: { user: { email: { in: ["test.student.enroll@selffits.test", "test.coach.enroll@selffits.test"] } } },
  });
  await db.enrollment.deleteMany({
    where: { user: { email: { in: ["test.student.enroll@selffits.test", "test.coach.enroll@selffits.test"] } } },
  });
  await db.user.deleteMany({
    where: { email: { in: ["test.student.enroll@selffits.test", "test.coach.enroll@selffits.test"] } },
  });

  console.log("------------------------------------------------------------------");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Summary: ${passedCount}/${results.length} tests passed.`);
  console.log("==================================================================");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
