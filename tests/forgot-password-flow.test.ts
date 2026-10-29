import assert from "assert";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { forgotPasswordAction, resetPasswordAction } from "@/actions/auth.actions";
import { POST as mobileForgotPasswordRoute } from "@/app/api/v1/auth/forgot-password/route";
import {
  getAppBaseUrl,
  isResendConfigured,
  sendPasswordResetEmail,
  getMockSentEmails,
  clearMockSentEmails,
} from "@/lib/resend";
import { db } from "@/lib/db";

async function runForgotPasswordFlowTests() {
  console.log("=================================================================");
  console.log(" SELFFITS Forgot Password & Password Reset — Comprehensive Test");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function test(desc: string, condition: boolean) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // Ensure test mock mode is enabled so external Resend network calls are safely sandboxed
  process.env.EMAIL_MOCK = "true";
  (process.env as any).NODE_ENV = "test";

  const runId = Date.now();
  const testStudentEmail = `student_reset_${runId}@example.com`;
  const initialPassword = "InitialPassword@123";
  const updatedPassword = "BrandNewSecurePassword@456";

  // In-memory test store to back mocks if DB server is offline or in sandbox
  const inMemoryResetTokens = new Map<string, { email: string; token: string; expires: Date }>();
  const inMemoryUsers = new Map<
    string,
    { id: string; email: string; name: string; firstName: string; passwordHash: string; isBlocked: boolean }
  >();

  const initialPasswordHash = await bcrypt.hash(initialPassword, 10);
  const testUserRecord = {
    id: `usr_${runId}`,
    email: testStudentEmail,
    name: "Alex Rivera",
    firstName: "Alex",
    passwordHash: initialPasswordHash,
    isBlocked: false,
  };
  inMemoryUsers.set(testStudentEmail, testUserRecord);

  // Set up mock DB interceptors
  const origFindUniqueUser = db.user.findUnique;
  const origUpdateUser = db.user.update;
  const origCreateToken = db.passwordResetToken.create;
  const origFindUniqueToken = db.passwordResetToken.findUnique;
  const origFindFirstToken = db.passwordResetToken.findFirst;
  const origDeleteToken = db.passwordResetToken.delete;
  const origDeleteManyToken = db.passwordResetToken.deleteMany;
  const origTransaction = db.$transaction;
  const origRateLimitFindMany = db.rateLimitRecord.findMany;
  const origRateLimitDeleteMany = db.rateLimitRecord.deleteMany;
  const origRateLimitCreate = db.rateLimitRecord.create;

  db.rateLimitRecord.findMany = (async () => []) as any;
  db.rateLimitRecord.deleteMany = (async () => ({ count: 0 })) as any;
  db.rateLimitRecord.create = (async () => ({})) as any;

  db.user.findUnique = (async (args: any) => {
    const email = args.where?.email?.toLowerCase()?.trim();
    return inMemoryUsers.get(email) || null;
  }) as any;

  db.user.update = (async (args: any) => {
    const email = args.where?.email?.toLowerCase()?.trim();
    const existing = inMemoryUsers.get(email);
    if (!existing) throw new Error("User not found");
    const updated = { ...existing, ...args.data };
    inMemoryUsers.set(email, updated);
    return updated;
  }) as any;

  db.passwordResetToken.create = (async (args: any) => {
    const record = {
      email: args.data.email.toLowerCase().trim(),
      token: args.data.token,
      expires: args.data.expires,
    };
    inMemoryResetTokens.set(record.token, record);
    return record;
  }) as any;

  db.passwordResetToken.findUnique = (async (args: any) => {
    return inMemoryResetTokens.get(args.where?.token) || null;
  }) as any;

  db.passwordResetToken.findFirst = (async (args: any) => {
    for (const record of inMemoryResetTokens.values()) {
      if (args.where?.email && record.email !== args.where.email.toLowerCase().trim()) continue;
      if (args.where?.token && record.token !== args.where.token) continue;
      return record;
    }
    return null;
  }) as any;

  db.passwordResetToken.delete = (async (args: any) => {
    const existing = inMemoryResetTokens.get(args.where?.token);
    if (existing) inMemoryResetTokens.delete(args.where.token);
    return existing || {};
  }) as any;

  db.passwordResetToken.deleteMany = (async (args: any) => {
    let count = 0;
    for (const [key, record] of Array.from(inMemoryResetTokens.entries())) {
      if (args.where?.email && record.email === args.where.email.toLowerCase().trim()) {
        inMemoryResetTokens.delete(key);
        count++;
      }
      if (args.where?.token && record.token === args.where.token) {
        inMemoryResetTokens.delete(key);
        count++;
      }
    }
    return { count };
  }) as any;

  db.$transaction = (async (promisesOrFn: any) => {
    if (Array.isArray(promisesOrFn)) {
      return Promise.all(promisesOrFn);
    }
    if (typeof promisesOrFn === "function") {
      return promisesOrFn(db);
    }
  }) as any;

  try {
    // -------------------------------------------------------------
    // Test 1: Forgot Password Form Submission & Input Validation
    // -------------------------------------------------------------
    console.log("Section 1: Forgot Password Form Submission & Input Validation");

    const resEmptyEmail = await forgotPasswordAction({
      email: "",
      turnstileToken: "1x00000000000000000000AA",
    });
    test("Rejects empty email address", resEmptyEmail.success === false);

    const resInvalidEmail = await forgotPasswordAction({
      email: "invalid-email-address",
      turnstileToken: "1x00000000000000000000AA",
    });
    test("Rejects malformed email address ('invalid-email-address')", resInvalidEmail.success === false);

    const resMissingTurnstile = await forgotPasswordAction({
      email: testStudentEmail,
      turnstileToken: "",
    });
    test("Rejects request with missing Cloudflare Turnstile token", resMissingTurnstile.success === false);

    // -------------------------------------------------------------
    // Test 2: Valid Email Request (Registered User)
    // -------------------------------------------------------------
    console.log("\nSection 2: Valid Email Request (Registered User)");
    clearMockSentEmails();
    inMemoryResetTokens.clear();

    const resValid = await forgotPasswordAction({
      email: testStudentEmail,
      turnstileToken: "1x00000000000000000000AA",
    });

    test("Returns success: true for registered email", resValid.success === true);
    test(
      "Message uses generic safe recovery copy",
      resValid.message?.includes("If an account exists") === true
    );

    const createdTokens = Array.from(inMemoryResetTokens.values());
    test("Password reset token was generated and persisted in database", createdTokens.length === 1);
    test("Token has 32 bytes of cryptographic entropy (64 hex chars)", createdTokens[0]?.token.length === 64);
    test(
      "Token expires in approximately 1 hour",
      createdTokens[0]?.expires.getTime() > Date.now() + 55 * 60 * 1000
    );

    const sentEmails = getMockSentEmails();
    test("Email dispatcher accepted the message into test mailbox", sentEmails.length === 1);
    test("Dispatched email recipient matches target user", sentEmails[0]?.to === testStudentEmail);
    test("Dispatched email contains valid reset URL with token", sentEmails[0]?.resetUrl.includes(`token=${createdTokens[0]?.token}`));

    // -------------------------------------------------------------
    // Test 3: Unregistered Email Request Without Account Enumeration
    // -------------------------------------------------------------
    console.log("\nSection 3: Unregistered Email Request (Anti-Enumeration)");
    clearMockSentEmails();

    const unregisteredEmail = `ghost_user_${runId}@nowhere.com`;
    const resUnregistered = await forgotPasswordAction({
      email: unregisteredEmail,
      turnstileToken: "1x00000000000000000000AA",
    });

    test("Returns success: true for unregistered email (prevent enumeration)", resUnregistered.success === true);
    test(
      "Response message is IDENTICAL to registered email response",
      resUnregistered.message === resValid.message
    );
    test("No reset token is created for non-existent email", Array.from(inMemoryResetTokens.values()).filter((t) => t.email === unregisteredEmail).length === 0);
    test("No email is dispatched for non-existent email", getMockSentEmails().length === 0);

    // -------------------------------------------------------------
    // Test 4: Missing or Malformed Email in Mobile API Route
    // -------------------------------------------------------------
    console.log("\nSection 4: Mobile API Route Validation (POST /api/v1/auth/forgot-password)");

    const reqBadBody = new Request("http://localhost:3000/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not_a_valid_email" }),
    });
    const resMobileBad = await mobileForgotPasswordRoute(reqBadBody);
    test("Mobile route returns HTTP 400 for malformed email", resMobileBad.status === 400);

    const reqMissingBody = new Request("http://localhost:3000/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json",
    });
    const resMobileJsonErr = await mobileForgotPasswordRoute(reqMissingBody);
    test("Mobile route returns HTTP 400 for malformed JSON body", resMobileJsonErr.status === 400);

    // -------------------------------------------------------------
    // Test 5: Email Provider Failure Handling & Token Rollback
    // -------------------------------------------------------------
    console.log("\nSection 5: Email Provider Failure Handling & Token Rollback");

    // Temporarily disable mock mode to test provider failure behavior
    delete process.env.EMAIL_MOCK;
    (process.env as any).NODE_ENV = "production";
    process.env.RESEND_API_KEY = "re_placeholder_key"; // Unconfigured placeholder

    const resUnconfigured = await forgotPasswordAction({
      email: testStudentEmail,
      turnstileToken: "1x00000000000000000000AA",
    });

    test("Fails early when RESEND_API_KEY is placeholder or unconfigured", resUnconfigured.success === false);
    test(
      "Error indicates temporary service unavailability rather than false success",
      resUnconfigured.error?.includes("unavailable") === true
    );

    // Mobile route also fails early with HTTP 503 before database lookup
    const reqUnconfigured = new Request("http://localhost:3000/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testStudentEmail }),
    });
    const resMobileUnconfigured = await mobileForgotPasswordRoute(reqUnconfigured);
    test("Mobile route returns HTTP 503 when email provider is unconfigured", resMobileUnconfigured.status === 503);

    // Restore mock mode for remaining functional tests
    process.env.EMAIL_MOCK = "true";
    (process.env as any).NODE_ENV = "test";
    process.env.RESEND_API_KEY = "re_test_selffits_resend_key";

    // -------------------------------------------------------------
    // Test 6: Correct Reset URL Generation (Staging vs Production)
    // -------------------------------------------------------------
    console.log("\nSection 6: Correct Reset URL Generation (Staging vs Production)");

    // Test A: Localhost development
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    test("Resolves local dev URL as http://localhost:3000", getAppBaseUrl() === "http://localhost:3000");

    // Test B: Vercel Preview / Staging deployment
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "selffits-git-staging-org.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "selffits.com"; // Set by Vercel system on all branches
    test(
      "Staging preview deployment resolves to VERCEL_URL, NEVER selffits.com",
      getAppBaseUrl() === "https://selffits-git-staging-org.vercel.app"
    );

    // Test C: Explicit NEXT_PUBLIC_APP_URL override (e.g. custom staging domain)
    process.env.NEXT_PUBLIC_APP_URL = "https://staging.selffits.com";
    test(
      "NEXT_PUBLIC_APP_URL takes precedence for custom staging domain",
      getAppBaseUrl() === "https://staging.selffits.com"
    );

    // Test D: Production Vercel deployment
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "selffits.com";
    test("Production Vercel deployment resolves to production URL", getAppBaseUrl() === "https://selffits.com");

    // Restore test environment
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    // -------------------------------------------------------------
    // Test 7: Invalid and Expired Reset Tokens
    // -------------------------------------------------------------
    console.log("\nSection 7: Invalid and Expired Reset Tokens");

    const resInvalidToken = await resetPasswordAction({
      token: "non_existent_token_hex_99999",
      password: updatedPassword,
      confirmPassword: updatedPassword,
      turnstileToken: "1x00000000000000000000AA",
    });
    test("Rejects non-existent reset token", resInvalidToken.success === false);
    test("Error message indicates invalid or already used link", resInvalidToken.error?.includes("Invalid or already used") === true);

    // Create an expired token (expired 10 minutes ago)
    const expiredTokenString = "expired_token_hex_000001";
    inMemoryResetTokens.set(expiredTokenString, {
      email: testStudentEmail,
      token: expiredTokenString,
      expires: new Date(Date.now() - 10 * 60 * 1000),
    });

    const resExpiredToken = await resetPasswordAction({
      token: expiredTokenString,
      password: updatedPassword,
      confirmPassword: updatedPassword,
      turnstileToken: "1x00000000000000000000AA",
    });
    test("Rejects expired reset token", resExpiredToken.success === false);
    test("Error indicates link has expired", resExpiredToken.error?.includes("expired") === true);
    test("Expired token was cleaned up from database", inMemoryResetTokens.has(expiredTokenString) === false);

    // -------------------------------------------------------------
    // Test 8: Successful Password Reset
    // -------------------------------------------------------------
    console.log("\nSection 8: Successful Password Reset");
    clearMockSentEmails();
    inMemoryResetTokens.clear();

    // Generate fresh valid token via forgotPasswordAction
    await forgotPasswordAction({
      email: testStudentEmail,
      turnstileToken: "1x00000000000000000000AA",
    });

    const activeTokenRecord = Array.from(inMemoryResetTokens.values())[0];
    assert(activeTokenRecord, "Expected an active token in database");

    const resResetSuccess = await resetPasswordAction({
      token: activeTokenRecord.token,
      password: updatedPassword,
      confirmPassword: updatedPassword,
      turnstileToken: "1x00000000000000000000AA",
    });

    test("resetPasswordAction returns success: true", resResetSuccess.success === true);
    test(
      "Success message confirms password was reset",
      resResetSuccess.message?.includes("password has been reset successfully") === true
    );

    // -------------------------------------------------------------
    // Test 9: Reuse of Already-Consumed Token
    // -------------------------------------------------------------
    console.log("\nSection 9: Reuse of Already-Consumed Token");

    const resReuse = await resetPasswordAction({
      token: activeTokenRecord.token,
      password: "AnotherNewPassword@999",
      confirmPassword: "AnotherNewPassword@999",
      turnstileToken: "1x00000000000000000000AA",
    });

    test("Immediately rejects second attempt with already-consumed token", resReuse.success === false);
    test("Token was deleted from database upon successful reset", inMemoryResetTokens.has(activeTokenRecord.token) === false);

    // -------------------------------------------------------------
    // Test 10: Login with the New Password
    // -------------------------------------------------------------
    console.log("\nSection 10: Login with the New Password");

    const updatedUser = inMemoryUsers.get(testStudentEmail);
    assert(updatedUser, "Expected updated user record");

    const newPasswordValid = await bcrypt.compare(updatedPassword, updatedUser.passwordHash);
    test("Bcrypt verification succeeds with the NEW password", newPasswordValid === true);

    // -------------------------------------------------------------
    // Test 11: Login with the Old Password
    // -------------------------------------------------------------
    console.log("\nSection 11: Login with the Old Password");

    const oldPasswordValid = await bcrypt.compare(initialPassword, updatedUser.passwordHash);
    test("Bcrypt verification FAILS with the OLD password", oldPasswordValid === false);

    // -------------------------------------------------------------
    // Test 12: Resend / Repeat Forgot Password Behavior
    // -------------------------------------------------------------
    console.log("\nSection 12: Resend / Repeat Forgot Password Behavior");
    inMemoryResetTokens.clear();
    clearMockSentEmails();

    // First request
    await forgotPasswordAction({
      email: testStudentEmail,
      turnstileToken: "1x00000000000000000000AA",
    });
    const firstToken = Array.from(inMemoryResetTokens.values())[0]?.token;

    // Second request (user clicks Resend or submits again)
    await forgotPasswordAction({
      email: testStudentEmail,
      turnstileToken: "1x00000000000000000000AA",
    });
    const secondToken = Array.from(inMemoryResetTokens.values())[0]?.token;

    test("Previous unconsumed token was replaced (only 1 token exists for email)", inMemoryResetTokens.size === 1);
    test("New token is cryptographically distinct from previous token", firstToken !== secondToken);
  } finally {
    // Restore original DB methods
    db.user.findUnique = origFindUniqueUser;
    db.user.update = origUpdateUser;
    db.passwordResetToken.create = origCreateToken;
    db.passwordResetToken.findUnique = origFindUniqueToken;
    db.passwordResetToken.findFirst = origFindFirstToken;
    db.passwordResetToken.delete = origDeleteToken;
    db.passwordResetToken.deleteMany = origDeleteManyToken;
    db.$transaction = origTransaction;
    db.rateLimitRecord.findMany = origRateLimitFindMany;
    db.rateLimitRecord.deleteMany = origRateLimitDeleteMany;
    db.rateLimitRecord.create = origRateLimitCreate;
  }

  console.log("\n=================================================================");
  console.log(` Forgot Password Flow Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runForgotPasswordFlowTests().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});

