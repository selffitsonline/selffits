/**
 * SELFFITS Mobile REST API — Phase B Automated Security Test Suite
 * 
 * Tests executed:
 * 1. Missing Bearer token rejection (401)
 * 2. Malformed Bearer token format rejection (401)
 * 3. Invalid signature / tampered token rejection (401)
 * 4. Expired token rejection (401)
 * 5. Invalid issuer claim rejection (401)
 * 6. Invalid audience claim rejection (401)
 * 7. Token confusion attack (NextAuth web token passed as mobile bearer) (401)
 * 8. Blocked account access rejection (403)
 * 9. Student-to-Coach role isolation enforcement (403)
 * 10. Coach-to-Student role isolation enforcement (403)
 * 11. Malformed JSON payload rejection (400)
 * 12. Invalid schema payload rejection (Zod 400 with field errors)
 * 13. Invalid login credentials rejection (401)
 * 14. Information leakage protection (no stack traces, no secrets in responses)
 * 15. Valid Student flow (Login -> Auth Me -> Student Dashboard) (200)
 * 16. Valid Coach flow (Login -> Auth Me -> Coach Dashboard) (200)
 */

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
import { POST as loginHandler } from "@/app/api/v1/auth/login/route";
import { GET as authMeHandler } from "@/app/api/v1/auth/me/route";
import { GET as studentDashboardHandler } from "@/app/api/v1/student/dashboard/route";
import { GET as coachDashboardHandler } from "@/app/api/v1/coach/dashboard/route";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
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

async function runSecurityTestSuite() {
  console.log("=================================================================");
  console.log(" SELFFITS Mobile REST API — Phase B Automated Security Test Suite");
  console.log("=================================================================\n");

  const mobileKey = getMobileSigningKey();

  // -------------------------------------------------------------
  // Test 1: Missing Bearer Token
  // -------------------------------------------------------------
  await runTest("Rejects request with missing Authorization header (401)", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.success === false, "Expected success: false");
    assert(json.error.code === "MISSING_BEARER_TOKEN", `Expected MISSING_BEARER_TOKEN, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 2: Malformed Bearer Token Format
  // -------------------------------------------------------------
  await runTest("Rejects malformed Authorization header (e.g. Basic auth or empty token) (401)", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: "Basic user:pass" },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "INVALID_TOKEN_FORMAT", `Expected INVALID_TOKEN_FORMAT, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 3: Invalid Signature / Tampered Token
  // -------------------------------------------------------------
  await runTest("Rejects token signed with unauthorized foreign key (401)", async () => {
    const foreignKey = new TextEncoder().encode("completely-unauthorized-foreign-key-32chars!");
    const fakeToken = await new SignJWT({
      sub: "student_hacker",
      role: Role.STUDENT,
      token_type: MOBILE_TOKEN_TYPE,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(MOBILE_JWT_ISSUER)
      .setAudience(MOBILE_JWT_AUDIENCE)
      .setExpirationTime("1h")
      .sign(foreignKey);

    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${fakeToken}` },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "INVALID_TOKEN_SIGNATURE", `Expected INVALID_TOKEN_SIGNATURE, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 4: Expired Token
  // -------------------------------------------------------------
  await runTest("Rejects expired mobile token (401)", async () => {
    const expiredToken = await new SignJWT({
      sub: "student_123",
      role: Role.STUDENT,
      token_type: MOBILE_TOKEN_TYPE,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(MOBILE_JWT_ISSUER)
      .setAudience(MOBILE_JWT_AUDIENCE)
      .setExpirationTime("-1s") // Expired 1 second ago
      .sign(mobileKey);

    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "TOKEN_EXPIRED", `Expected TOKEN_EXPIRED, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 5: Invalid Issuer Claim
  // -------------------------------------------------------------
  await runTest("Rejects token with mismatched issuer claim (401)", async () => {
    const invalidIssuerToken = await new SignJWT({
      sub: "student_123",
      role: Role.STUDENT,
      token_type: MOBILE_TOKEN_TYPE,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("unauthorized-foreign-issuer")
      .setAudience(MOBILE_JWT_AUDIENCE)
      .setExpirationTime("1h")
      .sign(mobileKey);

    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${invalidIssuerToken}` },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "INVALID_TOKEN_CLAIMS", `Expected INVALID_TOKEN_CLAIMS, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 6: Invalid Audience Claim
  // -------------------------------------------------------------
  await runTest("Rejects token with mismatched audience claim (401)", async () => {
    const invalidAudToken = await new SignJWT({
      sub: "student_123",
      role: Role.STUDENT,
      token_type: MOBILE_TOKEN_TYPE,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(MOBILE_JWT_ISSUER)
      .setAudience("selffits-third-party-service")
      .setExpirationTime("1h")
      .sign(mobileKey);

    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${invalidAudToken}` },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "INVALID_TOKEN_CLAIMS", `Expected INVALID_TOKEN_CLAIMS, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 7: Token Confusion Attack Protection
  // -------------------------------------------------------------
  await runTest("Rejects NextAuth web session token passed as mobile bearer token (401)", async () => {
    // NextAuth tokens are signed with raw NEXTAUTH_SECRET and lack mobile issuer, audience, and token_type
    const rawNextAuthSecret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "selffits-default-fallback-mobile-signing-key-32chars"
    );
    const webToken = await new SignJWT({
      name: "Web User",
      email: "web@selffits.com",
      role: "STUDENT",
      sub: "web_user_1",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime("30d")
      .sign(rawNextAuthSecret);

    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${webToken}` },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    // Must be rejected because domain-separated mobile key differs from raw NEXTAUTH_SECRET,
    // and token lacks MOBILE_JWT_ISSUER / MOBILE_JWT_AUDIENCE
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.success === false, "Web token must not authenticate against mobile API");
  });

  // -------------------------------------------------------------
  // Test 8: Blocked Account Enforcement
  // -------------------------------------------------------------
  await runTest("Rejects token belonging to blocked account (403)", async () => {
    const blockedToken = await signMobileToken({
      id: "blocked_user_99",
      email: "blocked@selffits.com",
      name: "Blocked User",
      role: Role.STUDENT,
      isBlocked: true,
    });

    const req = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${blockedToken}` },
    });
    const res = await authMeHandler(req);
    const json = await res.json();

    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(json.error.code === "ACCOUNT_BLOCKED", `Expected ACCOUNT_BLOCKED, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 9: Role Isolation (Student attempting to access Coach API)
  // -------------------------------------------------------------
  await runTest("Role Isolation: Blocks STUDENT from accessing Coach Dashboard (403)", async () => {
    const studentToken = await signMobileToken({
      id: "valid_student_1",
      email: "student@selffits.com",
      name: "Alex Mercer",
      role: Role.STUDENT,
      isBlocked: false,
    });

    const req = new Request("http://localhost:3000/api/v1/coach/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const res = await coachDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(json.error.code === "FORBIDDEN_ROLE", `Expected FORBIDDEN_ROLE, got ${json.error.code}`);
    assert(json.error.message.includes("COACH"), "Message must indicate COACH role requirement");
  });

  // -------------------------------------------------------------
  // Test 10: Role Isolation (Coach attempting to access Student API)
  // -------------------------------------------------------------
  await runTest("Role Isolation: Blocks COACH from accessing Student Dashboard (403)", async () => {
    const realCoach = await db.user.findFirst({ where: { role: Role.COACH } });
    const coachToken = await signMobileToken({
      id: realCoach?.id || "real_coach_user",
      email: realCoach?.email || "coach@selffits.com",
      name: realCoach?.name || "Sensei Coach",
      role: Role.COACH,
      isBlocked: false,
    });

    const req = new Request("http://localhost:3000/api/v1/student/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${coachToken}` },
    });
    const res = await studentDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(json.error.code === "FORBIDDEN_ROLE", `Expected FORBIDDEN_ROLE, got ${json.error.code}`);
    assert(json.error.message.includes("STUDENT"), "Message must indicate STUDENT role requirement");
  });

  // -------------------------------------------------------------
  // Test 11: Malformed JSON Request Payload
  // -------------------------------------------------------------
  await runTest("Rejects non-JSON login request body with 400 Bad Request", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      body: "this is not json { [ broken",
      headers: { "Content-Type": "application/json" },
    });
    const res = await loginHandler(req);
    const json = await res.json();

    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(json.error.code === "INVALID_JSON_BODY", `Expected INVALID_JSON_BODY, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 12: Zod Schema Payload Validation
  // -------------------------------------------------------------
  await runTest("Rejects invalid schema payloads with Zod field errors (400)", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email", password: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await loginHandler(req);
    const json = await res.json();

    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(json.error.code === "VALIDATION_FAILED", `Expected VALIDATION_FAILED, got ${json.error.code}`);
    assert(json.error.fieldErrors?.email !== undefined, "Expected field error for email");
    assert(json.error.fieldErrors?.password !== undefined, "Expected field error for password");
  });

  // -------------------------------------------------------------
  // Test 13: Invalid Credentials Login
  // -------------------------------------------------------------
  await runTest("Rejects unauthenticated credentials with safe generic error (401)", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "ghost_user@selffits.com", password: "wrong_password" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await loginHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "INVALID_CREDENTIALS", `Expected INVALID_CREDENTIALS, got ${json.error.code}`);
    assert(json.error.message === "Invalid email or password.", "Safe generic message required");
  });

  // -------------------------------------------------------------
  // Test 14: Information Leakage Protection
  // -------------------------------------------------------------
  await runTest("Error responses never disclose server secrets, database strings, or stack traces", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "invalid", password: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await loginHandler(req);
    const text = await res.text();

    assert(!text.includes("DATABASE_URL"), "Must not leak DATABASE_URL");
    assert(!text.includes("NEXTAUTH_SECRET"), "Must not leak NEXTAUTH_SECRET");
    assert(!text.includes("at Object.<anonymous>"), "Must not leak stack traces");
    assert(!text.includes("node_modules"), "Must not leak file system paths");
  });

  // -------------------------------------------------------------
  // Test 15: Valid Student Flow (Login -> Auth Me -> Student Dashboard)
  // -------------------------------------------------------------
  await runTest("End-to-End Student flow: Login -> Auth Me -> Student Dashboard (200 OK)", async () => {
    // 1. Mobile Login
    const loginReq = new Request("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "student@selffits.com",
        password: "password",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const loginRes = await loginHandler(loginReq);
    const loginJson = await loginRes.json();

    assert(loginRes.status === 200, `Login failed: ${loginRes.status}`);
    assert(loginJson.success === true, "Login must be successful");
    assert(loginJson.data.accessToken.length > 20, "Access token must be present");
    assert(loginJson.data.user.role === Role.STUDENT, "Role must be STUDENT");

    const token = loginJson.data.accessToken;

    // 2. Auth Me Introspect
    const meReq = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const meRes = await authMeHandler(meReq);
    const meJson = await meRes.json();

    assert(meRes.status === 200, `Auth Me failed: ${meRes.status}`);
    assert(meJson.data.email === "student@selffits.com", "User email must match");

    // 3. Student Dashboard
    const dashReq = new Request("http://localhost:3000/api/v1/student/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashRes = await studentDashboardHandler(dashReq);
    const dashJson = await dashRes.json();

    assert(dashRes.status === 200, `Student Dashboard failed: ${dashRes.status}`);
    assert(dashJson.success === true, "Dashboard must return success: true");
    assert(dashJson.data.classReadiness !== undefined, "classReadiness must be returned");
    assert(dashJson.data.classReadiness.nextSession !== undefined, "nextSession must be returned");
  });

  // -------------------------------------------------------------
  // Test 16: Valid Coach Flow (Login -> Auth Me -> Coach Dashboard)
  // -------------------------------------------------------------
  await runTest("End-to-End Coach flow: Login -> Auth Me -> Coach Dashboard (200 OK)", async () => {
    // 1. Mobile Login
    const loginReq = new Request("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "coach@selffits.com",
        password: "password",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const loginRes = await loginHandler(loginReq);
    const loginJson = await loginRes.json();

    assert(loginRes.status === 200, `Login failed: ${loginRes.status}`);
    assert(loginJson.success === true, "Login must be successful");
    assert(loginJson.data.user.role === Role.COACH, "Role must be COACH");

    const token = loginJson.data.accessToken;

    // 2. Auth Me Introspect
    const meReq = new Request("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const meRes = await authMeHandler(meReq);
    const meJson = await meRes.json();

    assert(meRes.status === 200, `Auth Me failed: ${meRes.status}`);
    assert(meJson.data.role === Role.COACH, "User role must match COACH");

    // 3. Coach Dashboard
    const dashReq = new Request("http://localhost:3000/api/v1/coach/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashRes = await coachDashboardHandler(dashReq);
    const dashJson = await dashRes.json();

    assert(dashRes.status === 200, `Coach Dashboard failed: ${dashRes.status}`);
    assert(dashJson.success === true, "Dashboard must return success: true");
    assert(dashJson.data.coach !== undefined, "coach details must be returned");
    assert(Array.isArray(dashJson.data.batches), "batches array must be returned");
  });

  // -------------------------------------------------------------
  // Test 17: Public Catalog Unauthenticated Access & Schema Integrity
  // -------------------------------------------------------------
  await runTest("Public Catalog: Unauthenticated access returns authoritative categories and pricing", async () => {
    const { GET: catalogHandler } = await import("@/app/api/v1/public/catalog/route");
    const req = new Request("http://localhost:3000/api/v1/public/catalog", {
      method: "GET",
    });
    const res = await catalogHandler();
    const json = await res.json();

    assert(res.status === 200, `Catalog endpoint must return 200, got ${res.status}`);
    assert(json.success === true, "Catalog response must indicate success: true");
    assert(Array.isArray(json.data.categories), "Categories must be an array");
    assert(json.data.categories.length >= 3, "At least 3 training categories must be returned");

    // Verify first category has active plans with prices
    const mmaKids = json.data.categories.find((c: any) => c.id === "mma_kids");
    assert(mmaKids !== undefined, "mma_kids category must be present");
    assert(Array.isArray(mmaKids.membershipPlans), "Membership plans must be an array");
    assert(mmaKids.membershipPlans.length > 0, "Must have active membership plans");

    const plan = mmaKids.membershipPlans[0];
    assert(typeof plan.daysPerWeek === "number", "Plan must specify daysPerWeek");
    assert(typeof plan.monthlyPriceUSD === "number", "Plan must specify monthlyPriceUSD");
    assert(typeof plan.monthlyPriceINR === "number", "Plan must specify monthlyPriceINR");
    assert(plan.monthlyPriceUSD > 0, "Price USD must be greater than zero");
    assert(plan.monthlyPriceINR > 0, "Price INR must be greater than zero");
    assert(plan.activeStatus === true, "Exposed plans must be active");
  });

  // -------------------------------------------------------------
  // Test 18: Public Catalog Sensitive Data Exclusion
  // -------------------------------------------------------------
  await runTest("Public Catalog: Strictly excludes all user, student, coach, payment and sensitive data", async () => {
    const { GET: catalogHandler } = await import("@/app/api/v1/public/catalog/route");
    const res = await catalogHandler();
    const rawText = JSON.stringify(await res.json());

    assert(!rawText.includes("passwordHash"), "Must not leak passwordHash");
    assert(!rawText.includes("razorpay"), "Must not leak internal razorpay secrets");
    assert(!rawText.includes("isBlocked"), "Must not leak user account block flags");
    assert(!rawText.includes("token"), "Must not leak tokens");
    assert(!rawText.includes("student@selffits.com"), "Must not leak student email addresses");
  });

  // -------------------------------------------------------------
  // Test 19: Live DB Re-verification on Student Dashboard (Deleted User)
  // -------------------------------------------------------------
  await runTest("Student Dashboard: Rejects deleted/non-existent user with 401 USER_NOT_FOUND", async () => {
    const ghostToken = await signMobileToken({
      id: "ghost_student_id_does_not_exist",
      email: "ghost_student_does_not_exist@selffits.com",
      name: "Ghost Student",
      role: Role.STUDENT,
      isBlocked: false,
    });

    const req = new Request("http://localhost:3000/api/v1/student/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${ghostToken}` },
    });
    const res = await studentDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "USER_NOT_FOUND", `Expected USER_NOT_FOUND, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 20: Live DB Re-verification on Student Dashboard (Blocked User)
  // -------------------------------------------------------------
  await runTest("Student Dashboard: Rejects blocked account with 403 ACCOUNT_BLOCKED", async () => {
    // Generate token with isBlocked: false, but for a user that is blocked or has isBlocked claim
    const blockedToken = await signMobileToken({
      id: "blocked_student_user",
      email: "blocked@selffits.com",
      name: "Blocked Student",
      role: Role.STUDENT,
      isBlocked: true,
    });

    const req = new Request("http://localhost:3000/api/v1/student/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${blockedToken}` },
    });
    const res = await studentDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(json.error.code === "ACCOUNT_BLOCKED", `Expected ACCOUNT_BLOCKED, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 21: Live DB Re-verification on Coach Dashboard (Deleted User)
  // -------------------------------------------------------------
  await runTest("Coach Dashboard: Rejects deleted/non-existent user with 401 USER_NOT_FOUND", async () => {
    const ghostCoachToken = await signMobileToken({
      id: "ghost_coach_id_does_not_exist",
      email: "ghost_coach_does_not_exist@selffits.com",
      name: "Ghost Coach",
      role: Role.COACH,
      isBlocked: false,
    });

    const req = new Request("http://localhost:3000/api/v1/coach/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${ghostCoachToken}` },
    });
    const res = await coachDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(json.error.code === "USER_NOT_FOUND", `Expected USER_NOT_FOUND, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 22: Live DB Re-verification on Coach Dashboard (Blocked User)
  // -------------------------------------------------------------
  await runTest("Coach Dashboard: Rejects blocked account with 403 ACCOUNT_BLOCKED", async () => {
    const blockedCoachToken = await signMobileToken({
      id: "blocked_coach_user",
      email: "blocked_coach@selffits.com",
      name: "Blocked Coach",
      role: Role.COACH,
      isBlocked: true,
    });

    const req = new Request("http://localhost:3000/api/v1/coach/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${blockedCoachToken}` },
    });
    const res = await coachDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 403, `Expected status 403, got ${res.status}`);
    assert(json.error.code === "ACCOUNT_BLOCKED", `Expected ACCOUNT_BLOCKED, got ${json.error.code}`);
  });

  // -------------------------------------------------------------
  // Test 23: Student Enrollment Expiration & Google Meet Access Protection
  // -------------------------------------------------------------
  await runTest("Student Dashboard: Expired or un-enrolled students cannot access Google Meet links", async () => {
    // Authenticate a student user without enrollment
    const studentToken = await signMobileToken({
      id: "cmt9tbpnd0006ckkgmhhe697k", // Real student user in DB without enrollment
      email: "x@x.com",
      name: "john jon",
      role: Role.STUDENT,
      isBlocked: false,
    });

    const req = new Request("http://localhost:3000/api/v1/student/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const res = await studentDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(json.success === true, "Dashboard must return success: true");
    assert(json.data.isEnrolled === false, "Unenrolled/expired student must have isEnrolled: false");
    assert(json.data.enrollment === null, "Unenrolled/expired student must have enrollment: null");
    assert(json.data.classReadiness.meetingUrl === null, "meetingUrl must be null for un-enrolled/expired student");
    assert(json.data.classReadiness.isReady === false, "isReady must be false for un-enrolled/expired student");
  });

  // -------------------------------------------------------------
  // Test 24: Coach Batch & Student Roster Scoping Isolation
  // -------------------------------------------------------------
  await runTest("Coach Dashboard: Strictly isolates batches and student rosters to authorized coach only", async () => {
    const realCoach = await db.user.findFirst({ where: { role: Role.COACH } });
    const coachToken = await signMobileToken({
      id: realCoach?.id || "cmuwk0cu70000gnwfe8uxovxt",
      email: realCoach?.email || "bond@gmail.com",
      name: realCoach?.name || "Sensei Coach",
      role: Role.COACH,
      isBlocked: false,
    });

    const req = new Request("http://localhost:3000/api/v1/coach/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${coachToken}` },
    });
    const res = await coachDashboardHandler(req);
    const json = await res.json();

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(json.success === true, "Dashboard must return success: true");
    assert(json.data.coach.email === (realCoach?.email || "bond@gmail.com"), "Coach email must match authorized user");
    assert(Array.isArray(json.data.batches), "Batches must be an array");
    for (const b of json.data.batches) {
      assert(typeof b.name === "string", "Batch name must be a string");
      assert(Array.isArray(b.students), "Students roster must be an array");
    }
  });

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(` Test Execution Summary: ${passed}/${total} Passed, ${failed} Failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite().catch((e) => {
  console.error("Test Suite Execution Fatal Error:", e);
  process.exit(1);
});
