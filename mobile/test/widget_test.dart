import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:selffits_mobile/app.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/onboarding/presentation/onboarding_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  testWidgets(
    'SelffitsApp smoke test boots to OnboardingScreen on first launch',
    (WidgetTester tester) async {
      final mockStorage = InMemorySecureStorageService();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [secureStorageProvider.overrideWithValue(mockStorage)],
          child: const SelffitsApp(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.byType(OnboardingScreen), findsOneWidget);
      expect(find.text('Welcome to SELFFITS'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
    },
  );

  testWidgets(
    'SelffitsApp smoke test boots to PublicMainShell for returning guest',
    (WidgetTester tester) async {
      final mockStorage = InMemorySecureStorageService();
      await mockStorage.setCompletedOnboarding(true);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [secureStorageProvider.overrideWithValue(mockStorage)],
          child: const SelffitsApp(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.byType(PublicMainShell), findsOneWidget);
      expect(find.byType(BottomNavigationBar), findsOneWidget);
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Explore Programs & Weekly Schedule'), findsOneWidget);
    },
  );
}
