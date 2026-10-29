import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/presentation/student_login_screen.dart';
import 'package:selffits_mobile/features/onboarding/presentation/onboarding_screen.dart';
import 'package:selffits_mobile/features/public/presentation/account_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_home_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';
import 'package:selffits_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('SELFFITS Runtime Device Test Suite (Interactive Schedule Builder)', () {
    testWidgets('Full Interactive Schedule Builder Runtime Verification', (
      WidgetTester tester,
    ) async {
      // Step 1: Clear hardware storage to guarantee clean fresh install state
      final secureStorage = FlutterSecureStorageService();
      await secureStorage.clearSession();
      await secureStorage.setCompletedOnboarding(false);

      // Launch real application
      app.main();
      await tester.pumpAndSettle();

      // Flow 1: Fresh install renders 3-slide onboarding
      expect(find.byType(OnboardingScreen), findsOneWidget);
      expect(find.text('Welcome to SELFFITS'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
      expect(find.text('Next'), findsOneWidget);

      // Advance to Slide 2
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle(const Duration(milliseconds: 600));

      expect(find.text('Live Classes & Coaching'), findsOneWidget);
      expect(find.text('Next'), findsOneWidget);

      // Advance to Slide 3
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle(const Duration(milliseconds: 600));

      expect(find.text('Start Your Training Journey'), findsOneWidget);
      expect(find.text('Get Started'), findsOneWidget);

      // Flow 2: Complete onboarding and transition to Home
      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Flow 3: Verify two-tab navigation shell
      expect(find.byType(PublicMainShell), findsOneWidget);
      expect(find.byType(PublicHomeScreen), findsOneWidget);

      final bottomNavFinder = find.byType(BottomNavigationBar);
      expect(bottomNavFinder, findsOneWidget);
      final BottomNavigationBar bottomNav = tester.widget(bottomNavFinder);
      expect(bottomNav.items.length, 2);
      expect(bottomNav.items[0].label, 'Home');
      expect(bottomNav.items[1].label, 'Account');

      // Wait for live catalog data from backend API
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Flow 4: Verify Header Banner and Control Dock
      expect(find.text('Explore Programs & Weekly Schedule'), findsOneWidget);
      expect(find.text('ACADEMY SCHEDULE BUILDER'), findsOneWidget);
      expect(find.text('Mixed Martial Arts'), findsWidgets);
      expect(find.text('Fitness & Weight'), findsOneWidget);

      // Verify Audience Groups
      expect(find.text('Kids'), findsOneWidget);
      expect(find.text('Adults Mix'), findsOneWidget);
      expect(find.text('Ladies Only'), findsOneWidget);

      // Flow 5: Step 1 - Weekly Training Frequency & Authoritative Prices
      expect(find.text('Select Weekly Training Frequency'), findsOneWidget);
      expect(find.text('1 Day'), findsOneWidget);
      expect(find.text('\$25'), findsWidgets);
      expect(find.text('MOST POPULAR'), findsOneWidget);
      expect(find.text('BEST VALUE'), findsOneWidget);

      // Tap 3 Days / Week
      final threeDaysPlan = find.text('3 Days');
      await tester.tap(threeDaysPlan);
      await tester.pumpAndSettle();

      // Flow 6: Step 2 - Training Days & Rest-Day Restrictions
      await tester.scrollUntilVisible(
        find.text('Tuesday'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('REST DAY'), findsWidgets);
      expect(find.text('Tuesday'), findsOneWidget);
      expect(find.text('Friday'), findsOneWidget);

      // Tapping Rest Day (Tuesday) must not select it
      await tester.tap(find.text('Tuesday'), warnIfMissed: false);
      await tester.pumpAndSettle();

      // Tap Monday and Wednesday to complete selection
      await tester.tap(find.text('Monday'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Wednesday'));
      await tester.pumpAndSettle();

      // Flow 7: Step 3 - Class Batch Timing
      await tester.scrollUntilVisible(
        find.text('Select Batch Timing (GMT UTC+0)'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('1st Batch'), findsOneWidget);
      expect(find.text('2nd Batch'), findsOneWidget);

      // Tap 2nd Batch
      await tester.tap(find.text('2nd Batch'));
      await tester.pumpAndSettle();

      // Flow 8: Step 4 - Curriculum Accordion
      final curriculumFinder = find.textContaining('Curriculum Syllabus');
      await tester.scrollUntilVisible(
        curriculumFinder,
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(curriculumFinder, findsOneWidget);
      await tester.tap(curriculumFinder);
      await tester.pumpAndSettle();

      // Flow 9: Step 5 - Optional Diet & Nutrition Add-on
      final dietFinder = find.textContaining('Diet & Nutrition Program (Optional)');
      await tester.scrollUntilVisible(
        dietFinder,
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(dietFinder, findsOneWidget);
      expect(find.text('+\$10'), findsOneWidget);

      // Toggle Diet Add-on ON
      await tester.tap(dietFinder);
      await tester.pumpAndSettle();

      // Flow 10: Step 6 - Enrollment Summary & Live Total Price Calculation
      final summaryFinder = find.text('Enrollment Schedule Summary');
      await tester.scrollUntilVisible(
        summaryFinder,
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(summaryFinder, findsOneWidget);
      expect(find.text('AUTO-CALCULATED'), findsOneWidget);

      // Price: 3 Days ($55) + Diet Add-on ($10) = $65
      expect(find.text('Proceed to Enrollment (\$65)'), findsOneWidget);
      expect(find.text('\$65'), findsWidgets);

      // Flow 11: Switch to 5 Days / Week -> auto-selects all 5 active training days
      await tester.scrollUntilVisible(
        find.text('5 Days'),
        -300,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('5 Days'));
      await tester.pumpAndSettle();

      // Price: 5 Days ($85) + Diet Add-on ($10) = $95
      await tester.scrollUntilVisible(
        find.text('Proceed to Enrollment (\$95)'),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Proceed to Enrollment (\$95)'), findsOneWidget);

      // Flow 12: Account tab authentication options
      final accountTab = find.descendant(
        of: find.byType(BottomNavigationBar),
        matching: find.text('Account'),
      );
      await tester.tap(accountTab);
      await tester.pumpAndSettle(const Duration(seconds: 1));

      expect(find.byType(AccountScreen), findsOneWidget);
      expect(find.byType(StudentLoginScreen), findsOneWidget);
      expect(find.text('STUDENT PORTAL'), findsOneWidget);

      // Switch back to Home tab
      final homeTab = find.descendant(
        of: find.byType(BottomNavigationBar),
        matching: find.text('Home'),
      );
      await tester.tap(homeTab);
      await tester.pumpAndSettle(const Duration(seconds: 1));

      expect(find.byType(PublicHomeScreen), findsOneWidget);

      // Onboarding completion persistence
      final hasCompleted = await secureStorage.hasCompletedOnboarding();
      expect(hasCompleted, isTrue);
    });
  });
}
