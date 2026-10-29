# SELFFITS — WEBSITE, ADMIN PANEL & MOBILE APP FEATURE MAPPING AUDIT
## Comprehensive Source-Verified Comparative Architecture Report

**Audit Date:** October 16, 2026  
**Auditor:** Antigravity Agentic Verification Engine  
**Mode:** READ-ONLY COMPREHENSIVE ARCHITECTURAL AUDIT  
**Scope:** Next.js Full-Stack Application, Admin Portal, Prisma Data Models, Server Actions, Mobile API Routes (`/api/v1/`), Flutter Mobile Application (`/mobile`), and Vercel Deployment Protections.  
**Strict Safeguards Applied:** Zero code modifications, zero schema changes, zero database migrations, zero Git state changes, zero production deployments.

---

## 1. Executive Summary

This report delivers a source-verified feature inventory and mapping across the three pillars of the SELFFITS platform:
1. **The Existing Next.js Web Application & Marketing Portal** (Public visitors, prospective students, and applicant coaches).
2. **The Authenticated Student & Coach Web Dashboards** (Existing web portal for training, live classes, certificates, and recordings).
3. **The Web Admin Management Portal** (Super Admin and Academy Administrators managing students, coaches, batches, curriculum, coupons, and payments).
4. **The Newly Built Flutter Mobile Application** (Luxury White native Android & iOS apps targeting students and coaches for live virtual class attendance and push notifications).

Every claim in this report has been verified directly against active source files, routes, components, and server actions.

---

## 2. Existing Website Feature Inventory

### 2.1 Public Website & Marketing Pages
The public portal is built on Next.js 16 (App Router) with React 19, Tailwind CSS v4, and Framer Motion.

| Feature / Page | Source Route & File | Key Components / Actions | Verified Database Source | Verification Findings |
| :--- | :--- | :--- | :--- | :--- |
| **Homepage** | [`app/page.tsx`](file:///Users/macbook/Desktop/selffits/app/page.tsx) | [`components/public/home-page-client.tsx`](file:///Users/macbook/Desktop/selffits/components/public/home-page-client.tsx)<br>[`getAdminHomepageManagementAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1011)<br>[`getAdminMenuItemsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L162) | `WebsiteSettings` (`homepage_sections`, `header_menu`, `footer_menu`) | Dynamic hero banner, statistics counter, discipline preview, student testimonials, and dynamic CTA controlled by admin. |
| **About Us** | [`app/(public)/about/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/about/page.tsx) | [`getAboutPageConfigAction`](file:///Users/macbook/Desktop/selffits/actions/about.actions.ts#L37) | `WebsiteSettings` (`about_page_config`) | Founder history, academy milestones, mission statement, philosophy, and verified coach highlights. |
| **Programs Catalog** | [`app/(public)/programs/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/programs/page.tsx) | [`components/public/programs-page-client.tsx`](file:///Users/macbook/Desktop/selffits/components/public/programs-page-client.tsx)<br>[`getAdminProgramsCatalogAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1762) | `Program`, `MembershipPlan` | Categorized tabs: Kids, Adults, Ladies Only. Disciplines: Martial Arts, Weight Loss, HIIT. Dynamic pricing in INR and USD. |
| **Coaches Directory** | [`app/(public)/coaches/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/coaches/page.tsx) | [`components/public/coaches-carousel.tsx`](file:///Users/macbook/Desktop/selffits/components/public/coaches-carousel.tsx)<br>`db.coachApplication.findMany` | `CoachApplication` (`status = APPROVED`) | Public showcase of certified Senseis, highest ranks, disciplines, coaching bios, and profile images. |
| **Become a Coach** | [`app/(public)/become-coach/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/become-coach/page.tsx) | [`components/public/become-coach-form.tsx`](file:///Users/macbook/Desktop/selffits/components/public/become-coach-form.tsx)<br>[`submitCoachApplicationAction`](file:///Users/macbook/Desktop/selffits/actions/coach-application.actions.ts#L65)<br>[`app/api/coach-application/upload-resume/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/coach-application/upload-resume/route.ts) | `CoachApplication` (`status = PENDING`) | Comprehensive 11-stage recruitment form with resume PDF upload, certifications, disciplines, video URLs, and availability. |
| **Contact & Inquiries** | [`app/(public)/contact/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/contact/page.tsx) | [`components/public/contact-page-client.tsx`](file:///Users/macbook/Desktop/selffits/components/public/contact-page-client.tsx) | `ContactInquiry` | Direct student/parent inquiry submission form storing name, email, phone, and inquiry message. |
| **FAQ Hub** | [`app/(public)/faq/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/faq/page.tsx) | [`components/public/faq-page-client.tsx`](file:///Users/macbook/Desktop/selffits/components/public/faq-page-client.tsx)<br>[`components/public/faq-accordion.tsx`](file:///Users/macbook/Desktop/selffits/components/public/faq-accordion.tsx) | Static / Config | Interactive accordion answering questions regarding live classes, equipment needed, belt examinations, and billing. |
| **Success Stories** | [`app/(public)/success-stories/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/success-stories/page.tsx) | [`components/public/testimonials-carousel.tsx`](file:///Users/macbook/Desktop/selffits/components/public/testimonials-carousel.tsx) | Static / Config | Transformation stories, martial arts belt progress testimonials, and parent reviews. |
| **Legal / Compliance** | [`app/(public)/terms/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/terms/page.tsx)<br>[`app/(public)/privacy/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/privacy/page.tsx) | Markdown / Static Content | Static | Terms of service, cancellation policy, privacy policy, and GDPR/data disclosures. |

---

### 2.2 Student Account & Web Dashboard
The authenticated student web portal is located under `app/(student)/dashboard/`.

| Feature / Screen | Source Route & File | Key Components / Actions | Verified Database Source | Verification Findings |
| :--- | :--- | :--- | :--- | :--- |
| **Student Auth** | [`app/(auth)/login/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(auth)/login/page.tsx)<br>[`app/(auth)/register/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(auth)/register/page.tsx) | NextAuth v5 Credentials Provider (`lib/auth.ts`) | `User`, `StudentProfile` | Email & password authentication with secure HTTP-only session cookies. Registration creates `STUDENT` user. |
| **Main Dashboard** | [`app/(student)/dashboard/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/page.tsx) | [`components/student/student-dashboard-view.tsx`](file:///Users/macbook/Desktop/selffits/components/student/student-dashboard-view.tsx)<br>[`getStudentEnrollmentAction`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L415) | `Enrollment`, `MembershipPlan`, `BatchStudent`, `Batch` | Displays student greeting, active enrollment details, remaining classes, upcoming class banner, and live class shortcut. |
| **Live Virtual Class Hub** | [`app/(student)/dashboard/live/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/live/page.tsx) | [`getStudentBatchInfoAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L852) | `Batch`, `BatchStudent`, `CoachApplication` | Displays assigned batch name, coach name, clock timing, day combination, Google Meet link button, and "Class Being Prepared" banner. |
| **Training Progress & Belts** | [`app/(student)/dashboard/progress/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/progress/page.tsx) | [`getStudentDashboardProgressAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L807) | `StudentProfile`, `BeltProgression`, `Examination` | Displays current belt rank (🥋 color-coded badge), award date, scheduled examination dates, exam status, and belt progression history. |
| **Official Certificates** | [`app/(student)/dashboard/certificates/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/certificates/page.tsx) | [`getStudentCertificatesAction`](file:///Users/macbook/Desktop/selffits/actions/certificates.actions.ts#L124)<br>[`app/api/certificates/download/[id]/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/certificates/download/[id]/route.ts) | `Certificate`, `Program` | Grid of official belt graduation certificates with unique certificate numbers, verification badges, and secure PDF download links. |
| **Profile & Settings** | [`app/(student)/dashboard/profile/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/profile/page.tsx) | Form UI with country and international dial code selector | Local React State Only | **CRITICAL AUDIT FINDING:** Profile submit and password update handlers set local React state only (`setSavedMsg`). There is no active server action or API call persisting changes to `StudentProfile`. |
| **Recorded Class Archive** | [`app/(student)/dashboard/recordings/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/recordings/page.tsx) | Video grid UI cards | Hardcoded Mock Data | **CRITICAL AUDIT FINDING:** Displays 3 static mock video cards. There is no `Recording` model in Prisma and no database video storage or streaming integration. |
| **Notifications Feed** | [`app/(student)/dashboard/notifications/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/notifications/page.tsx) | Static notification list UI | Hardcoded Mock Data | **CRITICAL AUDIT FINDING:** Displays 4 static mock items. Although [`actions/notifications.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/notifications.actions.ts) contains `getStudentNotificationsAction`, the web page does not call it. |

---

### 2.3 Memberships, Programs, Enrollment & Payments

| Feature | Source Route & File | Key Components / Actions | Database & External Integration | Verification Findings |
| :--- | :--- | :--- | :--- | :--- |
| **Schedule Selection** | [`app/(public)/checkout/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/checkout/page.tsx) | [`components/public/student-schedule-selector.tsx`](file:///Users/macbook/Desktop/selffits/components/public/student-schedule-selector.tsx) | `lib/schedule-config.ts` | Allows student to select days per week, day combinations (e.g. Sunday & Wednesday), time slot (Morning, Evening, Night), and GMT clock timings. |
| **Diet & Nutrition Addon** | [`app/(public)/checkout/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/checkout/page.tsx) | [`getDietNutritionConfigAction`](file:///Users/macbook/Desktop/selffits/actions/diet-nutrition.actions.ts#L27) | `WebsiteSettings` (`diet_nutrition_config`) | Optional paid nutrition plan add-on (₹999 / $15) integrated into checkout total calculation. |
| **Coupon Code Validation** | [`app/(public)/checkout/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/checkout/page.tsx) | [`validateCouponAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L28) | `Coupon`, `CouponUsage` | Verifies coupon code, active status, date validity, max total usage, and per-user limits. Calculates percentage or fixed discounts. |
| **Razorpay Checkout** | [`components/public/razorpay-checkout.tsx`](file:///Users/macbook/Desktop/selffits/components/public/razorpay-checkout.tsx) | [`createRazorpayOrderAction`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L119)<br>[`verifyPaymentSignatureAction`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts#L214) | `Payment`, `Enrollment`, `CouponUsage`<br>Razorpay Node SDK | Server-side order creation via Razorpay API, client-side Razorpay modal, cryptographic HMAC SHA-256 signature verification. |
| **Razorpay Webhook** | [`app/api/webhooks/razorpay/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/webhooks/razorpay/route.ts) | Webhook Route Handler | `Payment`, `CouponUsage` | Processes `payment.captured` and `order.paid` events with HMAC verification, updates payment to `SUCCESS`, records coupon usage, and sends confirmation emails via Resend. |
| **Payment Success Page** | [`app/(public)/checkout/success/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/checkout/success/page.tsx) | Client Success View | `Payment`, `Enrollment` | Displays transaction confirmation, order ID, classes granted, and direct link to `/dashboard`. |
| **Payment Failed Page** | [`app/(public)/checkout/failed/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(public)/checkout/failed/page.tsx) | Client Failure View | N/A | Displays retry instructions, support contact details, and link back to checkout. |

---

### 2.4 Coach Web Dashboard & Management

| Feature | Source Route & File | Key Components / Actions | Database Source | Verification Findings |
| :--- | :--- | :--- | :--- | :--- |
| **Coach Auth & Role Gate** | [`app/(coach)/coach/dashboard/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(coach)/coach/dashboard/page.tsx) | NextAuth session check (`role === "COACH" \|\| "ADMIN"`) | `User`, `CoachApplication` | Enforces coach/admin role. Resolves `CoachApplication` profile by matching user's email address. |
| **Coach Overview** | [`components/coach/coach-dashboard-view.tsx`](file:///Users/macbook/Desktop/selffits/components/coach/coach-dashboard-view.tsx) | [`getCoachDashboardDataAction`](file:///Users/macbook/Desktop/selffits/actions/coach.actions.ts#L57) | `CoachApplication`, `Batch` | Displays Coach full name, profile picture, rank, disciplines, total active batches, and total assigned students count. |
| **Upcoming Class Card** | [`components/coach/coach-upcoming-class-card.tsx`](file:///Users/macbook/Desktop/selffits/components/coach/coach-upcoming-class-card.tsx) | `calculateNextClassSession` (`lib/class-schedule.ts`) | `Batch` | Calculates next class session from day combination and clock timing. Direct button launches Google Meet URL. |
| **Assigned Batches List** | [`components/coach/coach-dashboard-view.tsx`](file:///Users/macbook/Desktop/selffits/components/coach/coach-dashboard-view.tsx) | `batches.map` | `Batch`, `Program` | Card for each batch coached by this instructor with schedule, capacity (e.g. 3/8 students), status badge, and Google Meet URL. |
| **Student Roster** | [`components/coach/coach-dashboard-view.tsx`](file:///Users/macbook/Desktop/selffits/components/coach/coach-dashboard-view.tsx) | `b.students.map` | `BatchStudent`, `User`, `Enrollment` | Displays authorized student roster for each batch: student name, email, avatar, martial arts type, and assignment date. |

---

### 2.5 Admin Panel & Super Admin Capabilities
The Admin Portal is located under `app/admin/` and protected by `AdminShell` (`role === "ADMIN" || "SUPER_ADMIN"`).

| Admin Feature / View | Source Route & File | Server Actions Used | Database Entities Controlled | Verified Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard Stats** | [`app/admin/dashboard/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/dashboard/page.tsx) | [`getAdminDashboardStatsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L14) | `User`, `Enrollment`, `Payment`, `CoachApplication`, `MembershipPlan` | High-level metrics: total students, active enrollments, total revenue in INR, transaction count, pending coach applications, recent payments table, recent enrollments table. |
| **Student Management** | [`app/admin/students/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/students/page.tsx) | [`getAdminStudentsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1971)<br>[`getAdminStudentDetailsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L2303)<br>[`toggleBlockStudentAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L2528) | `User`, `StudentProfile`, `Enrollment`, `Payment`, `BatchStudent` | Search students by name/email/phone, filter by active enrollment, inspect full enrollment and payment history, and toggle account suspension (`user.isBlocked`). |
| **Batch Management** | [`app/admin/batches/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/batches/page.tsx) | [`getAdminBatchesAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L71)<br>[`createBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L370)<br>[`updateBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L469)<br>[`assignStudentToBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L617)<br>[`removeStudentFromBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L710)<br>[`deactivateOrDeleteBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L752) | `Batch`, `BatchStudent`, `Program`, `MembershipPlan`, `CoachApplication` | Create and edit batches, assign coaches, set day combinations, set clock timings, set Google Meet/Zoom URLs, set max capacity, set status (ACTIVE/FULL/INACTIVE), and assign/remove students. |
| **Coach Accounts** | [`app/admin/coaches/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/coaches/page.tsx) | [`getAdminCoachesAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1091)<br>[`createCoachLoginAccountAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1158)<br>[`resetCoachPasswordAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1327)<br>[`toggleSuspendCoachAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1435)<br>[`deleteCoachAccountAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1464)<br>[`updateCoachDisciplinesAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1485) | `CoachApplication`, `User` | View approved coaches, provision login credentials (`User` with role `COACH`), reset coach passwords, toggle suspension status, update coaching disciplines, and delete accounts. |
| **Coach Applications** | [`app/admin/coach-applications/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/coach-applications/page.tsx) | [`getAdminCoachApplicationsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1509)<br>[`updateCoachApplicationStatusAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1595) | `CoachApplication` | Review incoming coach applications, inspect certifications, experience, resumes, and video URLs, and approve or reject candidates. |
| **Programs & Catalog** | [`app/admin/programs/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/programs/page.tsx) | [`getAdminProgramsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1646)<br>[`updateAdminProgramsCatalogAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1771)<br>[`updateSingleMartialArtsTypeAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1861) | `Program`, `MembershipPlan`, `WebsiteSettings` (`martial_arts_types`) | View programs and membership tiers, edit catalog descriptions and pricing, and manage discipline types and curriculum details. |
| **Student Progress & Belts** | [`app/admin/student-progress/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/student-progress/page.tsx) | [`getAdminStudentProgressListAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L25)<br>[`createExaminationAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L377)<br>[`updateExaminationStatusAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L441)<br>[`assignStudentBeltAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L501)<br>[`issueBeltCertificateAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L592)<br>[`assignStudentBeltDirectAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L701)<br>[`deleteStudentCertificateAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L759) | `StudentProfile`, `BeltProgression`, `Examination`, `Certificate`, `Notification` | Track student belt ranks, schedule examinations, update exam results (PASSED/FAILED/ABSENT), award belts, and issue official PDF certificates (which automatically creates in-app notifications). |
| **Payments & Revenue** | [`app/admin/payments/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/payments/page.tsx) | [`getAdminPaymentsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L2566) | `Payment`, `User`, `Enrollment`, `Coupon` | Complete transaction audit log with Razorpay payment IDs, order IDs, payment status (SUCCESS/PENDING/FAILED), currencies, and coupon discounts. |
| **Coupon Management** | [`app/admin/coupons/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/coupons/page.tsx) | [`getAdminCouponsAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L192)<br>[`createAdminCouponAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L217)<br>[`updateAdminCouponAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L299)<br>[`toggleAdminCouponActiveAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L387)<br>[`deleteAdminCouponAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L414)<br>[`getAdminCouponUsagesAction`](file:///Users/macbook/Desktop/selffits/actions/coupons.actions.ts#L454) | `Coupon`, `CouponUsage` | Create and edit coupon codes, set discount type (percentage or fixed amount), set start and expiration dates, set maximum total and per-user usage limits, toggle active status, and view coupon redemption logs. |
| **Hero Banner CMS** | [`app/admin/banner/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/banner/page.tsx) | [`getAdminBannerContentAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L204)<br>[`updateAdminBannerContentAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L269)<br>[`uploadBannerImageAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L291) | `WebsiteSettings` (`banner_content`) | Manage homepage hero slider carousel slides, headlines, CTAs, button URLs, and background image uploads. |
| **Navigation Menu CMS** | [`app/admin/menu/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/menu/page.tsx) | [`getAdminMenuItemsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L162)<br>[`updateAdminMenuItemsAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L171) | `WebsiteSettings` (`header_menu`, `footer_menu`) | Customize website navigation header and footer links, labels, order, and visibility toggles. |
| **About Page CMS** | [`app/admin/about/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/about/page.tsx) | [`getAboutPageConfigAction`](file:///Users/macbook/Desktop/selffits/actions/about.actions.ts#L37)<br>[`updateAboutPageConfigAction`](file:///Users/macbook/Desktop/selffits/actions/about.actions.ts#L51)<br>[`uploadAboutImageAction`](file:///Users/macbook/Desktop/selffits/actions/about.actions.ts#L85) | `WebsiteSettings` (`about_page_config`) | Manage About page story copy, statistical counters, academy milestones, founder credentials, and image uploads. |
| **System Settings** | [`app/admin/settings/page.tsx`](file:///Users/macbook/Desktop/selffits/app/admin/settings/page.tsx) | Local React state only (`setSavedMsg`) | N/A | **CRITICAL AUDIT FINDING:** Admin Settings UI (site name, contact email, phone, currency mode) contains no backend server action or database persistence. |

---

## 3. Mobile App Feature Inventory

Classification Scheme:
- **IMPLEMENTED AND TESTED:** Verified in source code and passing 100% automated tests.
- **IMPLEMENTED BUT EXTERNALLY CONFIGURATION-DEPENDENT:** Code complete and test-verified, but requires third-party credentials (e.g. FCM/APNs keys) for live physical delivery.
- **PARTIALLY IMPLEMENTED:** Partial UI or logic exists, but full flow is incomplete.
- **NOT IMPLEMENTED:** Not present in the mobile application.
- **NOT APPLICABLE:** Web-only or admin-specific feature intentionally excluded from mobile.

| Mobile Feature | Classification | Source Files in `mobile/` | Associated Backend Route / Action | Description & Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Luxury White Design System** | **IMPLEMENTED AND TESTED** | [`mobile/lib/core/design_system/`](file:///Users/macbook/Desktop/selffits/mobile/lib/core/design_system/) | N/A | Strict `#FFFFFF` canvas, `AppColors`, Outfit & Inter typography, `AppButton`, `AppCard`, `AppTextField`, `StatusBadge`, and original Selffits logo. Verified across 5 screen sizes. |
| **Student Login** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/auth/presentation/student_login_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/presentation/student_login_screen.dart) | `POST /api/v1/auth/login` | Email/password input validation, error handling, password visibility toggle, loading states, and demo autofill helpers. |
| **Secure Token Storage** | **IMPLEMENTED AND TESTED** | [`mobile/lib/core/storage/secure_storage_service.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/core/storage/secure_storage_service.dart) | N/A | Hardware-backed Keychain (iOS) and EncryptedSharedPreferences (Android) storing domain-separated JWT tokens. |
| **Session Restoration on Boot** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/auth/providers/auth_provider.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/providers/auth_provider.dart) | `GET /api/v1/auth/me` | Validates persisted token against `/api/v1/auth/me` on boot. Automatically logs in if valid; clears token and routes to login if expired. |
| **Role-Aware Auth Gatekeeper** | **IMPLEMENTED AND TESTED** | [`mobile/lib/app.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/app.dart) | N/A | Routes authenticated `STUDENT` to `StudentHomeScreen`, authenticated `COACH` or `ADMIN` to `CoachHomeScreen`, and unauthenticated to `StudentLoginScreen`. |
| **Instant Account Suspension** | **IMPLEMENTED AND TESTED** | [`mobile/lib/core/network/api_client.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/core/network/api_client.dart) | Server middleware in [`lib/mobile-auth.ts`](file:///Users/macbook/Desktop/selffits/lib/mobile-auth.ts#L104) | Every `/api/v1` request validates `user.isBlocked` against PostgreSQL. If blocked by Admin, returns 403 and automatically purges mobile session. |
| **Student Enrollment Summary** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/student/presentation/student_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/presentation/student_home_screen.dart) | `GET /api/v1/student/dashboard` | Displays program title, category, membership tier name, active status badge, remaining classes counter, validity dates, and timezone. |
| **Live Class Countdown & Status** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/student/utils/class_status_calculator.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/utils/class_status_calculator.dart) | `GET /api/v1/student/dashboard` | Accurate GMT-to-local timezone conversion, live countdown timer, and status badging (`UPCOMING`, `STARTING_SOON`, `LIVE_NOW`, `PREPARING`, `ENDED`). |
| **Google Meet Class Launch** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/student/presentation/student_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/presentation/student_home_screen.dart) | `GET /api/v1/student/dashboard` | Validates meeting URL (`https://meet.google.com/...` or Zoom) and launches external video conferencing app via `url_launcher`. |
| **Attendance & Progress Indicator** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/student/presentation/student_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/presentation/student_home_screen.dart) | `GET /api/v1/student/dashboard` | Visual percentage progress bar displaying attended classes vs total classes granted in enrollment. |
| **Coach Login & Dashboard** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/coach/presentation/coach_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart) | `GET /api/v1/coach/dashboard` | Coach profile header, rank, disciplines tags, upcoming class card with Google Meet launch, and total active students count. |
| **Coach Batch Rosters** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/coach/presentation/coach_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart) | `GET /api/v1/coach/dashboard` | Expandable batch cards displaying assigned students: student name, email, avatar, martial arts type, and enrollment date. |
| **Device Token Registration** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/notifications/services/notification_service.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/services/notification_service.dart) | `POST /api/v1/notifications/device-token` | Hardware token registration on login; persists in PostgreSQL `WebsiteSettings` with device OS and timestamp. |
| **Device Token Logout Unlinking** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/auth/providers/auth_provider.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/providers/auth_provider.dart) | `DELETE /api/v1/notifications/device-token` | Automatically unlinks device token from backend on logout to prevent cross-account push leakage. |
| **In-App Notification Feed** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/notifications/presentation/notifications_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/presentation/notifications_screen.dart) | `GET /api/v1/notifications` | Feed of user-specific notifications from `db.notification` with unread dot indicators, relative timestamps, and action buttons. |
| **Mark Notification as Read** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/notifications/presentation/notifications_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/presentation/notifications_screen.dart) | `PATCH /api/v1/notifications` | Tapping notification marks it read in database and updates unread badge counter. |
| **AppBar Notification Badge** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/notifications/presentation/notification_badge_button.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/presentation/notification_badge_button.dart) | `GET /api/v1/notifications` | Unread counter pill badge on AppBar bell icon on both Student and Coach screens. |
| **Deep-Link Navigation Engine** | **IMPLEMENTED AND TESTED** | [`mobile/lib/features/notifications/services/deep_link_navigator.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/services/deep_link_navigator.dart) | N/A | Handles deep links from notifications: `selffits://class/live`, external Google Meet URLs, and `selffits://dashboard`. |
| **Server-Side 15m Class Reminders** | **IMPLEMENTED AND TESTED** | Backend [`lib/push-notification-service.ts`](file:///Users/macbook/Desktop/selffits/lib/push-notification-service.ts) | `GET /api/v1/cron/class-reminders` | Cron endpoint scanning upcoming classes in 15-minute window, dispatching push notifications with 60-minute deduplication window. |
| **Live Remote Push Delivery (FCM/APNs)** | **IMPLEMENTED BUT EXTERNALLY CONFIGURATION-DEPENDENT** | [`lib/push-notification-service.ts`](file:///Users/macbook/Desktop/selffits/lib/push-notification-service.ts) | Firebase Admin SDK / APNs HTTP/2 | Software architecture and payload generation 100% verified by test suite. Real delivery to locked hardware requires `google-services.json`, `GoogleService-Info.plist`, APNs `.p8` key, and Firebase Admin environment variables. |
| **Belt Progression & Examination Hub** | **NOT IMPLEMENTED** | None | [`actions/student-progress.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts) (Web only) | Mobile app does not have a dedicated Belt Progression or Examination screen. |
| **Official Certificates & PDF Viewer** | **NOT IMPLEMENTED** | None | [`actions/certificates.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/certificates.actions.ts) (Web only) | Mobile app does not have a Certificates screen or in-app PDF certificate viewer. |
| **Recorded Class Archive** | **NOT IMPLEMENTED** | None | None | Not implemented in mobile (web version is hardcoded mock data). |
| **Student Profile Edit & Password Change** | **NOT IMPLEMENTED** | None | None | Mobile has no profile editing or password reset screen (students manage profile on web). |
| **Student Registration & Checkout Flow** | **NOT IMPLEMENTED** | None | [`actions/payments.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/payments.actions.ts) (Web only) | Students register and purchase memberships via Razorpay on the website. Mobile app is dedicated to training and live classes. |
| **Coach Application Submission** | **NOT APPLICABLE** | None | [`actions/coach-application.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/coach-application.actions.ts) | Public web recruiting feature. Not intended for mobile app. |
| **Admin Management Portal** | **NOT APPLICABLE** | None | [`app/admin/`](file:///Users/macbook/Desktop/selffits/app/admin/) | Desktop web administration console. Not intended for mobile app. |

---

## 4. Website-to-Mobile Feature Mapping

The following matrix compares every feature on the SELFFITS platform across Web, Backend, and Mobile:

| Website Feature | Existing Backend Functionality | Corresponding Mobile Screen | API Endpoint Used | Database Logic Reused | What is Missing or Different in Mobile | Admin Controllable | Source Evidence |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **Student Login** | `POST /api/auth/callback/credentials` (NextAuth v5) | `StudentLoginScreen` | `POST /api/v1/auth/login` | ✅ Yes (`User`, bcrypt password check) | Mobile uses domain-separated JWT tokens stored in hardware keychain instead of cookies. | ✅ Yes (`user.isBlocked`) | [`student_login_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/presentation/student_login_screen.dart), [`app/api/v1/auth/login/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/v1/auth/login/route.ts) |
| **Student Session Verification** | NextAuth `auth()` session cookie check | Boot splash / `AuthGatekeeper` | `GET /api/v1/auth/me` | ✅ Yes (`User`, `StudentProfile`) | Mobile checks JWT bearer token; web checks HTTP session cookie. | ✅ Yes (`user.isBlocked`) | [`auth_provider.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/auth/providers/auth_provider.dart), [`app/api/v1/auth/me/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/v1/auth/me/route.ts) |
| **Student Dashboard Overview** | `getStudentEnrollmentAction()` | `StudentHomeScreen` | `GET /api/v1/student/dashboard` | ✅ Yes (`Enrollment`, `MembershipPlan`) | Mobile features luxury white card layout with live animated countdown and quick action buttons. | ✅ Yes (Enrollment status in `/admin/students`) | [`student_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/presentation/student_home_screen.dart), [`app/api/v1/student/dashboard/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/v1/student/dashboard/route.ts) |
| **Live Virtual Class Hub** | `getStudentBatchInfoAction()` | `StudentHomeScreen` (Live Class Card) | `GET /api/v1/student/dashboard` | ✅ Yes (`Batch`, `BatchStudent`) | Mobile embeds countdown timer and Google Meet launcher directly on the home screen rather than a separate sub-page. | ✅ Yes (Timing & URL in `/admin/batches`) | [`class_status_calculator.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/utils/class_status_calculator.dart), [`app/api/v1/student/dashboard/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/v1/student/dashboard/route.ts) |
| **Google Meet Class Launch** | Direct `<a>` link on `/dashboard/live` | "Join Class" button | Client launch via `url_launcher` | ✅ Yes (`batch.meetingUrl`) | Mobile validates `https://meet.google.com` or Zoom format and launches native Google Meet app via intent/URL scheme. | ✅ Yes (`meetingUrl` in `/admin/batches`) | [`student_home_screen.dart#L280`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/student/presentation/student_home_screen.dart#L280) |
| **Coach Overview & Batches** | `getCoachDashboardDataAction()` | `CoachHomeScreen` | `GET /api/v1/coach/dashboard` | ✅ Yes (`CoachApplication`, `Batch`) | Mobile combines overview, upcoming class card, and expandable student rosters in a unified luxury white stream. | ✅ Yes (Batches in `/admin/batches`) | [`coach_home_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart), [`app/api/v1/coach/dashboard/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/v1/coach/dashboard/route.ts) |
| **Coach Student Roster** | Inlined inside `CoachDashboardView` | Expandable batch cards in `CoachHomeScreen` | `GET /api/v1/coach/dashboard` | ✅ Yes (`BatchStudent`, `User`, `Enrollment`) | Mobile supports tap-to-expand roster accordion with avatar, martial arts discipline, and enrollment date. | ✅ Yes (Assign in `/admin/batches`) | [`coach_home_screen.dart#L260`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/coach/presentation/coach_home_screen.dart#L260) |
| **Notifications Feed** | Hardcoded mock data on `/dashboard/notifications` | `NotificationsScreen` | `GET /api/v1/notifications`, `PATCH /api/v1/notifications` | ✅ Yes (`Notification` table) | **Mobile is superior to Web:** Mobile queries real PostgreSQL notifications and allows marking as read. Web has static dummy data. | ⚠️ Partial (Generated by cert/belt events, no manual broadcast UI) | [`notifications_screen.dart`](file:///Users/macbook/Desktop/selffits/mobile/lib/features/notifications/presentation/notifications_screen.dart), [`app/api/v1/notifications/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/v1/notifications/route.ts) |
| **Push Notifications & Reminders** | None on Web | Background FCM / APNs dispatch | `GET /api/v1/cron/class-reminders` | ✅ Yes (`lib/push-notification-service.ts`) | Web has zero push capabilities. Mobile includes hardware token registry, 15m cron window, and 60m deduplication. | ⚠️ Automated (Runs via cron; no manual trigger button) | [`push-notification-service.ts`](file:///Users/macbook/Desktop/selffits/lib/push-notification-service.ts), [`device-token-store.ts`](file:///Users/macbook/Desktop/selffits/lib/device-token-store.ts) |
| **Official Certificates** | `getStudentCertificatesAction()` | None | None | ❌ Not in Mobile | Web allows viewing and downloading PDF belt certificates. Mobile has no certificates screen. | ✅ Yes (Issued in `/admin/student-progress`) | [`app/(student)/dashboard/certificates/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/certificates/page.tsx) |
| **Belt Progression & Exams** | `getStudentDashboardProgressAction()` | None | None | ❌ Not in Mobile | Web displays belt rank progression timeline and exam results. Mobile only displays remaining classes counter. | ✅ Yes (Managed in `/admin/student-progress`) | [`app/(student)/dashboard/progress/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/progress/page.tsx) |
| **Student Profile Edit** | Local state form on `/dashboard/profile` | None | None | ❌ Not in Mobile | Neither Web nor Mobile currently persists student profile edits to `StudentProfile`. | ❌ No | [`app/(student)/dashboard/profile/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/profile/page.tsx) |
| **Recorded Class Archive** | Hardcoded mock data on `/dashboard/recordings` | None | None | ❌ Not in Mobile | Neither Web nor Mobile has a backend-backed class recording archive. | ❌ No | [`app/(student)/dashboard/recordings/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/recordings/page.tsx) |
| **Registration & Checkout** | `createRazorpayOrderAction()`, `verifyPaymentSignatureAction()` | None | None | ❌ Not in Mobile | Razorpay payment flow, coupon application, and schedule customization exist only on Web. | ✅ Yes (Coupons & Payments in `/admin`) | [`components/public/razorpay-checkout.tsx`](file:///Users/macbook/Desktop/selffits/components/public/razorpay-checkout.tsx) |
| **Admin Portal** | `AdminShell`, 14 admin pages | None | None | ❌ Not in Mobile | Full administration portal is strictly a desktop web interface. | ✅ Yes | [`app/admin/`](file:///Users/macbook/Desktop/selffits/app/admin/) |

---

## 5. Admin Control Audit

This section audits how administrative actions taken in the web Admin Portal (`app/admin/`) impact the values visible in the mobile application.

| Admin Control Area | Verified Admin Interface in Admin Panel | Backend Implementation | Impact on Mobile App | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Student Accounts & Suspension** | **Yes:** [`components/admin/admin-students-view.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/admin-students-view.tsx)<br>[`components/admin/block-student-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/block-student-modal.tsx) | [`toggleBlockStudentAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L2528) sets `user.isBlocked = true/false` | **Instant:** Any request to `/api/v1` verifies `user.isBlocked`. Blocking a student immediately terminates active mobile session with 403 Forbidden. | ✅ **VERIFIED ADMIN CONTROL** |
| **Coach Accounts & Passwords** | **Yes:** [`components/admin/admin-coaches-view.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/admin-coaches-view.tsx)<br>[`components/admin/coach-login-account-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/coach-login-account-modal.tsx) | [`createCoachLoginAccountAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1158)<br>[`resetCoachPasswordAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1327) | **Direct:** Admin creates coach login credentials. Coach uses these exact credentials to log into the mobile app via `loginCoach()`. | ✅ **VERIFIED ADMIN CONTROL** |
| **Coach Suspension** | **Yes:** [`components/admin/suspend-coach-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/suspend-coach-modal.tsx) | [`toggleSuspendCoachAction`](file:///Users/macbook/Desktop/selffits/actions/admin.actions.ts#L1435) sets `CoachApplication.status = SUSPENDED` | **Direct:** Suspended coaches receive error when loading `/api/v1/coach/dashboard`. | ✅ **VERIFIED ADMIN CONTROL** |
| **Batches & Schedule Timings** | **Yes:** [`components/admin/admin-batches-view.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/admin-batches-view.tsx)<br>[`components/admin/create-batch-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/create-batch-modal.tsx) | [`createBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L370)<br>[`updateBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L469) | **Direct:** Admin modifies day combination, time slot, or clock timing. Updates immediately alter countdown timer and schedule text on both Student and Coach mobile screens. | ✅ **VERIFIED ADMIN CONTROL** |
| **Google Meet / Zoom URLs** | **Yes:** [`components/admin/create-batch-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/create-batch-modal.tsx) | [`updateBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L469) updates `batch.meetingUrl` | **Direct:** Updating `meetingUrl` activates or updates the "Join Class" button on Student and Coach mobile home screens. If empty, mobile displays "Class Being Prepared". | ✅ **VERIFIED ADMIN CONTROL** |
| **Batch Student Rosters** | **Yes:** [`components/admin/assign-student-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/assign-student-modal.tsx) | [`assignStudentToBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L617)<br>[`removeStudentFromBatchAction`](file:///Users/macbook/Desktop/selffits/actions/batch.actions.ts#L710) | **Direct:** Assigning or removing a student immediately adds/removes them from the Coach's expandable mobile roster and links the student's mobile dashboard to the batch. | ✅ **VERIFIED ADMIN CONTROL** |
| **Enrollment Status & Classes** | **Yes:** [`components/admin/student-details-modal.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/student-details-modal.tsx) | Read-only in modal; updated via payment actions | **Direct:** Student mobile dashboard reflects `remainingClasses` vs `totalClassesGranted` and active status. | ✅ **VERIFIED ADMIN CONTROL** |
| **Belt Examinations & Belts** | **Yes:** [`components/admin/admin-student-progress-view.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/admin-student-progress-view.tsx) | [`createExaminationAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L377)<br>[`assignStudentBeltAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L501) | **Indirect:** Updating belt rank updates `StudentProfile.currentBelt`. Creates in-app `Notification` visible in mobile feed. (Belt progress screen itself not yet in mobile). | ⚠️ **BACKEND FUNCTIONALITY (PARTIAL MOBILE VISIBILITY)** |
| **Certificate Issuance** | **Yes:** [`components/admin/admin-student-progress-view.tsx`](file:///Users/macbook/Desktop/selffits/components/admin/admin-student-progress-view.tsx)<br>[`app/api/admin/upload-certificate/route.ts`](file:///Users/macbook/Desktop/selffits/app/api/admin/upload-certificate/route.ts) | [`issueBeltCertificateAction`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts#L592) | **Notification Only:** When Admin issues a certificate, a notification is inserted into `db.notification` which appears in the mobile feed. (PDF viewer not yet in mobile). | ⚠️ **BACKEND FUNCTIONALITY (PARTIAL MOBILE VISIBILITY)** |
| **Manual Push / Announcements** | **None:** No admin screen exists for drafting and broadcasting custom push messages. | Automated reminders in [`push-notification-service.ts`](file:///Users/macbook/Desktop/selffits/lib/push-notification-service.ts) | **Automated Only:** Push notifications are triggered by class reminders cron (`/api/v1/cron/class-reminders`) or system belt events. Admin cannot compose ad-hoc announcements. | ⚠️ **BACKEND FUNCTIONALITY WITHOUT IDENTIFIED ADMIN INTERFACE** |
| **Mobile App Branding & Theme** | **None:** Theme is hardcoded in Flutter (`mobile/lib/core/design_system/`). | None | **None:** Mobile theme is compiled statically. Admin cannot toggle theme or remote styles from the web admin panel. | ❌ **FUNCTIONALITY NOT FOUND** |
| **Mobile Feature Flags & Config** | **None:** No admin screen exists for mobile app remote configuration. | None | **None:** No dynamic mobile feature flags or version check endpoints exist in `/api/v1`. | ❌ **FUNCTIONALITY NOT FOUND** |

---

## 6. Deployment Isolation Audit

### 6.1 Configuration Inspection Evidence

1. **`.vercelignore` File Inspection:**
   ```
   # Vercel Deployment Exclusions
   mobile/
   tests/
   scratch/
   *.md
   ```
   - **Verification:** The entire `mobile/` directory is explicitly excluded from Vercel deployments. During a `git push` or Vercel CLI deployment, Vercel will not upload, trace, or compile any Dart, Flutter, Gradle, CocoaPods, Xcode, or mobile test files.
   - **Build Impact:** Zero build time overhead on Vercel from mobile source code.

2. **Root `.gitignore` File Inspection:**
   ```
   # flutter & mobile build artifacts
   mobile/.dart_tool/
   mobile/.flutter-plugins
   mobile/.flutter-plugins-dependencies
   mobile/.packages
   mobile/.pub-cache/
   mobile/.pub/
   mobile/build/
   mobile/ios/Pods/
   mobile/ios/.symlinks/
   mobile/ios/Flutter/Flutter.framework
   mobile/ios/Flutter/Flutter.podspec
   mobile/android/.gradle/
   mobile/android/local.properties
   mobile/android/app/build/
   *.apk
   *.aab
   *.ipa
   ```
   - **Verification:** Heavy native build artifacts (`app-release.apk` at 51.6 MB, `Runner.app` at 17.6 MB, Gradle caches, CocoaPods caches) are strictly ignored. No mobile binary files will pollute the Git repository or exceed GitHub's 100 MB file limit.

3. **Backend Route Colocation (`app/api/v1/`):**
   - The `/api/v1/` route handlers reside directly within the Next.js `app/` directory:
     * `app/api/v1/auth/login/route.ts`
     * `app/api/v1/auth/me/route.ts`
     * `app/api/v1/student/dashboard/route.ts`
     * `app/api/v1/coach/dashboard/route.ts`
     * `app/api/v1/notifications/device-token/route.ts`
     * `app/api/v1/notifications/route.ts`
     * `app/api/v1/cron/class-reminders/route.ts`
   - **Verification:** Because these endpoints are located inside `app/api/v1/` (outside `mobile/`), they are automatically compiled into Vercel Serverless Functions during standard Next.js deployments. This ensures the mobile app has access to production backend APIs upon deployment.

### 6.2 Change Scenarios & Blast Radius Analysis

| Change Scenario | Impact on Website | Impact on Mobile App | Build / Deployment Safety |
| :--- | :--- | :--- | :--- |
| **Website-Only Change**<br>(e.g. Editing homepage marketing copy, changing Tailwind styles in `components/public/`, updating About page) | Normal Vercel build and redeployment. | **Zero Impact:** Flutter mobile app communicates strictly via `/api/v1/` HTTP endpoints. Mobile client is completely unaffected. | ✅ 100% Safe |
| **Shared Database / Prisma Schema Change**<br>(e.g. Adding columns to `User` or `Batch`) | Requires `prisma generate` and Next.js rebuild. | If columns are optional or additive, zero impact. If existing fields are renamed or removed, `/api/v1/` endpoints could fail. | ⚠️ Requires regression testing of `types/mobile-api.dto.ts` |
| **Mobile API Route Change**<br>(e.g. Modifying `/app/api/v1/student/dashboard/route.ts`) | Deployed with Next.js. Website pages do not call `/api/v1/`, so website is unaffected. | Mobile app consumes `/api/v1/`. Breaking changes to JSON response contracts will crash or break mobile UI parsing. | ⚠️ Requires validating with `tests/mobile-api-security.ts` |
| **Mobile-Only Change**<br>(e.g. Editing Flutter widgets in `mobile/lib/`) | **Zero Impact:** `.vercelignore` prevents Vercel from seeing `mobile/`. Vercel build does not trigger or run. | Requires Flutter build command (`flutter build apk` or `flutter build ios`) for mobile store distribution. | ✅ 100% Isolated |

### 6.3 Identified Build or Configuration Conflicts
- **Prisma Build Script:** In [`package.json`](file:///Users/macbook/Desktop/selffits/package.json#L7), the build command is `"prisma db push --accept-data-loss && prisma generate && next build"`. This was configured prior to mobile development. While it works for automated staging deployments, `--accept-data-loss` in production builds carries accidental table modification risks if schema edits are made haphazardly.
- **Vercel Cron Trigger:** `vercel.json` does not currently exist in the repository root. To enable automated triggering of `/api/v1/cron/class-reminders` on Vercel production, a `vercel.json` file must be added to git with the approved cron schedule before production release.

---

## 7. Comparative Feature Matrix & Gaps

```
+---------------------------------------------------------------------------------------+
|                                    SELFFITS ECOSYSTEM                                  |
+-------------------------------------------+-------------------------------------------+
|               WEBSITE & ADMIN             |              FLUTTER MOBILE               |
+-------------------------------------------+-------------------------------------------+
| [x] Marketing & Public Pages              | [ ] Direct Login Only (No Marketing)      |
| [x] Razorpay Checkout & Coupons           | [ ] Purchases on Web Only                 |
| [x] Student Web Dashboard                 | [x] Student Luxury White Home Screen      |
| [x] Live Meeting Hub (Google Meet)        | [x] Live Meeting Hub (Intent Launch)      |
| [x] Live Countdown & Status Badges        | [x] Live Countdown & Status Badges        |
| [x] Coach Web Dashboard & Batches         | [x] Coach Luxury White Home Screen        |
| [x] Expandable Student Rosters            | [x] Expandable Student Rosters            |
| [ ] Static Mock Notifications Page        | [x] Database-Backed Notification Feed     |
| [ ] Zero Push Notification Support        | [x] Hardware FCM/APNs & 15m Cron Reminders|
| [x] Belt Progress & Exam Timeline         | [ ] Not Implemented in Mobile             |
| [x] Belt Certificates & PDF Downloads     | [ ] Not Implemented in Mobile             |
| [ ] Static Mock Recorded Classes Archive  | [ ] Not Implemented in Mobile             |
| [x] Full Admin Management Portal          | [ ] Desktop Web Only (Not Applicable)     |
+-------------------------------------------+-------------------------------------------+
```

---

## 8. Final Summary & Prioritized Recommendations

### 8.1 Summary Findings
1. **High Core Logic Reuse:** The mobile app reuses 100% of the existing PostgreSQL models (`User`, `Enrollment`, `MembershipPlan`, `Batch`, `BatchStudent`, `CoachApplication`, `Notification`, `WebsiteSettings`) and authentication logic (`bcrypt` password hashes and domain-separated keys).
2. **Mobile Notification Superiority:** The mobile notification architecture (`NotificationService`, `DeviceTokenStore`, `PushNotificationService`, `/api/v1/notifications`) is significantly more advanced than the website. The website's `/dashboard/notifications` page currently displays hardcoded mock data, whereas mobile connects to the live database and supports push notifications.
3. **Admin Control Directness:** Key operational values visible in the mobile app (student block status, coach credentials, batch assignments, schedule times, and Google Meet URLs) are immediately and directly controllable by administrators through the existing web Admin Panel.
4. **Key Gaps in Mobile:** The mobile app does not currently include:
   - Belt Progression history and examination tracker.
   - Official Certificates viewer and PDF download.
   - In-app student profile editing or password reset.
   - In-app membership checkout or payment processing.
5. **Deployment Isolation:** Complete isolation is verified. Flutter source files are excluded from Vercel via `.vercelignore`, while `/api/v1/` route handlers are natively compiled into Vercel serverless functions.

### 8.2 Prioritized Next Steps (Recommended Roadmap)

#### Priority 1: Production Push Notification Credentials & Cron Setup (Pre-Release)
- **Action:** Obtain Firebase credentials (`google-services.json` for Android, `GoogleService-Info.plist` and Apple APNs `.p8` key for iOS). Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `CRON_SECRET` in production Vercel environment variables.
- **Action:** Add `vercel.json` with the 5-minute cron trigger for `/api/v1/cron/class-reminders`.

#### Priority 2: Connect Web Notifications to Live Database (Web Parity)
- **Action:** Update [`app/(student)/dashboard/notifications/page.tsx`](file:///Users/macbook/Desktop/selffits/app/(student)/dashboard/notifications/page.tsx) to call [`getStudentNotificationsAction()`](file:///Users/macbook/Desktop/selffits/actions/notifications.actions.ts#L7) instead of rendering static mock cards. This will bring the website student portal up to parity with the mobile app.

#### Priority 3: Mobile Student Belt Progress & Certificates Screen (Feature Expansion)
- **Action:** Port the verified backend logic from [`actions/student-progress.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/student-progress.actions.ts) and [`actions/certificates.actions.ts`](file:///Users/macbook/Desktop/selffits/actions/certificates.actions.ts) into new `/api/v1/student/progress` and `/api/v1/student/certificates` endpoints.
- **Action:** Build dedicated Luxury White "Belt Progress" and "My Certificates" screens in Flutter so students can track belt advancement and view official certificates natively on mobile.

#### Priority 4: Admin Custom Push Notification Broadcast Tool (Admin Capability)
- **Action:** Create a new Admin Panel screen (`app/admin/notifications/page.tsx`) allowing academy administrators to compose and broadcast custom push notifications (e.g. holiday closures, special seminars, belt graduation alerts) directly to student and coach mobile devices via `PushNotificationService`.

#### Priority 5: High-Concurrency Device Token Table Migration (Scalability)
- **Action:** When active mobile users exceed 2,000 devices, migrate device token storage from `WebsiteSettings` JSON blob to a dedicated PostgreSQL table (`DeviceToken`) with unique indices on `token` and `userId` to eliminate JSON read-modify-write concurrency bottlenecks.

---

**Audit Completed:** October 16, 2026  
**Report File Created:** `SELFFITS_WEBSITE_ADMIN_MOBILE_FEATURE_MAPPING.md`  
**Execution Status:** Halted per instructions. No code changes implemented. Awaiting user review.
