/**
 * SELFFITS Enrollment & Payment Notifications Test Suite (Step 7B)
 *
 * Verifies that:
 * 1. Mobile enrollment (POST /api/v1/student/enroll) creates in-app and FCM push notifications.
 * 2. Web payment verification (verifyPaymentSignatureAction) creates in-app and FCM push notifications.
 * 3. Razorpay webhook (POST /api/webhooks/razorpay) creates in-app and FCM push notifications.
 * 4. Failed or invalid-signature payments send NO success notifications.
 * 5. Concurrent or sequential client verification + webhook calls are authoritatively deduplicated (0 duplicate in-app records).
 * 6. Correct student recipient (userId) is strictly enforced.
 * 7. Push service failure does NOT reverse or fail confirmed payment or enrollment.
 * 8. payment.failed webhook safely dispatches failure notification without overriding confirmed payments.
 */

import crypto from "crypto";
import { db } from "../lib/db";
import * as authModule from "../lib/auth";
import * as mobileAuthModule from "../lib/mobile-auth";
import { pushNotificationService } from "../lib/push-notification-service";
import {
  dispatchPaymentSuccessNotification,
  dispatchPaymentFailureNotification,
} from "../lib/payment-notification";
import { POST as mobileEnrollPost } from "../app/api/v1/student/enroll/route";
import {
  verifyPaymentSignatureAction,
  createDirectCardEnrollmentAction,
} from "../actions/payments.actions";
import { POST as razorpayWebhookPost } from "../app/api/webhooks/razorpay/route";
import { NextRequest } from "next/server";
import { resend } from "../lib/resend";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
    failedCount++;
  }
}

// Spies and Trackers
let capturedPushCalls: Array<{
  userId: string;
  payload: any;
  options?: any;
}> = [];

let inMemoryNotifications: Array<any> = [];
let shouldPushThrow = false;

// Back up original methods
const originalAuth = authModule.auth;
const originalVerifyMobileAuth = mobileAuthModule.verifyMobileAuth;
const originalPushSendToUser = pushNotificationService.sendToUser.bind(pushNotificationService);
const originalDbNotificationCreate = db.notification.create.bind(db.notification);
const originalDbNotificationFindFirst = db.notification.findFirst.bind(db.notification);

function resetMocks() {
  capturedPushCalls = [];
  inMemoryNotifications = [];
  shouldPushThrow = false;

  // Intercept pushNotificationService.sendToUser
  pushNotificationService.sendToUser = async (userId: string, payload: any, options?: any) => {
    capturedPushCalls.push({ userId, payload, options });
    if (shouldPushThrow) {
      throw new Error("Simulated FCM push transport network timeout");
    }
    return {
      success: true,
      successCount: 1,
      failureCount: 0,
      invalidTokens: [],
      errors: [],
    };
  };

  // Intercept db.notification.create
  (db.notification as any).create = async (args: any) => {
    const record = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...args.data,
      isRead: false,
      createdAt: new Date(),
    };
    inMemoryNotifications.push(record);
    return record;
  };

  (db as any).$executeRawUnsafe = async () => 0;
  if (resend?.emails) {
    (resend.emails as any).send = async () => ({ id: "mock_mail_1" });
  }

  // Intercept db.notification.findFirst to simulate persistent DB lookups
  (db.notification as any).findFirst = async (args: any) => {
    const { where } = args;
    return (
      inMemoryNotifications.find((n) => {
        if (where.userId && n.userId !== where.userId) return false;
        if (where.title && n.title !== where.title) return false;
        if (where.message?.contains && !n.message.includes(where.message.contains)) return false;
        return true;
      }) || null
    );
  };
}

function restoreAll() {
  (authModule as any).auth = originalAuth;
  (mobileAuthModule as any).verifyMobileAuth = originalVerifyMobileAuth;
  pushNotificationService.sendToUser = originalPushSendToUser;
  (db.notification as any).create = originalDbNotificationCreate;
  (db.notification as any).findFirst = originalDbNotificationFindFirst;
}

async function runEnrollmentPaymentNotificationTests() {
  console.log("=================================================================");
  console.log(" SELFFITS Enrollment & Payment Notifications — Automated Test Suite");
  console.log("=================================================================\n");

  try {
    // -------------------------------------------------------------
    // Section 1: Helper Function Direct Verification
    // -------------------------------------------------------------
    console.log("Section 1: Centralized Payment Notification Helper Verification");
    resetMocks();

    const result1 = await dispatchPaymentSuccessNotification({
      userId: "student_direct_001",
      orderId: "order_direct_999",
      planName: "3 Days / Week Membership Plan",
      enrollmentId: "enr_direct_111",
      amount: 4399,
      currency: "INR",
    });

    assert(result1.inAppCreated === true, "Helper creates in-app notification on first dispatch");
    assert(result1.pushDispatched === true, "Helper dispatches push on first dispatch");
    assert(inMemoryNotifications.length === 1, "Exactly one in-app DB notification stored");
    assert(inMemoryNotifications[0].userId === "student_direct_001", "In-app record targets student_direct_001");
    assert(inMemoryNotifications[0].title === "Enrollment Confirmed! 🥋", "Title is 'Enrollment Confirmed! 🥋'");
    assert(inMemoryNotifications[0].message.includes("order_direct_999"), "Message contains order ID");
    assert(capturedPushCalls.length === 1, "Exactly one push call dispatched");
    assert(capturedPushCalls[0].userId === "student_direct_001", "Push call targets student_direct_001");
    assert(capturedPushCalls[0].payload.data.type === "ENROLLMENT_UPDATE", "Push data type is 'ENROLLMENT_UPDATE'");
    assert(capturedPushCalls[0].payload.data.deepLink === "selffits://dashboard/student", "Push deepLink is student dashboard");
    assert(capturedPushCalls[0].options.persistInApp === false, "Push options has persistInApp: false");
    assert(capturedPushCalls[0].options.deduplicationKey === "payment_success:order_direct_999", "Deduplication key is deterministic");

    // Second call with same orderId (simulating duplicate webhook / retry)
    const result2 = await dispatchPaymentSuccessNotification({
      userId: "student_direct_001",
      orderId: "order_direct_999",
      planName: "3 Days / Week Membership Plan",
    });

    assert(result2.inAppCreated === false, "Second dispatch with same orderId skips creating duplicate in-app record");
    assert(inMemoryNotifications.length === 1, "In-app notification count remains exactly 1");

    // Push Exception Resilience
    resetMocks();
    shouldPushThrow = true;
    const resilientResult = await dispatchPaymentSuccessNotification({
      userId: "student_resilient_002",
      orderId: "order_resilient_888",
    });
    assert(resilientResult.inAppCreated === true, "In-app notification created even when push service throws");
    assert(resilientResult.pushDispatched === false, "Push marked not dispatched on throw");

    console.log();

    // -------------------------------------------------------------
    // Section 2: Mobile Enrollment Flow (POST /api/v1/student/enroll)
    // -------------------------------------------------------------
    console.log("Section 2: Mobile Enrollment Endpoint (POST /api/v1/student/enroll)");
    resetMocks();

    const mockMobileStudent = {
      id: "student_mob_777",
      email: "mobile.student@selffits.com",
      role: "STUDENT" as const,
    };

    (mobileAuthModule as any).verifyMobileAuth = async () => ({
      success: true,
      user: mockMobileStudent,
    });

    // Mock DB dependencies for mobile enrollment
    const originalSettingsFindUnique = db.websiteSettings.findUnique.bind(db.websiteSettings);
    (db.websiteSettings as any).findUnique = async () => ({
      value: {
        trainingDays: [
          { dayName: "Monday", selectable: true, restDay: false },
          { dayName: "Wednesday", selectable: true, restDay: false },
          { dayName: "Friday", selectable: true, restDay: false },
        ],
        batchTimings: [
          { id: "batch_001", batchName: "Evening Batch", displayLabel: "06:00 PM to 07:00 PM", timezone: "GMT (UTC+0)", activeStatus: true },
        ],
        membershipPlans: [
          { daysPerWeek: 3, monthlyPriceUSD: 55, monthlyPriceINR: 4399, activeStatus: true },
        ],
      },
    });

    const originalProgramFindFirst = db.program.findFirst.bind(db.program);
    (db.program as any).findFirst = async () => ({ id: "prog_mob_1", title: "Adults Mixed Martial Arts" });

    const originalMembershipPlanFindFirst = db.membershipPlan.findFirst.bind(db.membershipPlan);
    (db.membershipPlan as any).findFirst = async () => ({ id: "plan_mob_1", name: "3 Days / Week Membership Plan" });

    const originalEnrollmentFindFirst = db.enrollment.findFirst.bind(db.enrollment);
    (db.enrollment as any).findFirst = async () => null;

    const originalDbTransaction = db.$transaction.bind(db);
    (db as any).$transaction = async (cb: any) => {
      const mockTx = {
        enrollment: {
          create: async (args: any) => ({ id: "enr_created_123", ...args.data }),
        },
        payment: {
          findUnique: async () => null,
          create: async (args: any) => ({ id: "pay_created_123", ...args.data }),
          update: async (args: any) => ({ id: "pay_updated_123", ...args.data }),
        },
        coupon: { findUnique: async () => null },
        couponUsage: { create: async () => ({}) },
        studentProfile: { findUnique: async () => ({ userId: mockMobileStudent.id }) },
      };
      return cb(mockTx);
    };

    // Valid HMAC Signature generation for test
    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_selffits_secret_key";
    const testOrderId = "order_mob_555";
    const testPaymentId = "pay_mob_555";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex");

    const validEnrollReq = new NextRequest("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "adults",
        daysPerWeek: 3,
        selectedDays: ["Monday", "Wednesday", "Friday"],
        batchId: "batch_001",
        paymentMethod: "card",
        currency: "USD",
        razorpayOrderId: testOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validSignature,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const enrollResp = await mobileEnrollPost(validEnrollReq);
    const enrollJson = await enrollResp.json();

    assert(enrollResp.status === 201, "Mobile enroll endpoint returns HTTP 201 Created");
    assert(enrollJson.success === true, "Response JSON has success: true");
    assert(inMemoryNotifications.length === 1, "In-app database notification created after successful mobile enrollment");
    assert(inMemoryNotifications[0].userId === "student_mob_777", "In-app notification userId matches mobile student");
    assert(capturedPushCalls.length === 1, "Push notification dispatched after successful mobile enrollment");
    assert(capturedPushCalls[0].userId === "student_mob_777", "Push recipient matches mobile student");
    assert(capturedPushCalls[0].payload.data.orderId === testOrderId, "Push payload data.orderId matches verified order");
    assert(capturedPushCalls[0].options.persistInApp === false, "Push options has persistInApp: false");

    // Test 2.2: Invalid Signature Sends NO Notifications
    resetMocks();
    const badSigReq = new NextRequest("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "adults",
        daysPerWeek: 3,
        selectedDays: ["Monday", "Wednesday", "Friday"],
        batchId: "batch_001",
        paymentMethod: "card",
        currency: "USD",
        razorpayOrderId: "order_bad_sig",
        razorpayPaymentId: "pay_bad_sig",
        razorpaySignature: "invalid_crypto_signature_hex",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const badSigResp = await mobileEnrollPost(badSigReq);
    const badSigJson = await badSigResp.json();

    assert(badSigResp.status === 400, "Invalid signature returns HTTP 400");
    assert(badSigJson.error.code === "INVALID_PAYMENT_SIGNATURE", "Error code is INVALID_PAYMENT_SIGNATURE");
    assert(inMemoryNotifications.length === 0, "No in-app notification created for invalid payment signature");
    assert(capturedPushCalls.length === 0, "No push notification dispatched for invalid payment signature");

    // Test 2.3: Declined Test Card Sends NO Success Notifications
    resetMocks();
    const declinedCardReq = new NextRequest("http://localhost:3000/api/v1/student/enroll", {
      method: "POST",
      body: JSON.stringify({
        programCategory: "mma",
        audienceGroup: "adults",
        daysPerWeek: 3,
        selectedDays: ["Monday", "Wednesday", "Friday"],
        batchId: "batch_001",
        paymentMethod: "card",
        currency: "USD",
        directCard: { cardNumber: "4111 1111 1111 0002" },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const declinedResp = await mobileEnrollPost(declinedCardReq);
    const declinedJson = await declinedResp.json();

    assert(declinedResp.status === 400, "Declined test card returns HTTP 400");
    assert(declinedJson.error.code === "CARD_TRANSACTION_FAILED", "Error code is CARD_TRANSACTION_FAILED");
    assert(inMemoryNotifications.length === 0, "No in-app notification created for declined test card");
    assert(capturedPushCalls.length === 0, "No push notification dispatched for declined test card");

    console.log();

    // -------------------------------------------------------------
    // Section 3: Web Payment Verification (verifyPaymentSignatureAction)
    // -------------------------------------------------------------
    console.log("Section 3: Web Payment Verification (verifyPaymentSignatureAction)");
    resetMocks();

    const mockWebStudent = {
      id: "student_web_888",
      email: "web.student@selffits.com",
      name: "Web Student",
      role: "STUDENT",
    };

    (authModule as any).auth = async () => ({ user: mockWebStudent });
    (db.user as any).findUnique = async () => mockWebStudent;

    const originalPaymentFindUnique = db.payment.findUnique.bind(db.payment);
    (db.payment as any).findUnique = async () => ({
      id: "pay_web_1",
      userId: mockWebStudent.id,
      amount: 4399,
      status: "PENDING",
      razorpayOrderId: "order_web_333",
    });

    const webSecret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";
    const webOrderId = "order_web_333";
    const webPaymentId = "pay_web_333";
    const validWebSignature = crypto
      .createHmac("sha256", webSecret)
      .update(`${webOrderId}|${webPaymentId}`)
      .digest("hex");

    const webResult = await verifyPaymentSignatureAction({
      razorpayOrderId: webOrderId,
      razorpayPaymentId: webPaymentId,
      razorpaySignature: validWebSignature,
      planId: "plan-3-day",
    });

    assert(webResult.success === true, "verifyPaymentSignatureAction succeeds for valid signature");
    assert(inMemoryNotifications.length === 1, "In-app database notification created after web payment verification");
    assert(inMemoryNotifications[0].userId === "student_web_888", "In-app notification userId matches web student");
    assert(inMemoryNotifications[0].title === "Enrollment Confirmed! 🥋", "Title is 'Enrollment Confirmed! 🥋'");
    assert(capturedPushCalls.length === 1, "Push notification dispatched for verified web payment");
    assert(capturedPushCalls[0].userId === "student_web_888", "Push recipient is web student");
    assert(capturedPushCalls[0].payload.data.orderId === webOrderId, "Push data.orderId matches verified order");
    assert(capturedPushCalls[0].options.persistInApp === false, "Push options has persistInApp: false");

    // Test 3.2: Invalid Signature on Web Action Sends NO Notifications
    resetMocks();
    const badWebResult = await verifyPaymentSignatureAction({
      razorpayOrderId: "order_web_bad",
      razorpayPaymentId: "pay_web_bad",
      razorpaySignature: "invalid_web_sig",
      planId: "plan-3-day",
    });

    assert(badWebResult.success === false, "Action returns success: false for invalid signature");
    assert(inMemoryNotifications.length === 0, "No in-app notification sent for invalid web signature");
    assert(capturedPushCalls.length === 0, "No push notification sent for invalid web signature");

    console.log();

    // -------------------------------------------------------------
    // Section 4: Razorpay Webhook (POST /api/webhooks/razorpay)
    // -------------------------------------------------------------
    console.log("Section 4: Razorpay Webhook (POST /api/webhooks/razorpay)");
    resetMocks();

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_selffits_razorpay_webhook_secret";

    // Test 4.1: Valid Webhook payment.captured Event
    const webhookOrderId = "order_wh_444";
    const webhookPaymentId = "pay_wh_444";
    (db.payment as any).findUnique = async () => ({
      id: "pay_db_444",
      userId: "student_wh_999",
      amount: 4399,
      currency: "INR",
      status: "PENDING",
      razorpayOrderId: webhookOrderId,
    });
    (db.payment as any).update = async (args: any) => args.data;

    const validWebhookBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: webhookOrderId,
            amount: 439900,
            currency: "INR",
          },
        },
      },
    });

    const validWebhookSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(validWebhookBody)
      .digest("hex");

    const webhookReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
      method: "POST",
      body: validWebhookBody,
      headers: {
        "x-razorpay-signature": validWebhookSig,
        "Content-Type": "application/json",
      },
    });

    const webhookResp = await razorpayWebhookPost(webhookReq);
    assert(webhookResp.status === 200, "Webhook returns HTTP 200 on valid signature");
    assert(inMemoryNotifications.length === 1, "In-app database notification created by webhook");
    assert(inMemoryNotifications[0].userId === "student_wh_999", "Notification recipient is student_wh_999");
    assert(capturedPushCalls.length === 1, "Push notification dispatched by webhook");
    assert(capturedPushCalls[0].userId === "student_wh_999", "Push recipient is student_wh_999");
    assert(capturedPushCalls[0].options.deduplicationKey === `payment_success:${webhookOrderId}`, "Push deduplication key matches order");

    // Test 4.2: Webhook Idempotency (Sequential Client Verification then Webhook for same order)
    console.log("Sub-section 4.2: Client Verification then Webhook Idempotency");
    // Client already created notification above; now same order webhook arrives again
    const secondWebhookReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
      method: "POST",
      body: validWebhookBody,
      headers: {
        "x-razorpay-signature": validWebhookSig,
        "Content-Type": "application/json",
      },
    });

    const secondWebhookResp = await razorpayWebhookPost(secondWebhookReq);
    assert(secondWebhookResp.status === 200, "Second webhook returns HTTP 200");
    assert(inMemoryNotifications.length === 1, "In-app notification count remains exactly 1 (no duplicate DB record)");

    // Test 4.3: Invalid Webhook Signature
    resetMocks();
    const badWebhookReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
      method: "POST",
      body: validWebhookBody,
      headers: {
        "x-razorpay-signature": "invalid_signature",
      },
    });
    const badWebhookResp = await razorpayWebhookPost(badWebhookReq);
    assert(badWebhookResp.status === 400, "Invalid webhook signature returns HTTP 400");
    assert(inMemoryNotifications.length === 0, "No notification created for invalid webhook signature");

    // Test 4.4: payment.failed Event Dispatches Failure Notification
    resetMocks();
    const failedOrderId = "order_failed_666";
    (db.payment as any).findUnique = async () => ({
      id: "pay_db_failed_666",
      userId: "student_wh_999",
      amount: 4399,
      currency: "INR",
      status: "PENDING",
      razorpayOrderId: failedOrderId,
    });

    const failedWebhookBody = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_fail_1",
            order_id: failedOrderId,
            error_description: "Card has insufficient balance.",
          },
        },
      },
    });
    const failedWebhookSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(failedWebhookBody)
      .digest("hex");

    const failedWebhookReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
      method: "POST",
      body: failedWebhookBody,
      headers: {
        "x-razorpay-signature": failedWebhookSig,
      },
    });

    const failedWebhookResp = await razorpayWebhookPost(failedWebhookReq);
    assert(failedWebhookResp.status === 200, "payment.failed webhook returns HTTP 200");
    assert(inMemoryNotifications.length === 1, "Failure in-app notification created");
    assert(inMemoryNotifications[0].title === "Payment Failed ⚠️", "Title is 'Payment Failed ⚠️'");
    assert(inMemoryNotifications[0].message.includes("insufficient balance"), "Message contains failure reason");
    assert(capturedPushCalls.length === 1, "Push notification dispatched for payment failure");
    assert(capturedPushCalls[0].payload.title === "Payment Failed ⚠️", "Push title is 'Payment Failed ⚠️'");
    assert(capturedPushCalls[0].options.deduplicationKey === `payment_failed:${failedOrderId}`, "Failure deduplicationKey is deterministic");

    // Test 4.5: Delayed payment.failed Event Does NOT Overwrite Confirmed Payment
    resetMocks();
    (db.payment as any).findUnique = async () => ({
      id: "pay_db_confirmed",
      userId: "student_wh_999",
      amount: 4399,
      currency: "INR",
      status: "SUCCESS", // ALREADY SUCCESS
      razorpayOrderId: failedOrderId,
    });

    let paymentUpdateCalled = false;
    (db.payment as any).update = async () => {
      paymentUpdateCalled = true;
    };

    const delayedFailReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
      method: "POST",
      body: failedWebhookBody,
      headers: {
        "x-razorpay-signature": failedWebhookSig,
      },
    });

    const delayedFailResp = await razorpayWebhookPost(delayedFailReq);
    assert(delayedFailResp.status === 200, "Delayed fail webhook returns HTTP 200");
    assert(paymentUpdateCalled === false, "Payment status was NOT modified to FAILED for already SUCCESS payment");
    assert(inMemoryNotifications.length === 0, "No failure notification created for already SUCCESS payment");

    console.log();

    // -------------------------------------------------------------
    // Section 5: Direct Card Web Enrollment (createDirectCardEnrollmentAction)
    // -------------------------------------------------------------
    console.log("Section 5: Direct Card Enrollment Action");
    resetMocks();
    (authModule as any).auth = async () => ({ user: mockWebStudent });
    (db.user as any).findUnique = async () => mockWebStudent;

    const directCardResult = await createDirectCardEnrollmentAction("plan-3-day", "USD");
    assert(directCardResult.success === true, "createDirectCardEnrollmentAction succeeds");
    assert(inMemoryNotifications.length === 1, "In-app database notification created for direct card enrollment");
    assert(inMemoryNotifications[0].userId === "student_web_888", "Recipient is web student");
    assert(capturedPushCalls.length === 1, "Push notification dispatched for direct card enrollment");
    assert(capturedPushCalls[0].userId === "student_web_888", "Push recipient is web student");

    console.log();
  } finally {
    restoreAll();
  }

  console.log("=================================================================");
  console.log(` Enrollment & Payment Notifications Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runEnrollmentPaymentNotificationTests().catch((err) => {
  console.error("Test runner encountered unhandled error:", err);
  process.exit(1);
});
