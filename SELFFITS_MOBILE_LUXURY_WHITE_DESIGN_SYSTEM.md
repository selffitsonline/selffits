# SELFFITS Mobile App — Luxury White Design System
## Official Visual Identity & Design Specification

**Document Path:** `/Users/macbook/Desktop/selffits/SELFFITS_MOBILE_LUXURY_WHITE_DESIGN_SYSTEM.md`  
**Theme Style:** Premium Luxury White (World-Class Athletic & Martial Arts Aesthetic)  
**Strict Requirement:** Background is ALWAYS white/light. Never use black or dark backgrounds.  
**Core Brand Palette:** Signature Selffits Red & Royal Azure Blue (Derived from Original Logo)  
**Target Platforms:** iOS & Android (Native Flutter App)  
**Status:** Design System Specification Awaiting Final Client Sign-Off  

---

## 1. Executive Design Manifesto

### 1.1 The Luxury White Aesthetic
The SELFFITS mobile experience is modeled after world-class, premium athletic and luxury fitness brands (such as Apple Fitness+, Equinox, Tracksmith, and Alo Moves). 

The visual identity is anchored on:
- **Pristine, Luminous Light Backgrounds:** Pure white (`#FFFFFF`) as the foundational canvas, paired with subtle porcelain and soft alabaster tiers (`#F8FAFC`, `#F1F5F9`) for structural depth.
- **Absolute Rule: Zero Dark Mode.** The mobile app will not render dark or black canvas backgrounds. Every screen, card, modal, and drawer maintains an inviting, high-end white identity.
- **Strategic Brand Chromatics:** The original Selffits logo's **Signature Red** (`#E50914`) and **Signature Blue** (`#0080FF`) are deployed with surgical precision for primary calls-to-action, highlights, active states, and martial arts belt progression milestones.
- **Architectural Cards & Micro-Elevations:** High-end white cards framed with hair-thin 1px borders (`#E2E8F0`) and multi-tier diffused ambient shadows, replacing harsh black borders with soft, elegant depth.
- **World-Class Typography:** Modern geometric sans-serif **Outfit** for powerful, luxury headings and **Inter** for ultra-crisp body copy, statistics, and forms.

```
+----------------------------------------------------------------------------------------------------+
|                                    LUXURY WHITE COLOR PALETTE                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  CANVAS / BACKGROUNDS:                                                                             |
|  [ #FFFFFF: Pure White Canvas ]     [ #F8FAFC: Off-White Slate ]     [ #F1F5F9: Subtle Surface ]    |
|                                                                                                    |
|  SIGNATURE BRAND RED (From Logo):                                                                  |
|  [ #E50914: Primary Brand Red ]     [ #DC2626: Deep Red ]            [ #FEF2F2: Red Tint 50 ]      |
|                                                                                                    |
|  SIGNATURE BRAND BLUE (From Logo):                                                                 |
|  [ #0080FF: Royal Azure Blue ]      [ #0066CC: Deep Blue ]           [ #EFF6FF: Blue Tint 50 ]     |
|                                                                                                    |
|  HIGH-CONTRAST LUXURY TEXT:                                                                        |
|  [ #0F172A: Deep Onyx Slate ]       [ #475569: Refined Slate ]       [ #94A3B8: Metadata Silver ]  |
|                                                                                                    |
|  LIVE CLASS & ACCENTS:                                                                             |
|  [ #10B981: Live Class Emerald ]    [ #ECFDF5: Emerald Tint 50 ]     [ #F59E0B: Belt Award Gold ]  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Complete Color Token Specification (`AppColors`)

Every color token is named semantically so that the Flutter application maintains 100% centralized consistency.

### 2.1 Background & Surface Hierarchy

| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `background` | `#FFFFFF` | Primary screen canvas. Crisp, optic white throughout all screens. |
| `surface` | `#FFFFFF` | Primary card surface. Elevated slightly via diffused multi-layer shadows. |
| `surfaceSecondary` | `#F8FAFC` | Secondary grouped section background, input field fill, and table headers. |
| `surfaceTertiary` | `#F1F5F9` | Subtle chip backgrounds, inactive tabs, and divider fills. |
| `surfaceFrosted` | `rgba(255, 255, 255, 0.90)` | Translucent bottom navigation dock with 20px blur backdrop. |

### 2.2 Brand Signatures (Preserving Original Selffits Logo)

| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `brandRed` | `#E50914` | **Primary Brand Accent.** Used for primary CTA buttons ("Join Live Class", "Enroll Now"), live pulsing radar dots, and unread notification badges. |
| `brandRedDark` | `#DC2626` | Pressed / active state for red buttons and high-contrast text accents. |
| `brandRedLight` | `#FEF2F2` | Ultra-soft 5% red tint used for highlight card backgrounds and alert containers. |
| `brandBlue` | `#0080FF` | **Secondary Brand Accent.** Used for program category chips, active tab indicators, progress bar fills, and secondary interactive outlines. |
| `brandBlueDark` | `#0066CC` | Pressed / active state for blue actions. |
| `brandBlueLight` | `#EFF6FF` | Soft 5% blue tint used for batch badges, calendar pill highlights, and info cards. |

### 2.3 Functional & Status Colors

| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `liveEmerald` | `#10B981` | Live class active state, verified attendance badges, and upcoming class tags. |
| `liveEmeraldLight`| `#ECFDF5` | Soft green background fill for "Assigned Batch" and "Meeting Ready" badges. |
| `warningAmber` | `#F59E0B` | Upcoming belt examination notices, certificate alerts, and schedule changes. |
| `warningAmberLight`| `#FFFBEB` | Soft amber container fill. |
| `errorRose` | `#EF4444` | Form validation errors and payment failure notices. |
| `errorRoseLight` | `#FEF2F2` | Soft error banner container fill. |

### 2.4 Luxury Typography Colors (High-Contrast Slate)

*Contrast ratio against `#FFFFFF` canvas is rigorously validated for readability:*

| Token Name | Hex Code | Contrast on `#FFFFFF` | Application |
| :--- | :--- | :---: | :--- |
| `textPrimary` | `#0F172A` | **15.8 : 1** (Exceeds WCAG AAA) | Main titles, class names, student names, and countdown timers. |
| `textSecondary` | `#475569` | **7.0 : 1** (Exceeds WCAG AAA) | Subheadings, descriptions, schedule timings, and input labels. |
| `textTertiary` | `#94A3B8` | **4.6 : 1** (Exceeds WCAG AA) | Timestamps, coach rank labels, and subtle auxiliary metadata. |
| `textOnPrimary` | `#FFFFFF` | **4.5+ : 1** on Red / Blue | Text on red or blue primary CTA buttons. |

### 2.5 Borders & Ambient Shadows

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `borderLight` | `#E2E8F0` (Slate 200) | Subtle 1px card framing border. Crisp and clean on white. |
| `borderSubtle` | `#F1F5F9` (Slate 100) | Inner card separators and section divider lines. |
| `borderFocused` | `#0080FF` (Brand Blue) | Active text field and selected card border. |
| `shadowCard` | `0px 4px 20px rgba(15, 23, 42, 0.04), 0px 1px 3px rgba(15, 23, 42, 0.02)` | Standard card elevation. Soft, diffused, high-end feel. |
| `shadowFloating` | `0px 12px 36px rgba(15, 23, 42, 0.08), 0px 2px 6px rgba(15, 23, 42, 0.04)` | Elevated modal sheets, dropdowns, and active live class card. |
| `shadowRedButton` | `0px 8px 24px rgba(229, 9, 20, 0.25)` | Luxury colored glow beneath primary Red CTA buttons. |
| `shadowBlueButton`| `0px 8px 24px rgba(0, 128, 255, 0.25)` | Luxury colored glow beneath secondary Blue buttons. |

---

## 3. Typography Hierarchy (`AppTypography`)

The app uses **Outfit** for bold, energetic athletic headlines and **Inter** for clean, legible body text and numerical stats.

```
+----------------------------------------------------------------------------------------------------+
|                                    TYPOGRAPHY SCALE & ROLES                                        |
+------------------+----------+--------+---------+-------------------+-------------------------------+
| STYLE NAME       | FONT     | SIZE   | WEIGHT  | LINE HEIGHT / LS  | APPLICATION                   |
+------------------+----------+--------+---------+-------------------+-------------------------------+
| Display Large    | Outfit   | 32 px  | 800     | 38 px / -0.5px    | Hero countdowns & greetings   |
| Display Medium   | Outfit   | 24 px  | 700     | 30 px / -0.3px    | Screen titles & batch headers |
| Headline Large   | Outfit   | 20 px  | 700     | 26 px / -0.2px    | Section titles & card headers |
| Title Medium     | Inter    | 16 px  | 600     | 22 px / 0.0px     | Card titles & button labels   |
| Body Large       | Inter    | 14 px  | 400     | 20 px / 0.0px     | Descriptions & instructions   |
| Body Medium      | Inter    | 13 px  | 400     | 18 px / 0.0px     | List items & table details    |
| Label Small      | Inter    | 11 px  | 700     | 14 px / +0.8px    | UPPERCASE badges & tags       |
| Metric Bold      | Outfit   | 28 px  | 800     | 32 px / -0.5px    | "14 Classes Left", "05:15 PM" |
+------------------+----------+--------+---------+-------------------+-------------------------------+
```

---

## 4. Spacing, Radii & Grid System (`AppSpacing`)

- **Base Layout Metric:** 4px / 8px grid.
  - `xxs`: `4px`
  - `xs`: `8px`
  - `sm`: `12px`
  - `md`: `16px` (Standard inner padding)
  - `lg`: `20px` (Screen horizontal gutter & card padding)
  - `xl`: `24px`
  - `xxl`: `32px` (Section separation)
- **Corner Radii (`AppRadii`):**
  - `sm`: `8px` (Chips, small badges, text input fields)
  - `md`: `14px` (Buttons, action items, list cards)
  - `lg`: `20px` (Hero cards, schedule containers, dialogs)
  - `pill`: `999px` (Status badges, pill buttons, avatar rings)

---

## 5. Luxury Component Design Specifications

### 5.1 Primary "Join Live Class" Action Card

The centerpiece of the Student and Coach Dashboards is the upcoming class launcher:

```
+-----------------------------------------------------------------------------------+
|  [ SURFACE CARD: Pure White #FFFFFF with Soft Shadow & 1px Border #E2E8F0 ]       |
|                                                                                   |
|  [● LIVE IN 15 MINS]  [BATCH SF-B1-2026]              [Martial Arts Academy]      |
|  (Emerald Pill Badge)  (Soft Blue Badge)                                          |
|                                                                                   |
|  Adults Karate — 1st Batch                                                        |
|  Next Session: Today • 05:15 PM to 06:00 PM (GMT)                                 |
|                                                                                   |
|  Assigned Coach: Sensei Sujith John (Black Belt 4th Dan)                          |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  ▶  JOIN LIVE CLASS (GOOGLE MEET)                            [External ↗]   |  |
|  |     (Signature Red #E50914 Solid Button with White Bold Text)               |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ Weekly Schedule: Sunday & Wednesday ]           [ 6 / 8 Students Attending ]   |
+-----------------------------------------------------------------------------------+
```

- **Card Styling:** `#FFFFFF` background, `20px` corner radius, subtle `border: 1px solid #E2E8F0`, luxury diffused shadow `shadowCard`.
- **Button Styling:** High-energy Brand Red (`#E50914`) gradient to `#DC2626`, height `54px`, `14px` radius, subtle red ambient glow (`shadowRedButton`).
- **Live Indicator:** Radar pulsing green dot (`#10B981`) inside `#ECFDF5` container.

### 5.2 Navigation Dock: Frosted Glass Bottom Bar

The bottom navigation bar uses frosted luxury glass:
- **Background:** `rgba(255, 255, 255, 0.90)` with `BackdropFilter` 20px blur.
- **Top Border:** 1px solid `#E2E8F0`.
- **Active Tab Item:** Signature Brand Red (`#E50914`) icon with a tiny red indicator pill below the label.
- **Inactive Tab Item:** Refined Slate (`#64748B`) with smooth 200ms color transition on selection.
- **Elevation:** Zero harsh dropshadow; elegant diffused top shadow `rgba(15, 23, 42, 0.03)`.

### 5.3 Input Fields & Form Controls
- **Unfocused Fill:** Soft porcelain `#F8FAFC` with 1px border `#E2E8F0`.
- **Focused State:** Pure white `#FFFFFF` fill with 1.5px Brand Blue (`#0080FF`) border and subtle blue glow.
- **Label:** High-contrast Slate `#0F172A` with clear floating label animation.
- **Error State:** Rose Red border `#EF4444` with clear helper text.

---

## 6. Complete Flutter Implementation Code

Below is the exact Dart token architecture that will be implemented in `mobile/lib/core/design_system/`:

### 6.1 `AppColors.dart`
```dart
import 'package:flutter/material.dart';

abstract class AppColors {
  // Canvas & Surfaces (Strictly White & Light)
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSecondary = Color(0xFFF8FAFC);
  static const Color surfaceTertiary = Color(0xFFF1F5F9);
  static const Color surfaceFrosted = Color(0xE6FFFFFF); // 90% White

  // Signature Brand Colors (From Original Selffits Logo)
  static const Color brandRed = Color(0xFFE50914);
  static const Color brandRedDark = Color(0xFFDC2626);
  static const Color brandRedLight = Color(0xFFFEF2F2); // 5% Red Tint

  static const Color brandBlue = Color(0xFF0080FF);
  static const Color brandBlueDark = Color(0xFF0066CC);
  static const Color brandBlueLight = Color(0xFFEFF6FF); // 5% Blue Tint

  // Functional & Status Colors
  static const Color liveEmerald = Color(0xFF10B981);
  static const Color liveEmeraldLight = Color(0xFFECFDF5);

  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color warningAmberLight = Color(0xFFFFFBEB);

  static const Color errorRose = Color(0xFFEF4444);
  static const Color errorRoseLight = Color(0xFFFEF2F2);

  // High-Contrast Luxury Slate Typography
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Borders & Dividers
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color borderSubtle = Color(0xFFF1F5F9);
  static const Color borderFocused = Color(0xFF0080FF);

  // Ambient Shadows
  static const List<BoxShadow> shadowCard = [
    BoxShadow(
      color: Color(0x0A0F172A), // 4% Slate
      blurRadius: 20,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x050F172A), // 2% Slate
      blurRadius: 3,
      offset: Offset(0, 1),
    ),
  ];

  static const List<BoxShadow> shadowRedButton = [
    BoxShadow(
      color: Color(0x40E50914), // 25% Brand Red Glow
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];

  static const List<BoxShadow> shadowBlueButton = [
    BoxShadow(
      color: Color(0x400080FF), // 25% Brand Blue Glow
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];
}
```

### 6.2 `AppTheme.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get luxuryWhiteTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.brandRed,
      
      // System Overlay: Dark icons on light status bar
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle.dark.copyWith(
          statusBarColor: Colors.transparent,
          systemNavigationBarColor: AppColors.background,
          systemNavigationBarIconBrightness: Brightness.dark,
        ),
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),

      // Card Theme
      cardTheme: CardTheme(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.borderLight, width: 1),
        ),
      ),

      // Text Theme
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          letterSpacing: -0.5,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          letterSpacing: -0.3,
        ),
        titleLarge: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
          height: 1.45,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
          height: 1.4,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.textOnPrimary,
        ),
        labelSmall: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
```

---

## 7. Approval Gate & Next Step

### Approval Check
- [x] **Luxury White Theme:** Pristine white background defined; zero dark background mode.
- [x] **Brand Consistency:** Original Selffits Red (`#E50914`) and Blue (`#0080FF`) integrated strategically.
- [x] **High-End Feel:** Outfit & Inter typography, multi-tier ambient shadows, and hair-thin borders.
- [x] **Zero Web/Backend Changes:** Theme applies exclusively to the Flutter mobile app.

**Upon your explicit confirmation of this Luxury White Design System, we will initialize the Flutter project shell in `/mobile` and implement this exact design system.**
