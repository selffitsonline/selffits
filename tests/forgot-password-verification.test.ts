/**
 * Dedicated Password Reset Flow Verification Test
 * Tests each stage separately:
 * 1. Form submission / API response validation
 * 2. Bot verification (Cloudflare Turnstile)
 * 3. Account-enumeration preservation for non-existing users
 * 4. Password reset token creation & rollback on email delivery failure
 * 5. Email provider error detection (rejects false success when Resend fails)
 * 6. Password reset token consumption & single-use security
 */

import { strict as assert } from "node:assert";
import { db } from "../lib/db";
import bcrypt from "bcryptjs";
import { forgotPasswordAction, resetPasswordAction } from "../actions/auth.actions";

async function runForgotPasswordVerification() {
  console.log("==================================================================");
  console.log("STARTING FORGOT PASSWORD STAGE-BY-STAGE VERIFICATION TEST");
  console.log("==================================================================\n");

  const runId = Date.now();
  const testRealEmail = `test_recovery_${runId}@selffits.com`;
  const testMockEmail = `test_recovery_${runId}@selffits-test.local`;
  const testPassword = "InitialPassword@123";
  const newPassword = "UpdatedPassword@456";

  // Clear any existing rate limits for local test runner IP
  await db.rateLimitRecord.deleteMany({
    where: { key: { contains: "127.0.0.1" } },
  });

  // Create test user with real domain for failure testing
  const passwordHash = await bcrypt.hash(testPassword, 10);
  const realUser = await db.user.create({
    data: {
      name: "Test Recovery User",
      firstName: "Test",
      lastName: "Recovery",
      email: testRealEmail,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  // Create test user with test domain for mock flow
  const mockUser = await db.user.create({
    data: {
      name: "Test Mock User",
      firstName: "Mock",
      lastName: "User",
      email: testMockEmail,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  try {
    // -------------------------------------------------------------
    // STAGE 1: Bot Protection (Turnstile)
    // -------------------------------------------------------------
    console.log("--- STAGE 1: BOT PROTECTION & INPUT VALIDATION ---");
    const missingTurnstile = await forgotPasswordAction({
      email: testRealEmail,
      turnstileToken: "",
    });
    assert.strictEqual(missingTurnstile.success, false, "Must reject missing Turnstile token");
    console.log("  ✓ PASS: Rejects missing Turnstile token");

    const invalidEmail = await forgotPasswordAction({
      email: "not-an-email",
      turnstileToken: "1x00000000000000000000AA",
    });
    assert.strictEqual(invalidEmail.success, false, "Must reject invalid email format");
    console.log("  ✓ PASS: Rejects invalid email format");

    // -------------------------------------------------------------
    // STAGE 2: Account-Enumeration Protection (Non-existent user)
    // -------------------------------------------------------------
    console.log("\n--- STAGE 2: ACCOUNT ENUMERATION PROTECTION ---");
    const unknownEmail = `nonexistent_${runId}@selffits.com`;
    const unknownRes = await forgotPasswordAction({
      email: unknownEmail,
      turnstileToken: "1x00000000000000000000AA",
    });
    assert.strictEqual(unknownRes.success, true, "Must return success: true for unknown email");
    assert.ok(
      unknownRes.message?.includes("If an account exists"),
      "Must return generic safe message"
    );
    console.log("  ✓ PASS: Returns generic success for non-existent account without disclosing user existence");

    // -------------------------------------------------------------
    // STAGE 3: Provider Failure & Preventing False Success
    // -------------------------------------------------------------
    console.log("\n--- STAGE 3: PROVIDER ERROR HANDLING & FALSE-SUCCESS PREVENTION ---");
    // With real domain testRealEmail and placeholder Resend key, Resend API rejects the request
    const failureRes = await forgotPasswordAction({
      email: testRealEmail,
      turnstileToken: "1x00000000000000000000AA",
    });

    assert.strictEqual(
      failureRes.success,
      false,
      "CRITICAL: Must NOT return success: true when email delivery fails!"
    );
    assert.ok(
      failureRes.error?.includes("Unable to send") || failureRes.error?.includes("delivery service"),
      "Must return truthful error message indicating email delivery issue"
    );
    console.log("  ✓ PASS: Accurately reports email delivery failure (no false success)");

    // Verify token rollback in DB
    const orphanToken = await db.passwordResetToken.findFirst({
      where: { email: testRealEmail },
    });
    assert.strictEqual(
      orphanToken,
      null,
      "Token must be deleted/rolled back from DB when email dispatch fails"
    );
    console.log("  ✓ PASS: Orphan reset token rolled back from database upon delivery failure");

    // -------------------------------------------------------------
    // STAGE 4: Successful Email Dispatch & Token Lifecycle
    // -------------------------------------------------------------
    console.log("\n--- STAGE 4: TOKEN CREATION, EXPIRY & CONSUMPTION ---");
    const mockRes = await forgotPasswordAction({
      email: testMockEmail,
      turnstileToken: "1x00000000000000000000AA",
    });

    assert.strictEqual(mockRes.success, true, "Must return success for mock email");

    const createdToken = await db.passwordResetToken.findFirst({
      where: { email: testMockEmail },
    });
    assert.ok(createdToken, "Token record must exist in DB");
    assert.ok(
      createdToken.expires.getTime() > Date.now(),
      "Token expiry must be in the future (1 hour)"
    );
    console.log("  ✓ PASS: Token generated with valid 1-hour expiration");

    // Reset password using the generated token
    const resetRes = await resetPasswordAction({
      token: createdToken.token,
      password: newPassword,
      confirmPassword: newPassword,
      turnstileToken: "1x00000000000000000000AA",
    });

    if (!resetRes.success) {
      console.error("resetRes failure:", resetRes);
    }
    assert.strictEqual(resetRes.success, true, "Password reset must succeed with valid token");
    console.log("  ✓ PASS: Password successfully reset with generated token");

    // Single-use verification: token must be deleted after use
    const usedToken = await db.passwordResetToken.findFirst({
      where: { token: createdToken.token },
    });
    assert.strictEqual(usedToken, null, "Token must be deleted immediately upon use");
    console.log("  ✓ PASS: Token is strictly single-use and removed from database");

    console.log("\n==================================================================");
    console.log("ALL STAGE-BY-STAGE FORGOT PASSWORD TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================================");
  } finally {
    // Clean up test data
    await db.passwordResetToken.deleteMany({
      where: { email: { in: [testRealEmail, testMockEmail] } },
    });
    await db.user.deleteMany({
      where: { email: { in: [testRealEmail, testMockEmail] } },
    });
  }
}

runForgotPasswordVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL TEST FAILURE:", err);
    process.exit(1);
  });
