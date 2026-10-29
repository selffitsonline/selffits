import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/features/auth/presentation/forgot_password_screen.dart';
import 'package:selffits_mobile/features/auth/presentation/student_login_screen.dart';
import 'package:selffits_mobile/features/auth/presentation/student_registration_screen.dart';

Future<void> _loadFonts() async {
  final iconFile = File(
    '/Users/macbook/development/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
  );
  if (iconFile.existsSync()) {
    final iconLoader = FontLoader('MaterialIcons')
      ..addFont(Future.value(iconFile.readAsBytesSync().buffer.asByteData()));
    await iconLoader.load();
  }

  final regularFile = File('test/Poppins-Regular.ttf');
  final boldFile = File('test/Poppins-Bold.ttf');
  if (regularFile.existsSync() && boldFile.existsSync()) {
    final regularData = regularFile.readAsBytesSync().buffer.asByteData();
    final boldData = boldFile.readAsBytesSync().buffer.asByteData();

    final poppinsLoader = FontLoader('Poppins')
      ..addFont(Future.value(regularData))
      ..addFont(Future.value(boldData));
    await poppinsLoader.load();

    final variants = [
      'Poppins',
      'Poppins_regular',
      'Poppins_100',
      'Poppins_200',
      'Poppins_300',
      'Poppins_400',
      'Poppins_500',
      'Poppins_600',
      'Poppins_700',
      'Poppins_800',
      'Poppins_900',
    ];
    for (final variant in variants) {
      final isBold =
          variant.contains('600') ||
          variant.contains('700') ||
          variant.contains('800') ||
          variant.contains('900');
      final loader = FontLoader(variant)
        ..addFont(Future.value(isBold ? boldData : regularData));
      await loader.load();
    }
  }
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    GoogleFonts.config.allowRuntimeFetching = false;
    await _loadFonts();
    FlutterError.onError = (FlutterErrorDetails details) {
      if (details.exceptionAsString().contains('allowRuntimeFetching') ||
          details.exceptionAsString().contains('font') ||
          details.exceptionAsString().contains('Looking up a deactivated')) {
        return;
      }
      FlutterError.presentError(details);
    };
    ui.PlatformDispatcher.instance.onError = (error, stack) {
      if (error.toString().contains('allowRuntimeFetching') ||
          error.toString().contains('GoogleFonts') ||
          error.toString().contains('font')) {
        return true;
      }
      return false;
    };
  });

  const artifactDir =
      '/Users/macbook/.gemini/antigravity-ide/brain/7d385187-7ec6-48e1-b87e-379c79c3f5b7';
  const mobileDir = '/Users/macbook/Desktop/selffits/mobile';

  Future<void> saveScreenshot(GlobalKey key, String filename) async {
    final boundary =
        key.currentContext!.findRenderObject() as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 2.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final pngBytes = byteData!.buffer.asUint8List();

    File('$mobileDir/$filename').writeAsBytesSync(pngBytes);
    File('$artifactDir/$filename').writeAsBytesSync(pngBytes);
  }

  group('Capture Mobile UI Redesign Screenshots', () {
    testWidgets('1. Capture Student Login Screen', (tester) async {
      tester.view.physicalSize = const Size(400 * 2, 860 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(key: key, child: const StudentLoginScreen()),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_login.png');
      });
    });

    testWidgets('2. Capture Programme Selection Screen', (tester) async {
      tester.view.physicalSize = const Size(400 * 2, 860 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(
              key: key,
              child: const StudentRegistrationScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_programme_selection.png');
      });
    });

    testWidgets('3. Capture Contact Details (Step 1 of 4)', (tester) async {
      tester.view.physicalSize = const Size(400 * 2, 860 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(
              key: key,
              child: const StudentRegistrationScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Proceed to Step 1
      await tester.ensureVisible(find.text('Continue to Questionnaire'));
      await tester.tap(find.text('Continue to Questionnaire'));
      await tester.pumpAndSettle();

      // Enter sample values
      await tester.enterText(find.byType(TextFormField).at(0), 'Arjun Sharma');
      await tester.enterText(
        find.byType(TextFormField).at(1),
        'student@selffits.com',
      );
      await tester.enterText(
        find.byType(TextFormField).at(2),
        '+91 9876543210',
      );
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_contact_details.png');
      });
    });

    testWidgets('4. Capture Student Type (Step 2 of 4)', (tester) async {
      tester.view.physicalSize = const Size(400 * 2, 860 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(
              key: key,
              child: const StudentRegistrationScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Step 0 -> Step 1
      await tester.ensureVisible(find.text('Continue to Questionnaire'));
      await tester.tap(find.text('Continue to Questionnaire'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField).at(0), 'Arjun Sharma');
      await tester.enterText(
        find.byType(TextFormField).at(1),
        'student@selffits.com',
      );
      await tester.enterText(
        find.byType(TextFormField).at(2),
        '+91 9876543210',
      );
      await tester.pumpAndSettle();

      // Step 1 -> Step 2
      await tester.ensureVisible(find.text('Next: Student Type'));
      await tester.tap(find.text('Next: Student Type'));
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_student_type.png');
      });
    });

    testWidgets('5. Capture Programme Questions (Step 3 of 4)', (tester) async {
      tester.view.physicalSize = const Size(400 * 2, 900 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(
              key: key,
              child: const StudentRegistrationScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Step 0 -> 1
      await tester.ensureVisible(find.text('Continue to Questionnaire'));
      await tester.tap(find.text('Continue to Questionnaire'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField).at(0), 'Arjun Sharma');
      await tester.enterText(
        find.byType(TextFormField).at(1),
        'student@selffits.com',
      );
      await tester.enterText(
        find.byType(TextFormField).at(2),
        '+91 9876543210',
      );
      await tester.pumpAndSettle();

      // Step 1 -> 2
      await tester.ensureVisible(find.text('Next: Student Type'));
      await tester.tap(find.text('Next: Student Type'));
      await tester.pumpAndSettle();

      // Step 2 -> 3
      await tester.ensureVisible(find.text('Next: Programme Questions'));
      await tester.tap(find.text('Next: Programme Questions'));
      await tester.pumpAndSettle();

      // Enter weight
      await tester.enterText(find.byType(TextFormField).first, '72.5');
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_programme_questions.png');
      });
    });

    testWidgets('6. Capture Account Security & Review (Step 4 of 4)', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(400 * 2, 1100 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(
              key: key,
              child: const StudentRegistrationScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Step 0 -> 1
      await tester.ensureVisible(find.text('Continue to Questionnaire'));
      await tester.tap(find.text('Continue to Questionnaire'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField).at(0), 'Arjun Sharma');
      await tester.enterText(
        find.byType(TextFormField).at(1),
        'student@selffits.com',
      );
      await tester.enterText(
        find.byType(TextFormField).at(2),
        '+91 9876543210',
      );
      await tester.pumpAndSettle();

      // Step 1 -> 2
      await tester.ensureVisible(find.text('Next: Student Type'));
      await tester.tap(find.text('Next: Student Type'));
      await tester.pumpAndSettle();

      // Step 2 -> 3
      await tester.ensureVisible(find.text('Next: Programme Questions'));
      await tester.tap(find.text('Next: Programme Questions'));
      await tester.pumpAndSettle();

      // Step 3 -> 4
      await tester.ensureVisible(find.text('Next: Account Security'));
      await tester.tap(find.text('Next: Account Security'));
      await tester.pumpAndSettle();

      // Enter sample passwords
      await tester.enterText(find.byType(TextFormField).at(0), 'Password@123');
      await tester.enterText(find.byType(TextFormField).at(1), 'Password@123');
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_password_review.png');
      });
    });

    testWidgets('7. Capture Forgot Password Screen', (tester) async {
      tester.view.physicalSize = const Size(400 * 2, 860 * 2);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final key = GlobalKey();

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            debugShowCheckedModeBanner: false,
            home: RepaintBoundary(
              key: key,
              child: const ForgotPasswordScreen(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byType(TextFormField).first,
        'student@selffits.com',
      );
      await tester.pumpAndSettle();

      await tester.runAsync(() async {
        await saveScreenshot(key, 'screenshot_forgot_password.png');
      });
    });
  });
}
