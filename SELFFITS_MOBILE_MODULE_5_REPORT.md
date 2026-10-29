# SELFFITS MOBILE — MODULE 5 REPORT
## Coach Features & Dashboard

**Status:** Completed & Validated  
**Module:** 5 of Phase 2  
**Target Architecture:** Flutter (iOS & Android) with Next.js REST API Foundation  
**Date:** October 16, 2026  

---

### Executive Summary

Module 5 has successfully audited, implemented, and validated the complete **Coach Features & Dashboard** experience for the SELFFITS Flutter mobile application under `/Users/macbook/Desktop/selffits/mobile`.

All coach functionalities strictly consume verified backend endpoints and authorized data models without inventing endpoints, permissions, or mock database schema changes. The user interface strictly adheres to the approved **Luxury White Design System** with pure white (#FFFFFF) canvases, original red (`#E11D48`) and blue (`#0080FF`) brand accents, Outfit and Inter typography, robust error handling, hardware-backed token security, and multi-device viewport responsiveness.

---

### 1. Pre-Implementation Backend Audit

Before writing mobile UI code, the existing Next.js backend and mobile REST API routes were audited to verify the actual features, authorization rules, data models, and supported coach operations.

#### A. Verified Coach Dashboard API Endpoint
- **Route:** `GET /api/v1/coach/dashboard` ([route.ts](file:///Users/macbook/Desktop/selffits/app/api/v1/coach/dashboard/route.ts))
- **Authentication:** Mandatory Bearer token (`Authorization: Bearer <token>`) signed by mobile secret.
- **Authorization:** Enforced via `enforceMobileRole(authResult.user, [Role.COACH, Role.ADMIN, Role.SUPER_ADMIN])`.
  - Non-coaches (e.g. `STUDENT`) are rejected with `HTTP 403 Forbidden` (`FORBIDDEN_ROLE`).
  - Missing, expired, or invalid tokens return `HTTP 401 Unauthorized` (`TOKEN_EXPIRED` / `UNAUTHORIZED`).
- **Data Source:** Verified against Prisma database models (`CoachApplication`, `TrainingBatch`, `BatchStudent`, `User`, `Enrollment`).
- **Authorization Boundary:** A coach can **only** access batches explicitly assigned to their coach profile (`where: { coachId: coach.id }`). Student rosters returned in the batch payload are strictly limited to students actively assigned to the coach's own training batches (`b.students`). No unassigned or cross-coach student data is exposed.

#### B. Verified Response DTO & Available Fields
- **Coach Profile:** `id`, `fullName`, `email`, `highestRank`, `disciplines`, `profilePhotoUrl`.
- **Metrics Overview:**
  - `totalBatchesCount`: Exact count of active/assigned training batches for this coach.
  - `totalStudentsCount`: Unique student count enrolled across all batches assigned to this coach.
- **Hero Upcoming Class (`upcomingClass`):**
  - Priority sort favoring live sessions occurring today.
  - `id`, `batchId`, `name`, `programTitle`, `beltLevel`, `dayCombination`, `timeSlot`, `clockTiming`, `meetingUrl`, `isMeetingActive`, `status`, `maxCapacity`, `studentsCount`.
  - `nextSession`: `nextClassDay`, `nextClassDate`, `nextClassFullDate`, `relativeLabel`, `isToday`, `clockTiming`, `timeSlot`, `dayCombination`.
  - `students`: Authorized student roster for this upcoming batch (`id`, `name`, `email`, `martialArtsType`, `assignedAt`, `image`).
- **Assigned Batches List (`batches`):**
  - Array of all batches assigned to the coach, each with complete batch metadata, capacity metrics, and its own student roster.

#### C. Unsupported Operations (Deliberately Not Invented)
- The backend does **not** support coaches creating batches, deleting batches, reassigning students, editing Google Meet links, or processing payments via the mobile API.
- In strict adherence to Section 1 & 3 of the prompt, no unsupported write operations, schedule manipulation permissions, or mock mutations were created.

---

### 2. Implementation Scope

#### A. Role-Aware Authentication Architecture
- **Preserved Student Role Restrictions:** The existing student authentication flow (`AuthRepository.login`) was strictly preserved with its default `allowedRoles = const ['STUDENT']` constraint. A student cannot log into coach views.
- **Added Coach Authentication:** Implemented `AuthRepository.loginCoach(...)` and `AuthNotifier.loginCoach(...)` allowing authenticated access for verified coaches and administrators (`COACH`, `ADMIN`, `SUPER_ADMIN`).
- **Hardware-Backed Session Restoration:** Updated `AuthRepository.restoreSession()` to validate whether the stored token belongs to an authorized `STUDENT`, `COACH`, or `ADMIN`.
- **Role-Aware Route Gatekeeper (`AuthGatekeeper` in [app.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/app.dart)):**
  - Unauthenticated -> `StudentLoginScreen`
  - Authenticated as `STUDENT` -> `StudentHomeScreen`
  - Authenticated as `COACH` or `ADMIN` -> `CoachHomeScreen`
- **Dynamic Portal Switcher in Login Screen ([student_login_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/presentation/student_login_screen.dart)):**
  - Interactive portal toggle between "Student Portal" and "Coach Portal".
  - Quick-fill demo account pills for both Student (`student@selffits.com` / `Student@123`) and Coach (`coach@selffits.com` / `Coach@123`).
  - Preserved all original text and widget expectations for existing tests.

#### B. Coach Domain Models & Data Structures
**File:** [coach_dashboard_data.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/models/coach_dashboard_data.dart)
- `CoachDashboardData`: Top-level response container parsing `coach`, `totalBatchesCount`, `totalStudentsCount`, `upcomingClass`, and `batches`.
- `CoachProfileData`: Encapsulates verified instructor information, rank, discipline badges, and safe name formatting.
- `CoachBatchSummary`: Encapsulates batch code, program name, schedule combination, timing, capacity calculation (`isFull`), status indicators (`isActive`), and Google Meet link validation.
- `CoachStudentSummary`: Encapsulates authorized student information (`name`, `email`, `martialArtsType`, `assignedAt`).

#### C. Coach Repository & State Management
- **Repository:** [coach_repository.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/repositories/coach_repository.dart)
  - Interacts with `GET /api/v1/coach/dashboard`.
  - Injects hardware-backed cryptographic Bearer tokens.
  - Automatically handles 401 token expiry by clearing secure storage and throwing `TokenExpiredException`.
- **Provider & StateNotifier:** [coach_dashboard_provider.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/providers/coach_dashboard_provider.dart)
  - `CoachDashboardState`: Tracks `isLoading`, `data`, `errorMessage`, and `isUnauthorized`.
  - `CoachDashboardNotifier`: Manages `loadDashboard()` on screen initialization and `refresh()` during pull-to-refresh interactions.
  - Automatically triggers `authProvider.notifier.logout()` if session has expired (HTTP 401) or role is forbidden (HTTP 403).

#### D. Coach Dashboard UI Screen
**File:** [coach_home_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart)
- **Sensei Greeting & Profile:** Displays coach's verified name, highest martial arts rank, discipline tags (e.g. Karate, Kickboxing), and active "Sensei Verified" live badge.
- **Hardware-Backed Session Banner:** Informs the instructor of their hardware-isolated cryptographic session token.
- **Metrics Overview Cards:** Side-by-side cards displaying `Assigned Batches` count and `Active Students` enrolled in the dojo.
- **Hero Upcoming Session Card:**
  - Displays batch code, program name, relative session label (e.g., "Today Session"), date, official GMT schedule, and converted local device time.
  - Roster summary banner showing enrolled vs capacity.
  - Primary CTA button to launch Google Meet externally via `url_launcher`.
- **Assigned Batches List & Expandable Student Rosters:**
  - Cards for each assigned batch displaying day combination, timing, local time conversion, and status badges.
  - Interactive "View Students" / "Hide Students" expansion toggle to reveal authorized student names, email, and martial arts discipline without cluttering the main view.
  - Direct "Join Batch Dojo Room" action when a Google Meet link is configured.
- **Sensei Dojo Protocol Guidelines:** Professional best practices card reminding coaches to open rooms 5 minutes early, check camera framing, and verify roster attendance.
- **Empty State:** Clean luxury card ("No Active Training Batches") displayed when administration has not yet scheduled batches.
- **Error & Loading States:** Loading skeleton with spinner during boot; connection retry card with retry button on network failures; automatic session purge on unauthorized access.
- **Luxury White Design System Enforcement:**
  - Strict pure white background (`#FFFFFF`) on Scaffolds and cards.
  - Original red (`#E11D48`) and blue (`#0080FF`) brand accents.
  - Zero dark mode or black background surfaces.

---

### 3. Security and Business Rules Compliance

1. **Backend Authorization Enforcement:** Every coach operation calls `GET /api/v1/coach/dashboard` requiring a signed Bearer token with a verified role of `COACH`, `ADMIN`, or `SUPER_ADMIN`.
2. **Student Privacy Protection:** Coaches only have access to students enrolled in their own assigned batches. No student contact details beyond name, email, and enrolled discipline are transmitted.
3. **Zero Fabricated Permissions:** No synthetic APIs or permissions were added. Coaches can view their schedule, rosters, and launch meetings; administrative mutations remain reserved for the backend admin panel.
4. **Student Authentication Role Isolation:** Non-student accounts continue to be rejected by the student login flow (`ForbiddenRoleException`), fully preserving the security tests from Module 2.

---

### 4. Strict Protection Verification

- **Website & Admin Panel:** 0 files modified.
- **Database & Prisma Schema:** 0 files modified; no migrations run.
- **NextAuth Web Authentication:** 0 files modified; completely isolated from mobile Bearer token system.
- **Razorpay Integration:** 0 files modified; payment processing was not implemented.
- **Push Notifications:** Not implemented in this module as strictly instructed.
- **Git State:** No commits made, no branches pushed, no deployments initiated.

---

### 5. Verification & Automated Test Results

#### A. Dart Formatting & Static Analysis
```bash
$ dart format .
Formatted 38 files (0 changed) in 0.15 seconds.

$ flutter analyze
Analyzing mobile...
No issues found! (ran in 1.4s)
```

#### B. Flutter Test Suite (70/70 Passing)
```bash
$ flutter test
00:04 +70: All tests passed!
```
The mobile test suite has expanded from 48 tests (Module 4) to **70 tests (Module 5)** across 6 test suites:
1. `design_system_test.dart` (6 tests) — Token enforcement, pure white canvas (#FFFFFF), typography scales.
2. `widget_test.dart` (1 test) — Root application smoke test.
3. `auth_module_test.dart` (15 tests) — Student authentication, token encryption, role rejection, input validation.
4. `student_dashboard_test.dart` (18 tests) — Student dashboard, live class readiness calculator, Google Meet launch.
5. `device_validation_test.dart` (8 tests) — Student attendance progress bar, dual timezones, multi-viewport layout tests.
6. `coach_dashboard_test.dart` (22 tests — NEW):
   - **DTO Parsing:** Validates `CoachDashboardData.fromJson`, `CoachBatchSummary`, `CoachStudentSummary`, empty batch handling, and null safety.
   - **Repository:** 200 OK dashboard retrieval, Bearer token injection, 401 token expiry handling, 403 role mismatch handling, and missing-token protection.
   - **StateNotifier:** Initial loading transition, loaded data emission, and network failure recovery.
   - **CoachHomeScreen Widget Tests:** Profile header, metrics cards, hero class card with Google Meet CTA, expandable student roster toggling, empty state card, and network error retry recovery.
   - **Role Separation & Protected Navigation:** Student session routing to `StudentHomeScreen`, Coach session routing to `CoachHomeScreen`, and Unauthenticated session routing to `StudentLoginScreen`.
   - **Multi-Device Viewport Validation:** Compact Phone (360x640), Modern Standard Phone (390x844), Large Flagship Phone (412x915), Tablet (800x1280), and Accessibility Text Scaler (1.3x) — all validated with zero `RenderFlex` layout overflows.

#### C. Backend Mobile API Security Test Suite (16/16 Passing)
```bash
$ npx tsx tests/mobile-api-security.ts
=================================================================
 SELFFITS Mobile REST API — Phase B Automated Security Test Suite
=================================================================

  ✓ PASS: Rejects request with missing Authorization header (401)
  ✓ PASS: Rejects malformed Authorization header (401)
  ✓ PASS: Rejects token signed with unauthorized foreign key (401)
  ✓ PASS: Rejects expired mobile token (401)
  ✓ PASS: Rejects token with mismatched issuer claim (401)
  ✓ PASS: Rejects token with mismatched audience claim (401)
  ✓ PASS: Rejects NextAuth web session token passed as mobile bearer token (401)
  ✓ PASS: Rejects token belonging to blocked account (403)
  ✓ PASS: Role Isolation: Blocks STUDENT from accessing Coach Dashboard (403)
  ✓ PASS: Role Isolation: Blocks COACH from accessing Student Dashboard (403)
  ✓ PASS: Rejects non-JSON login request body with 400 Bad Request
  ✓ PASS: Rejects invalid schema payloads with Zod field errors (400)
  ✓ PASS: Rejects unauthenticated credentials with safe generic error (401)
  ✓ PASS: Error responses never disclose server secrets, database strings, or stack traces
  ✓ PASS: End-to-End Student flow: Login -> Auth Me -> Student Dashboard (200 OK)
  ✓ PASS: End-to-End Coach flow: Login -> Auth Me -> Coach Dashboard (200 OK)

=================================================================
 Test Execution Summary: 16/16 Passed, 0 Failed
=================================================================
```

#### D. Website TypeScript Compilation Check
```bash
$ npx tsc --noEmit
# Exit code: 0 (Zero errors)
```

#### E. Physical Device / Emulator Testing Disclosure
- **Inspection Result:** `adb devices` reported no connected Android physical devices/emulators; `xcrun simctl list devices` reported no booted iOS simulators.
- **Reporting Statement:** In accordance with Section 5 of the prompt, physical device and emulator execution were not possible in this local environment due to no running emulator or connected physical hardware. All layout, accessibility, role-isolation, and interaction tests were executed as deterministic headless Flutter widget tests across simulated physical viewports (360x640, 390x844, 412x915, 800x1280, and 1.3x text scaling).

---

### 6. Files Changed in Module 5

All modifications were strictly confined to `/Users/macbook/Desktop/selffits/mobile`:

| File | Type | Description |
|---|---|---|
| [coach_dashboard_data.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/models/coach_dashboard_data.dart) | New | Complete coach domain models, batch summaries, and student rosters. |
| [coach_repository.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/repositories/coach_repository.dart) | New | Secure API repository for `GET /api/v1/coach/dashboard`. |
| [coach_dashboard_provider.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/providers/coach_dashboard_provider.dart) | New | Riverpod state notifier managing loading, loaded, error, and refresh states. |
| [coach_home_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart) | New | Full Luxury White coach dashboard UI, hero class card, expandable rosters, and retry banner. |
| [coach_dashboard_test.dart](file:///Users/macbook/Desktop/selffits/mobile/test/coach_dashboard_test.dart) | New | 22 comprehensive automated unit, repository, widget, role-routing, and viewport tests. |
| [auth_state.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/models/auth_state.dart) | Modified | Added `isCoach` and `isAdmin` helper getters. |
| [auth_repository.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/repositories/auth_repository.dart) | Modified | Added `loginCoach(...)` and updated `restoreSession()` to support coaches while keeping student login restricted. |
| [auth_provider.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/providers/auth_provider.dart) | Modified | Added `loginCoach(...)` method to `AuthNotifier`. |
| [student_login_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/presentation/student_login_screen.dart) | Modified | Added coach demo quick-fill pill and dynamic portal mode switcher. |
| [app.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/app.dart) | Modified | Wired `CoachHomeScreen` into `AuthGatekeeper` for coach/admin sessions. |

---

### 7. Outstanding Limitations & Module 6 Outlook

1. **Coach Class Attendance Tracking:** The existing backend does not expose a write endpoint for coaches to mark individual student attendance per session.
2. **Push Notifications:** As required, APNs and FCM push notifications were excluded from this module.
3. **Physical Device Installation:** Physical device validation requires a connected device or active simulator session.

---

### 8. Completion Gate Notice

Module 5 is complete, fully tested, and verified. In accordance with Section 6, development is stopped. Awaiting your explicit approval before proceeding to Module 6.
