import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/presentation/foundation_showcase_screen.dart';

void main() {
  setUpAll(() {
    // Disable HTTP runtime fetching during automated widget tests
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('SELFFITS Luxury White Design Tokens Test', () {
    test('Strict white background and logo brand colors validation', () {
      // Rule: Canvas must strictly be #F8F9FB and cards white (#FFFFFF)
      expect(AppColors.background, const Color(0xFFF8F9FB));
      expect(AppColors.surface, const Color(0xFFFFFFFF));
      expect(AppColors.surfaceSecondary, const Color(0xFFF8FAFC));

      // Brand colors from original logo
      expect(AppColors.brandRed, const Color(0xFFE50914));
      expect(AppColors.brandRedDark, const Color(0xFFDC2626));
      expect(AppColors.brandBlue, const Color(0xFF0080FF));
      expect(AppColors.brandBlueDark, const Color(0xFF0066CC));

      // Functional accents
      expect(AppColors.liveEmerald, const Color(0xFF10B981));
      expect(AppColors.textPrimary, const Color(0xFF0F172A));
      expect(AppColors.borderLight, const Color(0xFFE2E8F0));
    });

    test('Spacing and radii token grid validation', () {
      expect(AppSpacing.xxs, 4.0);
      expect(AppSpacing.xs, 8.0);
      expect(AppSpacing.sm, 12.0);
      expect(AppSpacing.md, 16.0);
      expect(AppSpacing.lg, 20.0);
      expect(AppSpacing.xl, 24.0);
      expect(AppSpacing.xxl, 32.0);

      expect(AppRadii.sm, 8.0);
      expect(AppRadii.md, 14.0);
      expect(AppRadii.lg, 20.0);
      expect(AppRadii.pill, 999.0);
    });

    testWidgets(
      'Luxury White Theme enforces light mode and pure white scaffold',
      (WidgetTester tester) async {
        final theme = AppTheme.luxuryWhiteTheme;
        expect(theme.brightness, Brightness.light);
        expect(theme.scaffoldBackgroundColor, AppColors.background);
        expect(theme.primaryColor, AppColors.brandRed);
        expect(theme.colorScheme.primary, AppColors.brandRed);
        expect(theme.colorScheme.secondary, AppColors.brandBlue);
        expect(theme.useMaterial3, true);
      },
    );
  });

  group('Foundation UI Components Widget Tests', () {
    testWidgets('AppButton renders label and triggers callback on tap', (
      WidgetTester tester,
    ) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: Scaffold(
            body: AppButton(
              label: 'Enroll Now',
              variant: AppButtonVariant.primaryRed,
              onPressed: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Enroll Now'), findsOneWidget);
      await tester.tap(find.text('Enroll Now'));
      await tester.pump(const Duration(milliseconds: 150));

      expect(tapped, isTrue);
    });

    testWidgets('AppButton shows loading spinner when isLoading is true', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: Scaffold(
            body: AppButton(
              label: 'Processing',
              isLoading: true,
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('AppCard renders child and honors background and padding', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: const Scaffold(
            body: AppCard(child: Text('Card Content Inside')),
          ),
        ),
      );

      expect(find.text('Card Content Inside'), findsOneWidget);
      expect(find.byType(AppCard), findsOneWidget);
    });

    testWidgets('AppTextField enters text and updates controller', (
      WidgetTester tester,
    ) async {
      final controller = TextEditingController();

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: Scaffold(
            body: AppTextField(
              label: 'Email',
              hintText: 'Enter your email',
              controller: controller,
            ),
          ),
        ),
      );

      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Enter your email'), findsOneWidget);

      await tester.enterText(find.byType(TextFormField), 'test@selffits.com');
      await tester.pump();

      expect(controller.text, 'test@selffits.com');
    });

    testWidgets('StatusBadge displays uppercase label with correct variant', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: const Scaffold(
            body: Column(
              children: [
                StatusBadge(label: 'Live', variant: StatusBadgeVariant.live),
                StatusBadge(
                  label: 'Batch SF-1',
                  variant: StatusBadgeVariant.batch,
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('LIVE'), findsOneWidget);
      expect(find.text('BATCH SF-1'), findsOneWidget);
    });

    testWidgets('FoundationShowcaseScreen renders successfully', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: const FoundationShowcaseScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Design System Foundation'), findsOneWidget);
      expect(find.text('JOIN LIVE CLASS (GOOGLE MEET)'), findsOneWidget);
      expect(find.text('Adults Karate — 1st Batch'), findsOneWidget);
    });
  });
}
