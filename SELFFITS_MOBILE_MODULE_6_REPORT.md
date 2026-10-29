# SELFFITS MOBILE — MODULE 6 REPORT
## Production-Ready Push Notification Architecture and Delivery

**Date:** October 16, 2026  
**Status:** MODULE 6 COMPLETE — AWAITING EXPLICIT APPROVAL BEFORE RELEASE-READINESS MODULE  
**Scope:** Backend FCM/APNs Push Architecture, Persistent Token Store, Server-Side 15-Minute Class Scheduler, Flutter Notification Service, Deep Link Engine, In-App Notifications Feed & Badging.

---

## 1. Executive Summary

Module 6 establishes an enterprise-grade push notification architecture for the SELFFITS platform across both the Next.js server infrastructure and the Flutter mobile application (`mobile/`).

### Key Accomplishments
1. **Zero Database Schema Mutations:** Device tokens are durably persisted in PostgreSQL using the system's existing `WebsiteSettings` store under key `mobile_push_device_tokens`. This eliminates database migration risk and preserves schema integrity.
2. **Server-Side Class Reminder Scheduler:** An independent server-side scheduler (`/api/v1/cron/class-reminders`) queries live batch schedules every 5 minutes and dispatches class reminders 15 minutes before session start time. It does **not** rely on the mobile app being open or executing in the background.
3. **Multi-Channel Dispatch & Deduplication:** Push notifications support five discrete channels: `class_reminder`, `schedule_change`, `class_cancelled`, `announcement`, and `enrollment_update`. Class reminders include a 60-minute session deduplication engine preventing spam.
4. **Invalid Token Auto-Pruning & Account Switch Isolation:** Device tokens are automatically unlinked on logout. When an FCM/APNs token is reported as invalid/unregistered by the provider, the store automatically purges it. If a device changes authenticated accounts, token ownership is re-assigned to prevent cross-account notification leakage.
5. **Safe Deep Linking:** Full parsing and routing for `selffits://class/live?batchId=...&meetingUrl=...`, `selffits://dashboard/student`, `selffits://dashboard/coach`, and `selffits://notifications`.
6. **Luxury White UI & Badge Counter:** Reusable notification badge button in the AppBar with live unread counter, in-app notification list with type-specific branding, and permission-denied recovery banner.

---

## 2. Phase 1: Audit Before Implementation

| Component | Existing State Before Module 6 | Missing / Requirement Gap | Module 6 Resolution |
| :--- | :--- | :--- | :--- |
| **Notification DB Models** | `Notification` Prisma table (`id`, `userId`, `title`, `message`, `isRead`, `createdAt`). | No device token model, no platform flag, no APNs/FCM token mapping. | Added persistent `DeviceTokenStore` in PostgreSQL with token-to-user mapping and platform tracking. |
| **Backend Event Triggers** | `student-progress.actions.ts` & `certificates.actions.ts` only inserted into in-app table. | No remote push dispatch to FCM or APNs; no triggers on batch schedule changes or cancellations. | Implemented `PushNotificationService` with multi-channel dispatch, in-app persistence, and external push adapters. |
| **15-Min Class Reminder** | None in repository. | No background cron or worker was running to calculate countdowns and trigger reminders. | Built `/api/v1/cron/class-reminders` endpoint secured by `CRON_SECRET` for Vercel Cron or AWS EventBridge. |
| **Mobile API Auth** | Mobile JWT Bearer authentication (`lib/mobile-auth.ts`). | Missing endpoints for device token registration and unregistration. | Created `/api/v1/notifications/device-token` (`POST` and `DELETE`) with strict Zod validation. |
| **Flutter App Architecture** | Auth, Student Dashboard, Coach Dashboard. | No notification models, no device token sync, no deep link router, no badge counter, no feed UI. | Built complete `features/notifications` module with Riverpod state notifier and Luxury White UI. |
| **Cloud Secrets & Credentials** | None configured for Firebase. | No Firebase Admin SDK, no service-account JSON, no APNs `.p8` key, no `google-services.json`. | Architecture created with fallback provider; explicit prerequisites documented below. |

---

## 3. Phase 2: Architecture & Implementation

### 3.1 Device Token Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Coach
    participant Flutter as Flutter Mobile App
    participant API as Next.js API (/api/v1)
    participant Store as DeviceTokenStore (PostgreSQL)
    participant FCM as Firebase / APNs Gateway

    User->>Flutter: Logs in with credentials
    Flutter->>API: POST /api/v1/auth/login
    API-->>Flutter: 200 OK (JWT Access Token)
    Note over Flutter: AuthNotifier invokes onLogin hook
    Flutter->>API: POST /api/v1/notifications/device-token
    API->>Store: Re-assign or insert (token, platform, deviceId, userId)
    Store-->>API: Persisted
    API-->>Flutter: 200 OK (registered: true)

    Note over User,Flutter: App running / background / closed
    API->>FCM: Dispatch Class Reminder with meeting link & deep link
    FCM->>Flutter: High-priority Push Notification Delivered

    User->>Flutter: Taps notification banner
    Flutter->>Flutter: DeepLinkNavigator parses selffits://class/live
    Flutter->>User: Directly launches Google Meet or opens Class screen

    User->>Flutter: Taps Logout
    Flutter->>API: DELETE /api/v1/notifications/device-token
    API->>Store: Unlink device token for authenticated user
    Store-->>API: Purged
    API-->>Flutter: 200 OK (unregistered: true)
    Flutter->>Flutter: SecureStorage.clearSession()
```

### 3.2 15-Minute Class Reminder Server-Side Scheduler
- **Endpoint:** `GET /api/v1/cron/class-reminders`
- **Security:** Secured by `Authorization: Bearer <CRON_SECRET>`
- **Cadence:** Configured to run every 5 minutes (`*/5 * * * *`) via Vercel Cron or external scheduler.
- **Timing Logic:**
  - Retrieves active batches with enrolled students.
  - Matches today's day of week against `batch.days` (e.g. `["MON", "WED", "FRI"]`).
  - Converts `batch.clockTiming` (stored in GMT/UTC) to minutes from midnight.
  - Matches sessions starting in 10–20 minutes (centered on 15 minutes).
  - Checks the 60-minute deduplication cache (`reminder:${batch.id}:${dateStr}`) to guarantee students and coaches receive exactly **one** reminder per live session.
  - Dispatches high-priority push with Google Meet URL and deep link payload (`selffits://class/live?batchId=...&meetingUrl=...`).

### 3.3 Token Invalidation & Pruning
When FCM or APNs returns `messaging/registration-token-not-registered` or `messaging/invalid-registration-token`, the `PushNotificationService` marks the token as invalid and calls `DeviceTokenStore.pruneInvalidTokens([token])`. Unusable tokens never accumulate in storage.

### 3.4 Deep Link Navigation Specifications
| URI Scheme | Action | Behavior |
| :--- | :--- | :--- |
| `selffits://class/live?batchId=...&meetingUrl=...` | `joinLiveClass` | Validates meeting URL; launches external Google Meet or navigates to live class view. |
| `selffits://dashboard/student` | `studentDashboard` | Navigates to Student Live Class Dashboard. |
| `selffits://dashboard/coach` | `coachDashboard` | Navigates to Coach / Sensei Dashboard. |
| `selffits://notifications` | `notificationsFeed` | Opens Notifications Feed screen. |
| `https://meet.google.com/...` | `externalWeb` | Launches external Google Meet application via `url_launcher`. |

---

## 4. Phase 3: Configuration & Secrets (External Setup Required)

> [!IMPORTANT]
> To preserve repository security and production integrity, no service-account secrets or simulated credential files have been committed to git. Complete the following external setup before production deployment:

### 4.1 Server-Side Environment Variables
Add the following variables to `.env.production` (and Vercel Environment Variables):

| Environment Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `FIREBASE_PROJECT_ID` | Project ID from Firebase Console | `selffits-production` |
| `FIREBASE_CLIENT_EMAIL` | Service Account Client Email | `firebase-adminsdk-xxx@selffits-production.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Private key from Firebase Service Account JSON | `"-----BEGIN PRIVATE KEY-----\nMIIEv...=\n-----END PRIVATE KEY-----\n"` |
| `CRON_SECRET` | 32+ character high-entropy secret securing the reminder cron | Generate with `openssl rand -hex 32` |

### 4.2 Firebase Project Setup Steps
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Create or select the **SELFFITS** project.
3. Go to **Project Settings > Service accounts > Generate new private key**.
4. Set the `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` environment variables on the backend hosting environment.

### 4.3 Android Setup
1. In Firebase Console, add an Android app with package name: `com.selffits.selffits_mobile`.
2. Download `google-services.json`.
3. Place `google-services.json` inside `/Users/macbook/Desktop/selffits/mobile/android/app/`. *(Note: Already listed in `.gitignore` to prevent secret commits).*

### 4.4 iOS & APNs Setup
1. In Apple Developer Portal, create an **APNs Key** (`.p8` file) under **Certificates, Identifiers & Profiles > Keys**.
2. Note the **Key ID** and **Team ID**.
3. In Firebase Console, navigate to **Project Settings > Cloud Messaging > Apple app configuration**.
4. Upload the `.p8` file and enter the Key ID and Team ID.
5. In Firebase Console, add an iOS app with bundle ID: `com.selffits.selffitsMobile`.
6. Download `GoogleService-Info.plist` and place it in `/Users/macbook/Desktop/selffits/mobile/ios/Runner/`.

### 4.5 Vercel Cron Configuration
To run the 15-minute reminder cron automatically, add the following to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/v1/cron/class-reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 5. Phase 4: Implementation Boundaries & Protection Rules

1. **Website Functionality:** 100% preserved. Zero modifications to existing Next.js frontend pages, admin screens, or website components.
2. **NextAuth & Session Cookies:** Completely unaffected. Mobile bearer tokens use domain-separated derivation. Web session cookies remain untouched.
3. **Razorpay Payments:** Untouched. Web and server payment verification routes remain in their original state.
4. **Database Schema:** Zero breaking migrations. Zero modifications to `prisma/schema.prisma`.
5. **Git & Deployments:** No commits, pushes, or deployments were performed.

---

## 6. Phase 5: Verification & Automated Test Results

### 6.1 Backend Security & Dispatch Test Suite (`tests/mobile-notifications-security.ts`)
Run command: `npx tsx tests/mobile-notifications-security.ts`  
**Result: 21 Passed, 0 Failed (100% Pass Rate)**

```
Section 1: Device Token Registration Security & Validation
  ✓ PASS: Rejects token registration without Authorization header (401)
  ✓ PASS: Rejects malformed JSON body (400)
  ✓ PASS: Rejects invalid platform and short token via Zod schema (400)
  ✓ PASS: Successfully registers Android FCM device token for authenticated student (200)
  ✓ PASS: Successfully registers iOS APNs device token for authenticated coach (200)

Section 2: Token Ownership Isolation & Logout Cleanup
  ✓ PASS: Token initially owned by User 1
  ✓ PASS: Re-assigns device token ownership on account switch, preventing notification leakage
  ✓ PASS: Successfully unlinks device token upon user logout (200)
  ✓ PASS: Device token was completely deleted from store
  ✓ PASS: Blocks unauthorized user from unregistering another user's device token
  ✓ PASS: Victim token was preserved untouched

Section 3: Push Notification Dispatch & Deduplication
  ✓ PASS: Successfully dispatches 15-minute class reminder with Google Meet details
  ✓ PASS: Notification payload contains accurate deep link and meeting URL
  ✓ PASS: Duplicate class reminder for same session is suppressed by deduplication engine
  ✓ PASS: FCM provider flags unregistered/invalid token
  ✓ PASS: Invalid/unregistered device token automatically pruned from persistent store
  ✓ PASS: Dispatches schedule change, class cancellation, and announcement push events
  ✓ PASS: All notification types are strictly mapped to corresponding event channels

Section 4: Server-Side Cron Security (CRON_SECRET)
  ✓ PASS: Rejects cron execution without CRON_SECRET authorization (401)
  ✓ PASS: Authorizes server-side cron execution with valid CRON_SECRET (200)

Section 5: In-App Notification Feed
  ✓ PASS: Retrieves notifications feed and unread count for authenticated user (200)
```

### 6.2 Mobile API Security Test Suite (`tests/mobile-api-security.ts`)
Run command: `npx tsx tests/mobile-api-security.ts`  
**Result: 16 Passed, 0 Failed (100% Pass Rate)**

### 6.3 Next.js TypeScript Compilation Check
Run command: `npx tsc --noEmit`  
**Result: 0 errors, 0 warnings (Exit code 0)**

### 6.4 Flutter Static Analysis & Formatting (`mobile/`)
Run commands: `dart format --output=none --set-exit-if-changed .` && `flutter analyze`  
**Result: 0 issues found, 45 files formatted (100% Clean)**

### 6.5 Flutter Test Suite (`mobile/test/`)
Run command: `flutter test`  
**Result: 88 Passed, 0 Failed (100% Pass Rate across all modules)**
- Module 1 (Design System & Foundation): 7 tests passed
- Module 2 (Student Authentication): 12 tests passed
- Module 3 (Student Dashboard & Live Class): 25 tests passed
- Module 4 (Device Validation & Layouts): 14 tests passed
- Module 5 (Coach Dashboard & Role Separation): 12 tests passed
- Module 6 (Notifications, Permissions & Deep Links): 18 tests passed

### 6.6 Distinction: Automated vs. Live Hardware Tests
- **Automated Tests Verified:** Token registration, Zod validation, token refresh, token unlinking on logout, token isolation between accounts, 15-minute reminder calculation, session deduplication, invalid token auto-pruning, server-side cron security, permission state management, stream reception, unread count tracking, and deep link parsing.
- **Live Hardware Delivery Pending External Credentials:** Physical delivery of remote notifications over Apple APNs and Google FCM networks to locked physical devices requires the external credentials listed in Section 4 (`google-services.json`, `GoogleService-Info.plist`, and APNs `.p8` key).

---

## 7. Files Changed and Created

### Backend Files Created / Updated
1. [types/mobile-api.dto.ts](file:///Users/macbook/Desktop/selffits/types/mobile-api.dto.ts) — Added device token registration schemas, notification DTOs, push payload types, and cron response types.
2. [lib/device-token-store.ts](file:///Users/macbook/Desktop/selffits/lib/device-token-store.ts) — PostgreSQL-backed device token store with ownership transfer, token lookups, and auto-pruning.
3. [lib/push-notification-service.ts](file:///Users/macbook/Desktop/selffits/lib/push-notification-service.ts) — Multi-channel push dispatcher with FCM provider, 60-minute deduplication engine, and in-app persistence.
4. [app/api/v1/notifications/device-token/route.ts](file:///Users/macbook/Desktop/selffits/app/api/v1/notifications/device-token/route.ts) — `POST` (register token) and `DELETE` (unlink on logout).
5. [app/api/v1/notifications/route.ts](file:///Users/macbook/Desktop/selffits/app/api/v1/notifications/route.ts) — `GET` (in-app notifications feed) and `PATCH` (mark read / mark all read).
6. [app/api/v1/cron/class-reminders/route.ts](file:///Users/macbook/Desktop/selffits/app/api/v1/cron/class-reminders/route.ts) — Server-side 15-minute class reminder scheduler secured by `CRON_SECRET`.
7. [tests/mobile-notifications-security.ts](file:///Users/macbook/Desktop/selffits/tests/mobile-notifications-security.ts) — 21 automated backend security and architecture tests.

### Mobile Flutter Files Created / Updated
1. [mobile/lib/core/network/api_endpoints.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/core/network/api_endpoints.dart) — Added notifications and device token routes.
2. [mobile/lib/core/network/api_client.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/core/network/api_client.dart) — Added authenticated `delete` and `patch` HTTP methods.
3. [mobile/lib/features/notifications/models/notification_item.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/models/notification_item.dart) — Models for notifications, push payloads, and permission statuses.
4. [mobile/lib/features/notifications/services/deep_link_navigator.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/services/deep_link_navigator.dart) — Deep link parser and safe navigation engine.
5. [mobile/lib/features/notifications/services/notification_service.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/services/notification_service.dart) — Client notification service with platform token generation and push streams.
6. [mobile/lib/features/notifications/providers/notification_provider.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/providers/notification_provider.dart) — Riverpod notifier managing token sync, unread count, and feed.
7. [mobile/lib/features/notifications/presentation/notification_badge_button.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/presentation/notification_badge_button.dart) — Luxury White AppBar notification bell with unread badge counter.
8. [mobile/lib/features/notifications/presentation/notifications_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/presentation/notifications_screen.dart) — Luxury White notifications feed screen with permission warning banner and action buttons.
9. [mobile/lib/features/auth/providers/auth_provider.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/providers/auth_provider.dart) — Wired automatic device token sync on login and unlinking on logout.
10. [mobile/lib/features/student/presentation/student_home_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/presentation/student_home_screen.dart) — Integrated `NotificationBadgeButton` into AppBar.
11. [mobile/lib/features/coach/presentation/coach_home_screen.dart](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart) — Integrated `NotificationBadgeButton` into AppBar.
12. [mobile/test/notifications_module_test.dart](file:///Users/macbook/Desktop/selffits/mobile/test/notifications_module_test.dart) — 18 comprehensive automated Flutter tests.

---

## 8. Remaining Production Risks & Mitigations

1. **External Firebase/APNs Credentials:** Live remote delivery requires uploading the `.p8` key to Firebase Console and placing `google-services.json` and `GoogleService-Info.plist` in the platform build directories. *Mitigation: The service operates with a graceful fallback in development and testing environments, logging diagnostic warnings without crashing.*
2. **Cron Scheduler Trigger:** If `CRON_SECRET` is not set or the cron job is not registered in Vercel/AWS, 15-minute reminders will not automatically trigger. *Mitigation: Clear setup instructions and `vercel.json` snippet provided.*
3. **Google Meet Inactive URL:** If a coach or admin provides a malformed meeting URL, students tapping the notification will be directed to an empty URL. *Mitigation: `DeepLinkNavigator` strictly validates URL schemes (`https://` or `http://`) and handles invalid links gracefully with user feedback.*

---

## 9. Completion Gate Status

**Module 6 is complete and fully verified.** All tests pass, static analysis has 0 issues, and git boundaries are clean. Per prompt instructions, execution has halted. Awaiting explicit approval before proceeding to the final integration and release-readiness module.
