# SELFFITS Mobile App — Phase 2 Implementation Blueprint
## Native Flutter (Android/iOS) & Additive Next.js REST API Architecture

**Document Type:** Implementation-Ready Technical Blueprint & Engineering Specification  
**Document Path:** `/Users/macbook/Desktop/selffits/SELFFITS_MOBILE_APP_IMPLEMENTATION_BLUEPRINT.md`  
**Target Repository:** SELFFITS Virtual Martial Arts & Fitness Academy (`/Users/macbook/Desktop/selffits`)  
**Date:** October 16, 2026  
**Status:** Planning & Design Authorization Only (Zero Code Changes, Zero Deployments)  
**Implementation Agent:** Antigravity AI  

---

## 1. Revalidation of Phase 1 Findings & Codebase Baseline

A thorough read-only re-inspection of the active codebase was conducted to revalidate the Phase 1 assessment against the actual source files. Every finding below is explicitly tagged as **[VERIFIED]**, **[INFERRED]**, or **[NOT VERIFIED]**.

### 1.1 Technical Stack Inventory

| Component | Verified Technology | Exact Version | Source Evidence | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.3.0` | [`package.json:20`](file:///Users/macbook/Desktop/selffits/package.json#L20) | **VERIFIED** |
| **Core UI** | React | `19.2.8` | [`package.json:24`](file:///Users/macbook/Desktop/selffits/package.json#L24) | **VERIFIED** |
| **Authentication** | NextAuth (Auth.js) | `5.0.0-beta.32` | [`package.json:21`](file:///Users/macbook/Desktop/selffits/package.json#L21), [`lib/auth.ts:8`](file:///Users/macbook/Desktop/selffits/lib/auth.ts#L8) | **VERIFIED** |
| **Cryptographic Tokens** | `jose` | `^6.0.6` | [`package-lock.json:63`](file:///Users/macbook/Desktop/selffits/package-lock.json#L63) | **VERIFIED** |
| **Database ORM** | Prisma Client & CLI | `^5.22.0` | [`package.json:14,40`](file:///Users/macbook/Desktop/selffits/package.json#L14) | **VERIFIED** |
| **Database Engine** | PostgreSQL | Hosted / Remote | [`prisma/schema.prisma:1-4`](file:///Users/macbook/Desktop/selffits/prisma/schema.prisma#L1-L4) | **VERIFIED** |
| **Payment Gateway** | Razorpay Node SDK | `^2.9.8` | [`package.json:23`](file:///Users/macbook/Desktop/selffits/package.json#L23), [`lib/razorpay.ts:1-6`](file:///Users/macbook/Desktop/selffits/lib/razorpay.ts#L1-L6) | **VERIFIED** |
| **Email Delivery** | Resend | `^6.18.1` | [`package.json:27`](file:///Users/macbook/Desktop/selffits/package.json#L27), [`lib/resend.ts:1-5`](file:///Users/macbook/Desktop/selffits/lib/resend.ts#L1-L5) | **VERIFIED** |
| **Styling Engine** | Tailwind CSS v4 | `^4.0.0` | [`package.json:41`](file:///Users/macbook/Desktop/selffits/package.json#L41), [`app/globals.css:1`](file:///Users/macbook/Desktop/selffits/app/globals.css#L1) | **VERIFIED** |
| **Validation** | Zod | `^4.4.3` | [`package.json:29`](file:///Users/macbook/Desktop/selffits/package.json#L29), [`types/validation.schemas.ts`](file:///Users/macbook/Desktop/selffits/types/validation.schemas.ts) | **VERIFIED** |
| **Password Hashing** | bcryptjs | `^3.0.3` | [`package.json:15`](file:///Users/macbook/Desktop/selffits/package.json#L15), [`actions/auth.actions.ts:5`](file:///Users/macbook/Desktop/selffits/actions/auth.actions.ts#L5) | **VERIFIED** |
| **Build Scripts** | `next build`, `prisma db push` | Standard npm | [`package.json:5-11`](file:///Users/macbook/Desktop/selffits/package.json#L5-L11) | **VERIFIED** |
| **Automated Testing** | None installed | N/A | No test runners in `package.json` | **VERIFIED** |
| **Deployment Target** | Vercel Serverless | Project ID: `prj_QR6mBaA7...` | [`.vercel/project.json`](file:///Users/macbook/Desktop/selffits/.vercel/project.json) | **VERIFIED** |

### 1.2 Critical Architectural Realities Revalidated

1. **Server Actions Dominate the Platform:**
   - 15 Server Action files exist in [`actions/`](file:///Users/macbook/Desktop/selffits/actions) containing ~250 KB of code.
   - Server Actions use Next.js's private internal RPC wire format with React Server Component (RSC) flight streaming. Native mobile clients **cannot** invoke these directly over standard HTTP.
   - Concrete finding: [`actions/students.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/students.actions.ts) and [`actions/content.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/content.actions.ts) are 6-line stubs. Active student business logic is actually implemented in [`actions/payments.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts), [`actions/batch.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts), [`actions/student-progress.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts), and [`actions/certificates.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/certificates.actions.ts). **[VERIFIED]**
2. **Current API Routes Are Limited:**
   - Existing endpoints in [`app/api/`](file:///Users/macbook/Desktop/selffits/app/api): NextAuth handler (`/api/auth/[...nextauth]`), Razorpay webhook (`/api/webhooks/razorpay`), certificate downloader (`/api/certificates/download/[id]`), diet guide downloader (`/api/diet-nutrition/download`), media streamer (`/api/media`), and multipart upload endpoints.
   - **Zero** JSON REST endpoints currently exist for student profile data, schedule queries, batch info, or dashboard metrics. **[VERIFIED]**
3. **Stateless JWT NextAuth Configuration:**
   - [`lib/auth.ts:9`](file:///Users/macbook/Desktop/selffits/lib/auth.ts#L9) configures `session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }`.
   - The database contains **no `Session` table**. All authentication state is stored inside signed tokens.
   - Web sessions are verified via HTTP-only cookies in [`middleware.ts:23-44`](file:///Users/macbook/Desktop/selffits/middleware.ts#L23-L44). **[VERIFIED]**
4. **Google Meet Single Source of Truth:**
   - Stored in `Batch.meetingUrl` (e.g. `https://meet.google.com/abc-defg-hij`).
   - Central schedule engine [`lib/class-schedule.ts`](file:///Users/macbook/Desktop/selffits/lib/class-schedule.ts) computes `nextSession` relative dates ("Today", "Tomorrow", "In X days"), day combinations, and GMT timings for both students and coaches. **[VERIFIED]**
5. **Class Recordings Reality:**
   - [`app/(student)/dashboard/recordings/page.tsx:9-34`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/recordings/page.tsx#L9-L34) uses static hardcoded sample data (`rec-1`, `rec-2`, `rec-3`). There is no `Recording` model in Prisma schema. **[VERIFIED]**
6. **Student Profile Edit Reality:**
   - [`app/(student)/dashboard/profile/page.tsx:60-72`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/profile/page.tsx#L60-L72) currently simulates profile updates in local React state (`setSavedMsg(...)`). The underlying `StudentProfile` model in [`prisma/schema.prisma:103-117`](file:///Users/macbook/Desktop/selffits/prisma/schema.prisma#L103-L117) possesses the fields, but persistence logic must be introduced in the REST API. **[VERIFIED]**
7. **Developer Accounts & Infrastructure:**
   - Apple Developer Program account ($99/year) and Google Play Console ($25) are not present in repository files. **[NOT VERIFIED - Pending Client Setup]**

---

## 2. REST API Architecture (`/api/v1/`)

An isolated, versioned API namespace under `/app/api/v1/` will be introduced. This architecture ensures complete decoupling from web routing and zero regression risk to existing Server Actions.

```
+---------------------------------------------------------------------------------------+
|                                REST API NAMESPACE DESIGN                              |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  /app/api/v1/                                                                         |
|    +-- auth/                                                                          |
|    |     +-- login/route.ts                POST -> Issues JWT + User Profile          |
|    |     +-- refresh/route.ts              POST -> Rotates / Extends Access Token     |
|    |     +-- logout/route.ts               POST -> Revokes Token                      |
|    |     +-- forgot-password/route.ts      POST -> Dispatches Resend Reset Token      |
|    +-- student/                                                                       |
|    |     +-- dashboard/route.ts            GET  -> Central Readiness, Enrollment, Next|
|    |     +-- schedule/route.ts             GET  -> Batch Schedule & Live Meet URL    |
|    |     +-- programs/route.ts             GET  -> Enrolled Courses & Remaining Quotas|
|    |     +-- programs/[id]/cancel/route.ts POST -> Cancels Expired Enrollment         |
|    |     +-- progress/route.ts             GET  -> Belt Progression & Exam Schedule  |
|    |     +-- certificates/route.ts         GET  -> Issued Certificates & Belt Badges  |
|    |     +-- profile/route.ts              GET, PUT -> Queries/Updates Profile Data   |
|    |     +-- notifications/route.ts        GET, PATCH -> List & Mark In-App Alerts    |
|    +-- coach/                                                                         |
|    |     +-- dashboard/route.ts            GET  -> Assigned Batches, Roster, Next Class|
|    |     +-- class-meeting/route.ts        GET  -> Synchronized Google Meet URL       |
|    +-- payments/                                                                      |
|    |     +-- create-order/route.ts         POST -> Generates Razorpay Order (USD/INR) |
|    |     +-- verify-signature/route.ts     POST -> Validates HMAC & Grants Enrollment |
|    |     +-- validate-coupon/route.ts      POST -> Server-Side Discount Calculation   |
|    +-- config/                                                                        |
|          +-- app-bootstrap/route.ts        GET  -> Public Banners, Currencies, Status |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 2.1 Complete Endpoint Inventory & DTO Specifications

#### 1. Authentication Endpoints

##### `POST /api/v1/auth/login`
- **Purpose:** Authenticates student or coach; returns a cryptographically signed mobile access token.
- **Auth Required:** No (Public).
- **Rate Limit:** 5 attempts per 15 minutes per IP.
- **Underlying Business Logic Reused:** Authorize logic from [`lib/auth.ts:24-74`](file:///Users/macbook/Desktop/selffits/lib/auth.ts#L24-L74) (`bcrypt.compare`, active coach resolution, block check).
- **Request DTO:**
  ```json
  {
    "email": "student@selffits.com",
    "password": "SecurePassword123!",
    "deviceInfo": {
      "platform": "ios",
      "deviceName": "iPhone 15 Pro",
      "appVersion": "1.0.0"
    }
  }
  ```
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 2592000,
      "user": {
        "id": "cuid_12345",
        "email": "student@selffits.com",
        "name": "Alex Mercer",
        "role": "STUDENT",
        "isBlocked": false,
        "image": null
      }
    }
  }
  ```
- **Error DTO (401 Unauthorized):**
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Invalid email or password."
    }
  }
  ```
- **Status:** **NEW ENDPOINT** (reuses auth validator & DB queries).

##### `POST /api/v1/auth/refresh`
- **Purpose:** Refreshes an active token before expiration.
- **Auth Required:** Yes (Valid Bearer Token).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 2592000
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `POST /api/v1/auth/forgot-password`
- **Purpose:** Triggers password reset email via Resend.
- **Auth Required:** No (Public).
- **Underlying Business Logic Reused:** [`actions/auth.actions.ts:177-237`](file:///Users/macbook/Desktop/selffits/actions/auth.actions.ts#L177-L237) (`forgotPasswordAction`).
- **Request DTO:** `{"email": "student@selffits.com"}`
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "message": "If an account exists with that email, a password reset link has been sent."
  }
  ```
- **Status:** **NEW ENDPOINT** (reuses `forgotPasswordAction`).

---

#### 2. Student Endpoints

##### `GET /api/v1/student/dashboard`
- **Purpose:** Consolidated mobile home feed containing active enrollment summary, next scheduled class countdown, readiness status, and notification counter.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Ownership Check:** Queries data matching authenticated `user.id`.
- **Underlying Business Logic Reused:** `getCentralClassReadinessForUser()` in [`actions/batch.actions.ts:797`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L797) and `getStudentEnrollmentAction()` in [`actions/payments.actions.ts:415`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L415).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "isEnrolled": true,
      "enrollment": {
        "id": "enr_998877",
        "programTitle": "Global Online Martial Arts & Fitness Academy",
        "tierName": "3 Days / Week",
        "remainingClasses": 14,
        "totalClasses": 24,
        "expiryDate": "Dec 15, 2026",
        "daysRemaining": 60,
        "martialArtsType": "Karate"
      },
      "classReadiness": {
        "hasBatch": true,
        "isReady": true,
        "batchName": "Adults Karate — 1st Batch",
        "levelName": "Yellow Belt",
        "coachName": "Sensei Sujith John",
        "meetingUrl": "https://meet.google.com/abc-defg-hij",
        "nextSession": {
          "nextClassDay": "Tuesday",
          "nextClassDate": "Oct 20, 2026",
          "nextClassFullDate": "Tuesday, Oct 20, 2026",
          "relativeLabel": "Today",
          "isToday": true,
          "clockTiming": "05:15 PM to 06:00 PM (GMT)",
          "timeSlot": "Evening",
          "dayCombination": "Sunday & Wednesday"
        }
      },
      "unreadNotificationCount": 2
    }
  }
  ```
- **Status:** **NEW ENDPOINT** (consolidates readiness + enrollment actions).

##### `GET /api/v1/student/schedule`
- **Purpose:** Full schedule detail and live meeting link.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Underlying Business Logic Reused:** `getStudentBatchInfoAction()` in [`actions/batch.actions.ts:852`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L852).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "hasBatch": true,
      "isReady": true,
      "batchId": "btch_12345",
      "batchCode": "SF-B1-2026",
      "batchName": "Adults Karate — 1st Batch",
      "programTitle": "Martial Arts Academy",
      "levelName": "Yellow Belt",
      "coach": {
        "name": "Sensei Sujith John",
        "rank": "Black Belt 4th Dan",
        "disciplines": "Karate, Kick Boxing"
      },
      "dayCombination": "Sunday & Wednesday",
      "timeSlot": "Evening",
      "clockTiming": "05:15 PM to 06:00 PM (GMT)",
      "meetingUrl": "https://meet.google.com/abc-defg-hij",
      "capacityLabel": "6 / 8",
      "nextSession": {
        "relativeLabel": "Today",
        "nextClassFullDate": "Tuesday, Oct 20, 2026",
        "isToday": true,
        "clockTiming": "05:15 PM to 06:00 PM (GMT)"
      }
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `GET /api/v1/student/programs`
- **Purpose:** Lists all active, completed, and expired programs.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Underlying Business Logic Reused:** `getStudentEnrollmentAction()` in [`actions/payments.actions.ts:415`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L415).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "programs": [
        {
          "id": "enr_123",
          "title": "3 Days / Week Membership Plan",
          "category": "MARTIAL ARTS",
          "status": "ACTIVE",
          "remainingClasses": 12,
          "totalClasses": 16,
          "duration": "16 Classes",
          "daysRemaining": 24,
          "expiryDate": "Nov 10, 2026",
          "martialArtsType": "Karate",
          "includeDietNutrition": false,
          "canDelete": false
        }
      ]
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `POST /api/v1/student/programs/[id]/cancel`
- **Purpose:** Allows students to remove expired/completed course records.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Ownership & Condition Check:** Enforces `userId === session.user.id` and verifies `status === 'EXPIRED' || remainingClasses <= 0` (Active courses cannot be deleted).
- **Underlying Business Logic Reused:** [`actions/payments.actions.ts:731-778`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L731-L778) (`cancelStudentEnrollmentAction`).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "message": "Expired program enrollment removed successfully."
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `GET /api/v1/student/progress`
- **Purpose:** Retrieves student belt history, current rank, and scheduled examinations.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Underlying Business Logic Reused:** [`actions/student-progress.actions.ts:807-914`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L807-L914) (`getStudentDashboardProgressAction`).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "currentBelt": "Yellow Belt",
      "beltAwardedAt": "Sep 15, 2026",
      "activeProgramTitle": "Global Online Martial Arts Academy",
      "examSchedule": {
        "isScheduled": true,
        "targetBelt": "Orange Belt",
        "examDate": "Nov 25, 2026",
        "status": "PENDING"
      },
      "beltHistory": [
        {
          "beltName": "Yellow Belt",
          "awardedAt": "Sep 15, 2026",
          "certificateId": "cert_456"
        },
        {
          "beltName": "White Belt",
          "awardedAt": "Jul 01, 2026",
          "certificateId": null
        }
      ]
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `GET /api/v1/student/certificates`
- **Purpose:** Lists earned certificates with download URLs.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Underlying Business Logic Reused:** [`actions/certificates.actions.ts:124-149`](file:///Users/macbook/Desktop/selffits/actions/certificates.actions.ts#L124-L149) (`getStudentCertificatesAction`).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "certificates": [
        {
          "id": "cert_789",
          "title": "Yellow Belt Graduation Certificate",
          "certificateNumber": "SELFFITS-YELLOW-2026-4412",
          "beltName": "Yellow Belt",
          "issuedDate": "Sep 15, 2026",
          "downloadUrl": "https://selffits.com/api/certificates/download/cert_789"
        }
      ]
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `GET` and `PUT /api/v1/student/profile`
- **Purpose:** Fetches or updates student profile information.
- **Auth Required:** Yes (`role === "STUDENT"`).
- **Underlying Business Logic Reused:** Prisma queries against `User` and `StudentProfile` models; phone validation via `validatePhoneNumberForCountry` in [`lib/countries.ts`](file:///Users/macbook/Desktop/selffits/lib/countries.ts).
- **Request DTO (PUT):**
  ```json
  {
    "name": "Alex Mercer",
    "country": "United States",
    "phone": "+1 415 555 2671",
    "emergencyContact": "+1 415 555 9999 (Parent)"
  }
  ```
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_123",
      "name": "Alex Mercer",
      "email": "student@selffits.com",
      "country": "United States",
      "phone": "+1 415 555 2671",
      "emergencyContact": "+1 415 555 9999 (Parent)",
      "currentBelt": "Yellow Belt"
    }
  }
  ```
- **Status:** **NEW ENDPOINT** (replaces frontend-only mockup).

---

#### 3. Coach Endpoints

##### `GET /api/v1/coach/dashboard`
- **Purpose:** Full coach portal feed: upcoming class session, assigned batches, and student rosters.
- **Auth Required:** Yes (`role === "COACH" || role === "ADMIN"`).
- **Underlying Business Logic Reused:** [`actions/coach.actions.ts:57-222`](file:///Users/macbook/Desktop/selffits/actions/coach.actions.ts#L57-L222) (`getCoachDashboardDataAction`).
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "coach": {
        "fullName": "Sujith John",
        "highestRank": "Black Belt 4th Dan",
        "disciplines": ["Karate", "Kick Boxing"]
      },
      "totalBatchesCount": 2,
      "totalStudentsCount": 14,
      "upcomingClass": {
        "batchId": "SF-B1-2026",
        "name": "Adults Karate — 1st Batch",
        "programTitle": "Martial Arts Academy",
        "beltLevel": "Yellow Belt",
        "isMeetingActive": true,
        "meetingUrl": "https://meet.google.com/abc-defg-hij",
        "clockTiming": "05:15 PM to 06:00 PM (GMT)",
        "nextSession": {
          "relativeLabel": "Today",
          "nextClassFullDate": "Tuesday, Oct 20, 2026",
          "isToday": true
        },
        "studentsCount": 6,
        "maxCapacity": 8,
        "students": [
          {
            "id": "st_1",
            "name": "Alex Mercer",
            "email": "alex@example.com",
            "assignedAt": "Sep 10, 2026",
            "martialArtsType": "Karate"
          }
        ]
      },
      "batches": [...]
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

---

#### 4. Payments & Commerce Endpoints

##### `POST /api/v1/payments/create-order`
- **Purpose:** Creates Razorpay payment order on the server. Never trusts client price calculations.
- **Auth Required:** Yes (Authenticated Student).
- **Underlying Business Logic Reused:** [`actions/payments.actions.ts:119-213`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L119-L213) (`createRazorpayOrderAction`).
- **Request DTO:**
  ```json
  {
    "planId": "plan-3-day",
    "currency": "USD",
    "couponCode": "SELFFITS50"
  }
  ```
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "order_EKzXwp99st1",
      "amount": 2750,
      "currency": "USD",
      "keyId": "rzp_test_selffits_key_id",
      "planName": "3 Days / Week Membership Plan",
      "discountApplied": 27.50
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

##### `POST /api/v1/payments/verify-signature`
- **Purpose:** Cryptographically verifies Razorpay HMAC SHA256 signature and grants enrollment in a DB transaction.
- **Auth Required:** Yes (Authenticated Student).
- **Underlying Business Logic Reused:** [`actions/payments.actions.ts:214-380`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L214-L380) (`verifyPaymentSignatureAction`).
- **Request DTO:**
  ```json
  {
    "razorpayOrderId": "order_EKzXwp99st1",
    "razorpayPaymentId": "pay_EKzY0Aaa111",
    "razorpaySignature": "9ef84a2c0704983..."
  }
  ```
- **Response DTO (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "enrollmentId": "enr_new_789",
      "status": "ACTIVE",
      "message": "Payment verified and enrollment activated!"
    }
  }
  ```
- **Status:** **NEW ENDPOINT**.

---

## 3. Mobile Authentication & Security Blueprint

```
+---------------------------------------------------------------------------------------+
|                            DUAL-AUTHENTICATION SECURITY LAYER                         |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   [ Web Browser Request ]                          [ Flutter Mobile App Request ]     |
|   Cookie: __Secure-authjs.session-token            Header: Authorization: Bearer <jwt>|
|             |                                                    |                    |
|             v                                                    v                    |
|   [ NextAuth Cookie Extractor ]                    [ Mobile Bearer Token Validator ]  |
|             |                                                    |                    |
|             +--------------------------+-------------------------+                    |
|                                        |                                              |
|                                        v                                              |
|                      [ Unified JWT Verification (jose) ]                              |
|                      Secret: process.env.NEXTAUTH_SECRET                              |
|                                        |                                              |
|                                        v                                              |
|                      [ Validated Identity: userId & role ]                            |
|                                        |                                              |
|                 +----------------------+----------------------+                       |
|                 v                                             v                       |
|        role === 'STUDENT'                            role === 'COACH'                 |
|        Permit /api/v1/student/*                      Permit /api/v1/coach/*           |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 3.1 Token Issuance & Cryptographic Validation
- **Engine:** Use the existing `jose` library (already present in [`package-lock.json:63`](file:///Users/macbook/Desktop/selffits/package-lock.json#L63)).
- **Signing Key:** `process.env.NEXTAUTH_SECRET` (shared with NextAuth v5).
- **Claims in Token Payload:**
  ```json
  {
    "sub": "user_cuid_12345",
    "email": "student@selffits.com",
    "role": "STUDENT",
    "isBlocked": false,
    "iat": 1729074000,
    "exp": 1731666000
  }
  ```
- **Reusable Auth Middleware Helper:**
  A lightweight server function [`lib/mobile-auth.ts`](file:///Users/macbook/Desktop/selffits/lib/auth.ts) will be introduced:
  ```typescript
  import { jwtVerify } from "jose";
  import { NextRequest, NextResponse } from "next/server";

  export async function verifyMobileToken(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing or invalid authorization header" };
    }
    const token = authHeader.split(" ")[1];
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload.isBlocked) {
        return { authenticated: false, error: "Account blocked by administrator" };
      }
      return { authenticated: true, user: payload };
    } catch {
      return { authenticated: false, error: "Token expired or invalid" };
    }
  }
  ```

### 3.2 Device Storage Security
- Flutter stores the JWT exclusively using [`flutter_secure_storage`](https://pub.dev/packages/flutter_secure_storage):
  - **iOS:** Backed by the Apple Keychain Services API (with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`).
  - **Android:** Backed by Android Keystore using AES-256 GCM (`EncryptedSharedPreferences`).
- Tokens are **never** stored in plain-text SharedPreferences, `UserDefaults`, or unencrypted SQLite files.

### 3.3 Security & Role Isolation Safeguards
1. **Student / Coach Isolation:** Endpoints under `/api/v1/student/` reject non-student roles. Endpoints under `/api/v1/coach/` strictly require `COACH`, `ADMIN`, or `SUPER_ADMIN`.
2. **Data Ownership Scoping:** Queries always include `where: { userId: sessionUser.id }` or verify batch assignment relationships. A student can never inspect another student's certificate, enrollment, or schedule.
3. **No Secret Leakage:** Database connection strings, Razorpay webhook secrets, Resend API keys, and NextAuth secrets are excluded from mobile bundles and API responses.

---

## 4. Database & Business Logic Preservation

### 4.1 Zero Disruption to Existing Database Schema

The existing 18 Prisma models and PostgreSQL schema remain authoritative. 

| Model | Existing Role | Mobile Access Mode |
| :--- | :--- | :--- |
| `User` | Accounts, passwords, roles | Read & Partial Update (`name`) |
| `StudentProfile` | Age, gender, country, phone, belt | Read & Update (`phone`, `country`, `emergencyContact`) |
| `Batch` | Meeting URLs, schedule, capacity | Read-Only (Managed via Admin) |
| `BatchStudent` | Student-to-batch enrollment junction | Read-Only |
| `Enrollment` | Quota, remaining classes, status | Read & Status Update via Payment |
| `Payment` | Razorpay transactions | Create on Order; Update on Verify |
| `Certificate` | Graduation records & file keys | Read-Only |
| `Notification` | In-app alerts | Read & Mark as Read |
| `CoachApplication` | Coach profiles & disciplines | Read-Only |
| `Coupon` / `CouponUsage` | Discount redemption | Read & Record Usage |

### 4.2 Additive Schema Migration (Only if Push Notifications Approved)

If push notifications are approved for implementation, an additive model will be defined:

```prisma
// ADDITIVE MODEL ONLY — To be added during Phase 5
model MobileDeviceToken {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fcmToken   String   @unique
  platform   String   // "android" | "ios"
  deviceName String?
  isActive   Boolean  @default(true)
  updatedAt  DateTime @updatedAt
  createdAt  DateTime @default(now())

  @@index([userId])
}
```

- **Migration Strategy:** Generated via `prisma migrate dev --create-only` and applied cleanly.
- **Rollback Strategy:** Dropping table `MobileDeviceToken` leaves all existing web models 100% unaffected.
- **Zero Impact on Production Web:** The website does not query or depend on `MobileDeviceToken`.

---

## 5. Payments, Membership Rules & Store Policy Blueprint

### 5.1 The Mobile Payment Flow

```
+---------------------------------------------------------------------------------------+
|                               MOBILE PAYMENT WORKFLOW                                 |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [ Flutter Mobile App ]                                [ Next.js API (/api/v1/) ]     |
|          |                                                         |                  |
|          | 1. POST /api/v1/payments/create-order                   |                  |
|          |    { planId: "plan-3-day", couponCode: "..." }          |                  |
|          |-------------------------------------------------------->|                  |
|          |                                                         |                  |
|          |                                            [ Server computes exact price ] |
|          |                                            [ Validates coupon in DB ]      |
|          |                                            [ Razorpay SDK creates order ]  |
|          |                                                         |                  |
|          | 2. Returns: { orderId, amount, currency, keyId }        |                  |
|          |<--------------------------------------------------------|                  |
|          |                                                         |                  |
|  [ Native Razorpay Sheet / In-App Browser Checkout ]               |                  |
|          |                                                         |                  |
|          | 3. Customer completes UPI / Card payment                |                  |
|          |    Receives: paymentId, signature                       |                  |
|          |                                                         |                  |
|          | 4. POST /api/v1/payments/verify-signature               |                  |
|          |    { orderId, paymentId, signature }                    |                  |
|          |-------------------------------------------------------->|                  |
|          |                                                         |                  |
|          |                                            [ Verify HMAC SHA256 signature] |
|          |                                            [ Transaction: Activate Enr ]   |
|          |                                            [ Send Email via Resend ]       |
|          |                                                         |                  |
|          | 5. Returns: { success: true, enrollmentId }             |                  |
|          |<--------------------------------------------------------|                  |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 5.2 Razorpay Webhook Idempotency
- If the mobile device drops connectivity immediately after paying, the existing Razorpay webhook handler at [`app/api/webhooks/razorpay/route.ts:29-92`](file:///Users/macbook/Desktop/selffits/app/api/webhooks/razorpay/route.ts#L29-L92) serves as an automated safety net.
- When Razorpay sends `payment.captured` or `order.paid`, the server checks whether the payment status is already `SUCCESS`. If not, it activates the enrollment and updates records idempotently.

### 5.3 Apple App Store Compliance (Guideline 3.1.1 vs. 3.1.3(d))
- **The Policy Question:** Apple requires In-App Purchase (IAP) with a 15-30% commission for digital content.
- **The Real-Time Instruction Exemption:** Apple App Store Review Guideline 3.1.3(d) allows external payments for real-time one-to-few virtual personal services (live classes with a real instructor). Because SELFFITS provides scheduled live instruction via Google Meet, it qualifies under real-time interactive training.
- **Implementation Strategy:**
  1. The mobile app presents class schedules and live sessions.
  2. For enrolling in new programs, the app provides either:
     - Direct Razorpay checkout via `razorpay_flutter` (supported on Android Google Play).
     - An authenticated Safari View Controller / web checkout sheet on iOS pointing to `https://selffits.com/checkout?plan=...`, complying with Apple guidelines while avoiding duplicate billing architectures.

---

## 6. Flutter Application Architecture

```
selffits_mobile/
+-- android/
+-- ios/
+-- lib/
    +-- core/
    |   +-- api/
    |   |   +-- api_client.dart            // Dio instance with auth interceptor
    |   |   +-- api_endpoints.dart         // Route constants
    |   |   +-- error_handler.dart         // Custom exceptions & network error parser
    |   +-- constants/
    |   |   +-- app_colors.dart            // #0A0B0E, #14161D, #E50914, #0080FF
    |   |   +-- app_typography.dart        // Outfit & Inter Google Fonts
    |   +-- storage/
    |   |   +-- secure_storage.dart        // Hardware Keychain / Keystore interface
    |   +-- utils/
    |       +-- schedule_formatter.dart    // Port of lib/class-schedule.ts
    +-- features/
    |   +-- auth/
    |   |   +-- data/auth_repository.dart
    |   |   +-- logic/auth_provider.dart
    |   |   +-- presentation/login_screen.dart
    |   |   +-- presentation/forgot_password_screen.dart
    |   +-- student_dashboard/
    |   |   +-- data/student_repository.dart
    |   |   +-- logic/student_dashboard_provider.dart
    |   |   +-- presentation/student_dashboard_screen.dart
    |   |   +-- presentation/widgets/upcoming_class_card.dart
    |   +-- live_classes/
    |   |   +-- presentation/live_class_hub_screen.dart
    |   |   +-- logic/meet_launcher.dart
    |   +-- progress/
    |   |   +-- presentation/progress_screen.dart
    |   |   +-- presentation/certificates_screen.dart
    |   +-- coach/
    |   |   +-- presentation/coach_dashboard_screen.dart
    |   |   +-- presentation/widgets/coach_batch_card.dart
    +-- app.dart                           // Root MaterialApp with dark theme
    +-- main.dart                          // App entry point
```

### 6.1 State Management & Dependency Injection
- **State Management:** **Riverpod (`flutter_riverpod: ^2.5.1`)**. Riverpod provides compile-safe, testable state management without the boilerplate of Bloc or the flakiness of raw ChangeNotifier.
- **HTTP Client:** **Dio (`dio: ^5.4.3`)**. Configured with:
  - Auth Interceptor: Automatically attaches `Authorization: Bearer <token>` to requests.
  - Refresh Interceptor: Handles 401 Unauthorized responses and attempts token renewal.
  - Retry Interceptor: Exponential backoff for intermittent network disconnections.

### 6.2 Flutter Package Compatibility Matrix

| Package | Recommended Version | Purpose | Maintenance & Health |
| :--- | :--- | :--- | :--- |
| `flutter_riverpod` | `^2.5.1` | Reactive state management | Flutter Favorite, 100% score |
| `dio` | `^5.4.3` | Networking & interceptors | Flutter Favorite, 100% score |
| `flutter_secure_storage` | `^9.2.2` | Encrypted token persistence | Standard industry secure storage |
| `url_launcher` | `^6.3.0` | External Google Meet launching | Official Flutter team package |
| `google_fonts` | `^6.2.1` | Outfit and Inter brand typography | Official Flutter team package |
| `lucide_icons` | `^0.359.0` | Consistent UI icon set with web | Exact match to web's `lucide-react` |
| `flutter_local_notifications` | `^17.1.2` | Local alarms for upcoming classes | Official standard for local alerts |
| `firebase_messaging` | `^14.9.2` | Remote push notifications (Phase 5) | Official Firebase Flutter plugin |

---

## 7. Google Meet & Virtual Class Handoff

```
+---------------------------------------------------------------------------------------+
|                             GOOGLE MEET LAUNCH WORKFLOW                               |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [ Student / Coach Taps "Join Live Class" ]                                           |
|          |                                                                            |
|          v                                                                            |
|  [ Validate URL ]                                                                     |
|  - Check: url.startsWith("https://meet.google.com/") || url.startsWith("https://...")|
|  - Ensure: meetingUrl is active & non-empty                                           |
|          |                                                                            |
|          v                                                                            |
|  [ Invoke url_launcher (LaunchMode.externalApplication) ]                             |
|          |                                                                            |
|          +------------------------------------+---------------------------------------+
|          |                                    |                                       |
|          v                                    v                                       |
|  [ Android Intent Dispatch ]          [ iOS Universal Link Dispatch ]                 |
|  - Queries installed packages         - Queries registered URL schemes                |
|  - If Google Meet app installed:      - If Google Meet app installed:                 |
|    Opens native Meet app directly       Opens native Meet app directly                |
|  - If Meet app missing:               - If Meet app missing:                          |
|    Opens in default mobile browser      Opens in Safari with audio/video support      |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 7.1 Implementation Code Pattern (`meet_launcher.dart`)
```dart
import 'package:url_launcher/url_launcher.dart';

class MeetLauncher {
  static Future<bool> launchMeeting(String meetingUrl) async {
    final uri = Uri.tryParse(meetingUrl.trim());
    if (uri == null || (!uri.isScheme('http') && !uri.isScheme('https'))) {
      return false;
    }

    // Always launch in external application — NEVER in embedded WebView
    if (await canLaunchUrl(uri)) {
      return await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
    }
    return false;
  }
}
```

### 7.2 TV Screen Mirroring Strategy
- **Reality:** Two-way interactive WebRTC Google Meet sessions cannot be streamed via the Google Cast SDK receiver protocol.
- **Solution:** Provide an in-app "Connect to TV" help sheet explaining how students can use native OS screen mirroring:
  - **iOS AirPlay:** Swipe down to Control Center -> Screen Mirroring -> Select Apple TV / Smart TV.
  - **Android Smart View / Cast Screen:** Swipe down Quick Settings -> Tap "Cast" or "Smart View" -> Select TV.
  - **Benefit:** The student mirrors their instructor's live video to a 55" TV screen, while the phone sits on a stand facing the student so the coach can clearly observe and correct the student's martial arts form in real-time.

---

## 8. Push Notification Infrastructure

*Scope Status: Phase 5 Integration (Optional add-on; core app operates fully with in-app notifications if deferred).*

### 8.1 Architecture & Event Triggers

```
+---------------------------------------------------------------------------------------+
|                            PUSH NOTIFICATION ARCHITECTURE                             |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [ Backend Trigger Events ]                                                           |
|  1. Class Starting in 15 Mins (Cron / Scheduler)                                      |
|  2. New Belt Certificate Issued (actions/certificates.actions.ts)                     |
|  3. Student Assigned to Batch (actions/admin.actions.ts)                              |
|          |                                                                            |
|          v                                                                            |
|  [ Next.js Notification Service (firebase-admin) ]                                    |
|          |                                                                            |
|          +------------------------------------+---------------------------------------+
|          |                                    |                                       |
|          v                                    v                                       |
|  [ Firebase Cloud Messaging (FCM) ]   [ Apple Push Notification service (APNs) ]      |
|          |                                    |                                       |
|          v                                    v                                       |
|  [ Android Mobile Device ]             [ iOS Mobile Device ]                          |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 8.2 Device Token Registry
- Additive endpoint: `POST /api/v1/notifications/register-device`
  - Request: `{"fcmToken": "cE4r...", "platform": "android"}`
  - Upserts into `MobileDeviceToken` table linked to authenticated `userId`.

---

## 9. Phased Implementation & Approval Gates

```
+--------------------------------------------------------------------------------------------------------+
|                                  PHASED ROADMAP & APPROVAL GATES                                       |
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|  [ Phase A: Blueprint & Contracts ]              [ Phase B: REST API Core ]                            |
|    - Blueprint complete (Current)                  - Auth & Student endpoints                          |
|    - Sign-off on architecture                      - Automated security test suite                     |
|                   |                                                |                                   |
|                   +---------------------- GATE 1 ------------------+                                   |
|                                          |                                                             |
|                                          v                                                             |
|  [ Phase C: Flutter Project Setup ]              [ Phase D: Student Features ]                         |
|    - Dio client, Riverpod, tokens                  - Schedule, Meet launcher, Progress                 |
|    - Login & Auth state flow                       - Certificates & profile view                       |
|                   |                                                |                                   |
|                   +---------------------- GATE 2 ------------------+                                   |
|                                          |                                                             |
|                                          v                                                             |
|  [ Phase E: Coach Hub & Payments ]               [ Phase F: Device QA & Store Prep ]                   |
|    - Coach portal features                         - Physical Android & iOS tests                      |
|    - Razorpay payment sheets                       - Fastlane build pipelines                          |
|                   |                                                |                                   |
|                   +---------------------- GATE 3 ------------------+                                   |
|                                          |                                                             |
|                                          v                                                             |
|                                [ Production Store Launch ]                                             |
|                                                                                                        |
+--------------------------------------------------------------------------------------------------------+
```

### Phase A: Architecture Approval (CURRENT PHASE)
- **Deliverable:** This implementation blueprint.
- **Gate 1 Approval:** User reviews and authorizes proceeding to Phase B.

### Phase B: Minimal Mobile REST API Foundation
- **Scope:** Implement `/api/v1/auth/*` and core `/api/v1/student/dashboard`, `/schedule`.
- **Files Affected:** New files only under `/app/api/v1/`. Zero edits to existing web code.
- **Verification:** Run automated API contract test scripts in `scratch/test_api_v1.ts`.

### Phase C: Flutter Foundation & Authentication
- **Scope:** Initialize Flutter project, Riverpod providers, Dio interceptors, secure storage, login screen, and splash screen.
- **Verification:** Flutter analyzer passes with zero errors; token stored and cleared on logout.

### Phase D: Student Features & Google Meet
- **Scope:** Student Dashboard view, Upcoming Class countdown, one-tap Google Meet handoff, progress view, and certificate download.
- **Verification:** Tested on Android Emulator and iOS Simulator.

### Phase E: Coach Functionality & Payments
- **Scope:** Coach assigned batches, student rosters, and Razorpay payment flow.
- **Verification:** Tested against Razorpay test mode keys.

### Phase F: Build Verification & Hardening
- **Scope:** Release builds (Android APK/AAB and iOS IPA), app icon assets, splash screens, permission descriptions, and physical device testing.
- **Gate 3 Approval:** Final client review on real devices before store submission.

---

## 10. Testing and Quality Gates

A successful compile does **not** equal a working application. The testing strategy enforces multi-tier quality gates:

```
+---------------------------------------------------------------------------------------+
|                                MULTI-TIER QUALITY GATES                               |
+---------------------+-------------------------------+---------------------------------+
| TIER                | WHAT IS TESTED                | HOW IT IS VERIFIED              |
+---------------------+-------------------------------+---------------------------------+
| 1. API Contracts    | Endpoints return valid DTOs   | Node.js test script in scratch/ |
|                     | Status codes: 200, 401, 403   | Automated in CI / terminal      |
+---------------------+-------------------------------+---------------------------------+
| 2. Security & Auth  | Invalid token rejected        | Automated JWT signature tests   |
|                     | Role isolation enforced       | Student cannot access coach API |
+---------------------+-------------------------------+---------------------------------+
| 3. Web Regression   | Web app & admin unaffected    | Next.js build & curl check on   |
|                     | No broken imports or schema   | existing web pages              |
+---------------------+-------------------------------+---------------------------------+
| 4. Flutter Widgets  | UI rendering, forms, errors   | `flutter test` widget suites    |
|                     | Dark theme styling            | Golden tests for key cards      |
+---------------------+-------------------------------+---------------------------------+
| 5. Physical Devices | Google Meet app handoff       | Physical iPhone & Android phone |
|                     | Screen mirroring to smart TV  | Real Wi-Fi network test         |
+---------------------+-------------------------------+---------------------------------+
```

### Quality Gate Criteria
- **Gate B Pass:** 100% of `/api/v1/` routes return expected JSON schemas; web build (`npm run build`) succeeds cleanly without regression.
- **Gate D Pass:** Student can log in, view live schedule, tap "Join Live Class", and launch external browser/Meet app without crashing.
- **Gate F Pass:** Release APK signed; release IPA builds in Xcode without missing privacy manifests.

---

## 11. Cost, Complexity & Delivery Risks

### 11.1 Infrastructure & Account Costs

| Item | Cost | Requirement |
| :--- | :--- | :--- |
| **Apple Developer Program** | $99 / year | Mandatory for iOS App Store distribution and TestFlight |
| **Google Play Console** | $25 one-time | Mandatory for Android Play Store distribution |
| **Firebase Cloud Messaging** | $0 (Free Tier) | Completely covers SELFFITS notification volume |
| **Backend Server Hosting** | $0 additional | Vercel existing deployment handles `/api/v1/` traffic |
| **Database Costs** | $0 additional | PostgreSQL connection pool scales with current load |

### 11.2 What Antigravity Can Automate vs. What Requires Human Approval

| Task | Automation Level | Owner / Tool |
| :--- | :---: | :--- |
| **REST API Route Development** | **100% Automated** | Antigravity AI |
| **Flutter UI & State Logic** | **100% Automated** | Antigravity AI |
| **Local Unit & Widget Tests** | **100% Automated** | Antigravity AI (`flutter test`) |
| **API Contract Validation** | **100% Automated** | Antigravity AI (scratch scripts) |
| **Developer Account Registration** | **Manual Action** | Project Owner |
| **Apple Certificates & Provisioning** | **Semi-Automated** | Owner credentials + Fastlane |
| **Google Play Console Verification** | **Manual Action** | Project Owner |
| **Testing on Physical Smart TV** | **Manual QA** | Project Owner / QA Tester |

---

## 12. Final Architecture Decision & Sign-off

### 1. Recommended Architecture
**Flutter (iOS & Android) consuming an isolated `/app/api/v1/` REST API layer within the existing Next.js 16 backend.**

### 2. Why This Fits SELFFITS
- Preserves the existing Next.js web application, Vercel hosting, PostgreSQL database, and Admin panel with **zero downtime or rewriting**.
- Provides a fast, native 60/120 FPS mobile interface matching SELFFITS' dark-mode aesthetic.
- Completely avoids the critical App Store rejection risks and WebView bugs inherent in Capacitor.
- Avoids the tooling and React 19 dependency friction of React Native.
- Perfectly suited for Antigravity AI's autonomous coding, structured typing, and automated testing capabilities.

### 3. Immediate Next Step (Milestone 1)
Upon receiving your explicit approval, we will proceed to **Phase B: Implementation of the `/app/api/v1/` REST API Layer**, creating the authentication and student dashboard endpoints, accompanied by automated contract tests.

---

## 13. Safety & Compliance Confirmation

In accordance with your critical instructions:
- **Exact Document Path:** `/Users/macbook/Desktop/selffits/SELFFITS_MOBILE_APP_IMPLEMENTATION_BLUEPRINT.md`
- **Files Modified:** **0** application files modified.
- **Packages Installed:** **0** packages installed or upgraded.
- **Database Status:** **0** migrations created; **0** queries executed; database untouched.
- **API Calls:** **0** external or paid API calls triggered.
- **Git State:** **0** commits created; git working tree contains only the blueprint documentation.
- **Deployments:** **0** deployments initiated.

**Phase 2 Planning is complete. Antigravity AI is standing by and will not execute any code changes until explicit approval is granted.**
