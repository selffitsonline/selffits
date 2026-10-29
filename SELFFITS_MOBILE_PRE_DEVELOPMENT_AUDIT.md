# SELFFITS Mobile App — Pre-Development Audit & Design System Plan

**Document Path:** `/Users/macbook/Desktop/selffits/SELFFITS_MOBILE_PRE_DEVELOPMENT_AUDIT.md`  
**Audit Date:** October 16, 2026  
**Status:** Strictly Read-Only Audit & Planning Specification  
**Execution Agent:** Antigravity AI  

---

## 1. Verified Repository & Folder Structure

A complete read-only inspection of `/Users/macbook/Desktop/selffits` was conducted to establish the exact physical layout of the repository.

```
/Users/macbook/Desktop/selffits/
├── app/
│   ├── (auth)/                       # Web authentication routes (login, register, forgot-password)
│   ├── (coach)/coach/dashboard/      # Web coach portal
│   ├── (public)/                     # Web public pages (home, about, checkout, programs)
│   ├── (student)/dashboard/          # Web student portal (live, certificates, progress, profile)
│   ├── admin/                        # Web admin management back-office
│   ├── api/                          # Backend route handlers
│   │   ├── admin/                    # Admin file uploads
│   │   ├── auth/[...nextauth]/       # NextAuth v5 session handler
│   │   ├── certificates/             # Dynamic PDF generator & download
│   │   ├── diet-nutrition/           # Protected PDF downloads
│   │   ├── media/                    # Dynamic CMS image streaming & in-memory cache
│   │   ├── v1/                       # NEW: Mobile REST API namespace (Phase B)
│   │   │   ├── auth/login/           # POST /api/v1/auth/login
│   │   │   ├── auth/me/              # GET  /api/v1/auth/me
│   │   │   ├── coach/dashboard/      # GET  /api/v1/coach/dashboard
│   │   │   └── student/dashboard/    # GET  /api/v1/student/dashboard
│   │   └── webhooks/razorpay/        # Razorpay payment confirmation webhook
│   ├── globals.css                   # Tailwind v4 web styling & CSS variables
│   └── layout.tsx                    # Root HTML layout & Google Font loaders
├── actions/                          # Next.js Server Actions (15 files, ~250 KB business logic)
├── components/                       # Web React UI components (admin, student, coach, public)
├── emails/                           # Resend React Email templates (welcome, payment, certs)
├── lib/                              # Shared backend utilities, DB clients, and schedule engines
│   ├── auth.ts                       # NextAuth v5 server configuration
│   ├── class-schedule.ts             # Central class schedule & next session calculation engine
│   ├── db.ts                         # Prisma PostgreSQL client singleton & enum self-healer
│   ├── mobile-auth.ts                # NEW: Mobile token signing (HS256) & Bearer validation
│   ├── razorpay.ts                   # Razorpay API client
│   └── storage.ts                    # Local & serverless file storage provider
├── prisma/
│   └── schema.prisma                 # PostgreSQL database schema (18 models)
├── public/                           # Static assets, brand logo, and public uploads
├── tests/                            # Automated security tests (Phase B test suite)
│   └── mobile-api-security.ts        # 16 automated security & contract tests
├── types/
│   ├── mobile-api.dto.ts             # NEW: Mobile API DTOs and Zod v4 validation schemas
│   └── validation.schemas.ts         # Web form Zod schemas
├── .gitignore                        # Git exclusions
├── package.json                      # Next.js dependencies and scripts
└── tsconfig.json                     # TypeScript configuration
```

### 1.1 Specific Findings on Mobile Assets

| Item Checked | Verified Status | Exact Location / Path |
| :--- | :---: | :--- |
| **Existing Website & Backend** | **VERIFIED** | Located at the repository root (`/app`, `/actions`, `/lib`, `/prisma`, `/components`). |
| **Mobile REST API Routes** | **VERIFIED** | Fully established at [`/app/api/v1/`](file:///Users/macbook/Desktop/selffits/app/api/v1) (`auth/login`, `auth/me`, `student/dashboard`, `coach/dashboard`). |
| **Flutter Project Existence** | **NOT FOUND** | **No Flutter project exists** anywhere in `/Users/macbook/Desktop/selffits`. No `pubspec.yaml`, `pubspec.lock`, or Dart source files exist. |
| **Android / iOS Directories** | **NOT FOUND** | No native `android/` or `ios/` folders exist. |
| **APK / AAB Artifacts** | **NOT FOUND** | Zero compiled binaries exist in the workspace. |
| **Git Exclusions (.gitignore)** | **INCOMPLETE** | [`.gitignore`](file:///Users/macbook/Desktop/selffits/.gitignore) excludes Next.js artifacts (`/.next/`, `/node_modules`, `/out/`), but **completely lacks Flutter ignore rules** (`*.apk`, `*.aab`, `*.ipa`, `.dart_tool/`, `ios/Pods/`, `.flutter-plugins`, `android/.gradle/`). Root `/build` does not cover a nested Flutter `mobile/build/` folder. |
| **Vercel Impact & Risk** | **ATTENTION REQUIRED** | Vercel deploys from the root via project `prj_QR6mBaA7tQFW5tFXPFvcWcWeLqwc`. No `.vercelignore` file exists. If Flutter code and build outputs are committed to the same repository without a `.vercelignore`, Vercel will attempt to bundle those assets, risking deployment bloat or failure. |

### 1.2 Separation Matrix: Shared vs. Isolated Code

```
+----------------------------------------------------------------------------------------------------+
|                                    CODE SEPARATION MATRIX                                          |
+------------------------------------+---------------------------------------------------------------+
| COMPONENT                          | ISOLATION STATUS & RELATIONSHIP                               |
+------------------------------------+---------------------------------------------------------------+
| PostgreSQL Database (Prisma)       | SHARED: Single source of truth for both web and mobile.       |
| REST API Endpoints (/app/api/v1/)  | DEDICATED: Consumed strictly by mobile clients.               |
| Server Actions (/actions/)         | ISOLATED: Used strictly by Next.js web application.           |
| Web React UI (/components/, /app/) | ISOLATED: Used strictly by web desktop and mobile browsers.   |
| Schedule Engine (class-schedule.ts)| SHARED: Central calculation logic imported by web and API.    |
| Authentication Secrets             | SHARED BASE: Derived mobile key eliminates token confusion.   |
| Future Flutter App (Dart UI)       | ISOLATED: Must reside in an isolated directory (e.g. /mobile).|
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Checklist of Visual Decisions Awaiting Owner Approval

The project owner has **not yet finalized** the visual design, typography, or colour theme for the mobile application. All items below are formally categorized as **[PENDING OWNER APPROVAL]**.

For architectural context, the existing website's branding is documented below as **REFERENCE ONLY**. It must **not** be automatically imposed on the mobile application without explicit authorization.

### 2.1 Visual Design Decision Checklist

```
[ ] 1. BRAND COLOUR PALETTE [PENDING OWNER APPROVAL]
    - Primary Brand Colour (The dominant accent for primary CTAs and active states).
    - Secondary Accent Colour (Secondary interactive elements and highlights).
    - Canvas / Background Tone (Pure black #000000 vs Dark Onyx vs Charcoal vs Light Neutral).
    - Card / Surface Tone (Container elevation and panel background).
    - Border & Divider Style (Subtle 10% opacity borders vs flat unbordered cards vs shadows).

[ ] 2. THEME MODES [PENDING OWNER APPROVAL]
    - Option A: Dark Theme Only (Aesthetic match with gym/martial arts entertainment apps).
    - Option B: Light Theme Only.
    - Option C: Adaptive Dual Theme (Supports both Light and Dark based on OS system settings).

[ ] 3. TYPOGRAPHY & FONT SELECTION [PENDING OWNER APPROVAL]
    - Headings Font: e.g. Outfit / Montserrat / Syne / Native System (San Francisco/Roboto).
    - Body & Numbers Font: e.g. Inter / Plus Jakarta Sans / Roboto.
    - Title Hierarchy: Scale, weight (Black/Extrabold vs Medium), and uppercase vs title-case titles.

[ ] 4. BUTTONS & INTERACTIVE CONTROLS [PENDING OWNER APPROVAL]
    - Button Geometry: Fully pill-shaped (rounded-full) vs Standard curved (12px/16px) vs Sharp.
    - Primary CTA Style: Solid high-contrast colour vs Gradient fill vs Glassmorphic glow.
    - Haptic Feedback: Heavy vs Light haptics on primary button taps.

[ ] 5. DASHBOARD LAYOUT & CARD DENSITY [PENDING OWNER APPROVAL]
    - Student Feed: Hero countdown card vs Compact schedule bar.
    - Video Class Launcher: Full-width prominent banner ("Join Live Class") vs Standard action item.
    - Coach Dashboard: Card-based batch list vs Grouped schedule timeline.

[ ] 6. NAVIGATION PATTERN [PENDING OWNER APPROVAL]
    - Option A: Fixed Bottom Navigation Bar (4-5 tabs: Home, Schedule, Progress, Profile).
    - Option B: Floating Dock Navigation.
    - Option C: Sidebar Drawer Navigation.

[ ] 7. APP ICON & LAUNCH STORYBOARD [PENDING OWNER APPROVAL]
    - App Icon Graphic: SELFFITS emblem vs Simplified "SF" monogram.
    - Splash Screen Style: Minimal centered logo on dark background vs Animated branded splash.

[ ] 8. STATE VIEWS & FEEDBACK [PENDING OWNER APPROVAL]
    - Loading State: Shimmer skeleton blocks vs Brand spinning indicator.
    - Empty State: Minimal icon + text vs Custom martial arts illustration.
    - Offline State: Persistent banner at screen top vs Full-screen retry sheet.

[ ] 9. ACCESSIBILITY & CONTRAST [PENDING OWNER APPROVAL]
    - Target: WCAG 2.1 AA compliant contrast (minimum 4.5:1 for normal text).
    - Dynamic Text Sizing: Support for OS-level large font accessibility scaling.
```

### 2.2 Reference Website Branding (REFERENCE ONLY — NOT BINDING FOR MOBILE)

*The existing website uses the following styling parameters, provided solely for comparative reference:*

- **Canvas Background:** `#0A0B0E` (Onyx Dark, [`app/globals.css:5`](file:///Users/macbook/Desktop/selffits/app/globals.css#L5))
- **Card Surface:** `#14161D` (Charcoal Surface, [`app/globals.css:8`](file:///Users/macbook/Desktop/selffits/app/globals.css#L8))
- **Primary Brand Red:** `#E50914` (Brand Crimson, [`app/globals.css:14`](file:///Users/macbook/Desktop/selffits/app/globals.css#L14)) with `#FF1E27` gradient
- **Secondary Brand Blue:** `#0080FF` (Brand Azure, [`app/globals.css:17`](file:///Users/macbook/Desktop/selffits/app/globals.css#L17))
- **Live Class Green:** `#10B981` (Emerald Green, used for "Join Live Class" button and pulse indicator)
- **Warning Gold:** `#F59E0B` (Amber, used for belt badges and notifications)
- **Muted Text:** `#9CA3AF` / `#6B7280` (Silver / Neutral Gray)
- **Typography:** Outfit (Display & Headings), Inter (Body & Data Tables)
- **Corner Radii:** `0.75rem` (12px standard card corners)

---

## 3. Recommended Flutter Design System Architecture

To ensure that **any colour theme or typography approved by the owner can be configured in a single file without rewriting UI screens**, the Flutter application must follow a centralized, token-based design system architecture.

```
mobile/lib/core/design_system/
├── tokens/
│   ├── app_colors.dart         # Single source of truth for all color tokens
│   ├── app_typography.dart     # Central text styles & Google Fonts configuration
│   ├── app_spacing.dart        # 4px/8px standard layout grid (xs: 4, sm: 8, md: 16, lg: 24, xl: 32)
│   ├── app_radii.dart          # Corner radius definitions (sm: 8, md: 12, lg: 16, full: 999)
│   └── app_shadows.dart        # Elevation and ambient glow definitions
├── theme/
│   ├── app_theme.dart          # Central ThemeData builder (Dark & Light theme definitions)
│   └── theme_extensions.dart   # Custom theme extension for academy-specific tokens (belt colors)
└── components/                 # Reusable Atomic UI Widget Library
    ├── buttons/
    │   ├── primary_button.dart # Standardized CTA with loading spinner & disabled states
    │   └── secondary_button.dart
    ├── cards/
    │   ├── surface_card.dart   # Base container card with standard padding & borders
    │   └── gradient_card.dart  # Prominent card for countdowns & live sessions
    ├── feedback/
    │   ├── state_empty_view.dart
    │   ├── state_error_view.dart
    │   └── state_loading_skeleton.dart
    ├── inputs/
    │   ├── app_text_field.dart # Standardized input with floating labels & error text
    │   └── country_phone_input.dart
    └── navigation/
        └── app_bottom_nav_bar.dart
```

### 3.1 Token-Based Color Architecture Pattern

By structuring `AppColors` around **semantic roles** rather than hardcoded visual names, the owner's eventual palette decision can be applied by editing only `app_colors.dart`:

```dart
// mobile/lib/core/design_system/tokens/app_colors.dart (ARCHITECTURE BLUEPRINT)
abstract class AppColors {
  // Configured based on Owner Approval
  static const Color primary = Color(0xFFE50914);       // Replaced upon approval
  static const Color secondary = Color(0xFF0080FF);     // Replaced upon approval
  static const Color liveIndicator = Color(0xFF10B981); // Live class green
  
  // Neutral Canvas & Surface
  static const Color background = Color(0xFF0A0B0E);
  static const Color surface = Color(0xFF14161D);
  static const Color surfaceElevated = Color(0xFF1C1F2A);
  
  // Borders & Separators
  static const Color border = Color(0x1AFFFFFF);        // 10% white
  static const Color borderFocused = Color(0x4DFFFFFF); // 30% white
  
  // Typography Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0xFF6B7280);
}
```

### 3.2 Preventing Code Duplication Between Student and Coach Screens

Both the Student and Coach portals share identical underlying visual components:
1. **Live Class Meeting Action:** Both portals present a Google Meet launch button. Rather than coding two buttons, both use `AppPrimaryButton(label: "Join Live Class", icon: LucideIcons.video, onPressed: ...)`.
2. **Schedule Information Cards:** Both display day combinations and GMT timings. They consume the shared `SurfaceCard` with `AppSpacing.md` padding.
3. **Status Badges:** Both display batch levels and active states using `StatusBadge(label: "ACTIVE", variant: BadgeVariant.success)`.

The screens differ **only in data models and composition**, sharing 100% of the underlying design system widgets.

---

## 4. Preserved Architecture & Deployment Risk Safeguards

### 4.1 Retained Baseline
1. **Frontend Engine:** Native Flutter compiling to Android and iOS.
2. **Backend Engine:** Next.js 16.3.0 App Router hosted on Vercel.
3. **Mobile API Layer:** Additive, isolated `/app/api/v1/` REST routes established in Phase B.
4. **Database:** PostgreSQL with 18 Prisma models unchanged.
5. **Push Notifications:** Firebase Cloud Messaging (FCM) and Apple APNs remain scheduled as a required mobile capability during Phase 5, strictly gated to avoid premature database changes.

### 4.2 Potential Conflicts & Deployment Safeguards

```
+----------------------------------------------------------------------------------------------------+
|                               DEPLOYMENT CONFLICT SAFEGUARDS                                       |
+--------------------------+-------------------------------------------------------------------------+
| POTENTIAL CONFLICT       | ARCHITECTURAL SAFEGUARD TO IMPLEMENT                                    |
+--------------------------+-------------------------------------------------------------------------+
| Vercel Deployment Bloat  | Add a `.vercelignore` file at the repository root explicitly ignoring    |
|                          | the `/mobile` directory so Vercel never traces or uploads Flutter code. |
+--------------------------+-------------------------------------------------------------------------+
| Git Repository Pollution | Update `.gitignore` with standard Flutter exclusions (`.dart_tool/`,     |
|                          | `*.apk`, `*.aab`, `ios/Pods/`, `build/`) before initializing Flutter.   |
+--------------------------+-------------------------------------------------------------------------+
| Prisma Auto-Push Hazard  | The `package.json` build script runs `prisma db push --accept-data-loss`.|
|                          | Ensure local mobile development NEVER triggers `npm run build` against  |
|                          | production database connection strings.                                 |
+--------------------------+-------------------------------------------------------------------------+
```

---

## 5. Required Next Steps Before Flutter UI Implementation

```
+--------------------------------------------------------------------------------------------------------+
|                                    REQUIRED PRE-UI ROADMAP                                             |
+--------------------------------------------------------------------------------------------------------+
| Step 1: Owner Design Approval                 [ AWAITING OWNER DECISIONS FROM CHECKLIST ]              |
| Step 2: Configure .gitignore & .vercelignore  [ Pre-requisite before creating /mobile ]                |
| Step 3: Initialize Flutter Project Shell      [ In isolated /mobile subdirectory ]                     |
| Step 4: Implement Core Theme Tokens           [ Based strictly on Owner's approved palette ]           |
| Step 5: Build Reusable Widget Library         [ AppButton, AppCard, AppTextField, StatusBadge ]        |
| Step 6: Connect Riverpod to /api/v1/          [ Wire verified Phase B API endpoints ]                  |
+--------------------------------------------------------------------------------------------------------+
```

---

## 6. Safety & Verification Confirmation

In compliance with your strictly read-only instructions:
- **Application Files Modified:** **0**
- **Configuration Changed:** **0** (no `.gitignore`, `package.json`, or Vercel edits made)
- **Flutter Projects Initialized:** **0** (no Dart files or directories created)
- **Packages Installed:** **0**
- **Database Status:** **0** queries, migrations, or mutations executed
- **Git Commits / Branches:** **0** commits created
- **Deployments:** **0** deployments initiated

*Audit complete. All repository files remain completely untouched and locked awaiting the owner's design decisions.*
