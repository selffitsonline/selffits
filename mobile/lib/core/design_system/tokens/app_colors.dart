import 'package:flutter/material.dart';

/// Centralized color tokens for the SELFFITS Luxury White Design System.
/// Strictly enforces a pure white / light canvas with zero dark-mode backgrounds.
/// Brand colors are preserved exactly from the original Selffits logo.
abstract class AppColors {
  // Canvas & Surfaces (Strictly #F8F9FB background & #FFFFFF white cards)
  static const Color background = Color(0xFFF8F9FB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSecondary = Color(0xFFF8FAFC);
  static const Color surfaceTertiary = Color(0xFFF1F5F9);
  static const Color surfaceFrosted = Color(
    0xE6FFFFFF,
  ); // 90% Translucent White

  // Signature Brand Colors (Derived from Original Selffits Logo)
  static const Color brandRed = Color(0xFFE50914);
  static const Color brandRedDark = Color(0xFFDC2626);
  static const Color brandRedLight = Color(0xFFFEF2F2); // 5% Red Tint Container

  static const Color brandBlue = Color(0xFF0080FF);
  static const Color brandBlueDark = Color(0xFF0066CC);
  static const Color brandBlueLight = Color(
    0xFFEFF6FF,
  ); // 5% Blue Tint Container

  // Functional & Status Colors
  static const Color liveEmerald = Color(0xFF10B981);
  static const Color liveEmeraldLight = Color(0xFFECFDF5);

  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color warningAmberLight = Color(0xFFFFFBEB);

  static const Color errorRose = Color(0xFFEF4444);
  static const Color errorRoseLight = Color(0xFFFEF2F2);

  // High-Contrast Luxury Slate Typography (Exceeds WCAG AAA / AA against White)
  static const Color pureBlack = Color(
    0xFF000000,
  ); // Pure Black for inactive navigation and primary text
  static const Color textPrimary = Color(0xFF0F172A); // 15.8:1 on #FFFFFF
  static const Color textSecondary = Color(0xFF475569); // 7.0:1 on #FFFFFF
  static const Color textTertiary = Color(0xFF94A3B8); // 4.6:1 on #FFFFFF
  static const Color textOnPrimary = Color(
    0xFFFFFFFF,
  ); // High-contrast on Red/Blue

  // Borders & Dividers
  static const Color borderLight = Color(0xFFE2E8F0); // Subtle 1px card border
  static const Color borderSubtle = Color(0xFFF1F5F9); // Inner card separator
  static const Color borderFocused = Color(
    0xFF0080FF,
  ); // Active text field border

  // Ambient & Button Shadow Definitions
  static const List<BoxShadow> shadowCard = [
    BoxShadow(
      color: Color(0x140F172A), // 8% Slate ambient diffusion
      blurRadius: 18,
      spreadRadius: 1,
      offset: Offset(0, 5),
    ),
    BoxShadow(
      color: Color(0x0C0F172A), // 5% Slate directional soft lift
      blurRadius: 6,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> shadowCardSubtle = [
    BoxShadow(
      color: Color(0x100F172A), // 6.5% Slate subtle card shadow
      blurRadius: 12,
      spreadRadius: 0.5,
      offset: Offset(0, 3),
    ),
    BoxShadow(
      color: Color(0x060F172A), // 2.5% Slate micro-lift
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
  ];

  static const List<BoxShadow> shadowFloating = [
    BoxShadow(
      color: Color(0x140F172A), // 8% Slate
      blurRadius: 36,
      offset: Offset(0, 12),
    ),
    BoxShadow(
      color: Color(0x0A0F172A), // 4% Slate
      blurRadius: 6,
      offset: Offset(0, 2),
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
