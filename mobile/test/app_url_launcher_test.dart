import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/core/utils/app_url_launcher.dart';
import 'package:selffits_mobile/features/auth/models/auth_state.dart';
import 'package:selffits_mobile/features/auth/models/auth_user.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/auth/repositories/auth_repository.dart';
import 'package:selffits_mobile/features/coach/presentation/screens/coach_profile_screen.dart';
import 'package:selffits_mobile/features/coach/providers/coach_dashboard_provider.dart';
import 'package:selffits_mobile/features/coach/repositories/coach_repository.dart';
import 'package:selffits_mobile/features/student/presentation/screens/student_profile_screen.dart';
import 'package:selffits_mobile/features/student/providers/student_dashboard_provider.dart';
import 'package:selffits_mobile/features/student/repositories/student_repository.dart';

class MockHttpClient extends http.BaseClient {
  final Future<http.Response> Function(http.BaseRequest request) handler;

  MockHttpClient(this.handler);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final response = await handler(request);
    return http.StreamedResponse(
      Stream.value(response.bodyBytes),
      response.statusCode,
      headers: response.headers,
    );
  }
}

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('AppUrlLauncher URL Classification Tests', () {
    test('isLiveClassMeetingUrl identifies Google Meet, Zoom, and Teams conferences', () {
      expect(
        AppUrlLauncher.isLiveClassMeetingUrl(Uri.parse('https://meet.google.com/abc-defg-hij')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isLiveClassMeetingUrl(Uri.parse('https://us04web.zoom.us/j/123456789')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isLiveClassMeetingUrl(Uri.parse('https://teams.microsoft.com/l/meetup-join/123')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isLiveClassMeetingUrl(Uri.parse('https://selffits.com/privacy')),
        isFalse,
      );
      expect(
        AppUrlLauncher.isLiveClassMeetingUrl(Uri.parse('https://selffits.com/terms')),
        isFalse,
      );
    });

    test('isSystemScheme identifies mailto, tel, and sms schemes', () {
      expect(
        AppUrlLauncher.isSystemScheme(Uri.parse('mailto:admissions@selffits.com')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isSystemScheme(Uri.parse('tel:+1234567890')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isSystemScheme(Uri.parse('sms:+1234567890')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isSystemScheme(Uri.parse('https://selffits.com')),
        isFalse,
      );
    });

    test('isWebUrl correctly identifies informational and legal web pages', () {
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('https://selffits.com')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('https://selffits.com/privacy')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('https://selffits.com/terms')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('https://selffits.com/programs')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('https://selffits.com/dashboard/certificates')),
        isTrue,
      );
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('https://meet.google.com/abc-defg-hij')),
        isFalse, // Classified as live meeting conference
      );
      expect(
        AppUrlLauncher.isWebUrl(Uri.parse('mailto:admissions@selffits.com')),
        isFalse,
      );
    });

    test('resolveLaunchMode assigns inAppBrowserView for web and externalApplication for system/meetings', () {
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('https://selffits.com'),
        equals(LaunchMode.inAppBrowserView),
      );
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('https://selffits.com/privacy'),
        equals(LaunchMode.inAppBrowserView),
      );
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('https://selffits.com/terms'),
        equals(LaunchMode.inAppBrowserView),
      );
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('https://selffits.com/become-coach'),
        equals(LaunchMode.inAppBrowserView),
      );
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('mailto:admissions@selffits.com'),
        equals(LaunchMode.externalApplication),
      );
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('tel:+1234567890'),
        equals(LaunchMode.externalApplication),
      );
      expect(
        AppUrlLauncher.resolveLaunchModeForUrl('https://meet.google.com/xyz-uvwx-rst'),
        equals(LaunchMode.externalApplication),
      );
    });
  });

  group('AppUrlLauncher Execution & Fallback Tests', () {
    test('Launches web URL with inAppBrowserView on primary attempt', () async {
      final List<(Uri, LaunchMode)> calls = [];

      final success = await AppUrlLauncher.launch(
        null,
        'https://selffits.com/privacy',
        launcher: (uri, mode) async {
          calls.add((uri, mode));
          return true;
        },
      );

      expect(success, isTrue);
      expect(calls.length, equals(1));
      expect(calls.first.$1, equals(Uri.parse('https://selffits.com/privacy')));
      expect(calls.first.$2, equals(LaunchMode.inAppBrowserView));
    });

    test('Falls back safely to externalApplication when inAppBrowserView fails', () async {
      final List<(Uri, LaunchMode)> calls = [];

      final success = await AppUrlLauncher.launch(
        null,
        'https://selffits.com/terms',
        launcher: (uri, mode) async {
          calls.add((uri, mode));
          if (mode == LaunchMode.inAppBrowserView) {
            return false; // Simulate Custom Tabs failing to open
          }
          return true; // Fallback succeeds
        },
      );

      expect(success, isTrue);
      expect(calls.length, equals(2));
      expect(calls[0].$2, equals(LaunchMode.inAppBrowserView));
      expect(calls[1].$2, equals(LaunchMode.externalApplication));
    });

    test('Falls back safely to externalApplication when inAppBrowserView throws an exception', () async {
      final List<(Uri, LaunchMode)> calls = [];

      final success = await AppUrlLauncher.launch(
        null,
        'https://selffits.com/terms',
        launcher: (uri, mode) async {
          calls.add((uri, mode));
          if (mode == LaunchMode.inAppBrowserView) {
            throw Exception('ActivityNotFoundException for Custom Tabs');
          }
          return true;
        },
      );

      expect(success, isTrue);
      expect(calls.length, equals(2));
      expect(calls[0].$2, equals(LaunchMode.inAppBrowserView));
      expect(calls[1].$2, equals(LaunchMode.externalApplication));
    });

    test('Directly uses externalApplication for Google Meet classroom links', () async {
      final List<(Uri, LaunchMode)> calls = [];

      final success = await AppUrlLauncher.launch(
        null,
        'https://meet.google.com/test-room',
        launcher: (uri, mode) async {
          calls.add((uri, mode));
          return true;
        },
      );

      expect(success, isTrue);
      expect(calls.length, equals(1));
      expect(calls.first.$1, equals(Uri.parse('https://meet.google.com/test-room')));
      expect(calls.first.$2, equals(LaunchMode.externalApplication));
    });

    test('Directly uses externalApplication for mailto links', () async {
      final List<(Uri, LaunchMode)> calls = [];

      final success = await AppUrlLauncher.launch(
        null,
        'mailto:admissions@selffits.com',
        launcher: (uri, mode) async {
          calls.add((uri, mode));
          return true;
        },
      );

      expect(success, isTrue);
      expect(calls.length, equals(1));
      expect(calls.first.$1, equals(Uri.parse('mailto:admissions@selffits.com')));
      expect(calls.first.$2, equals(LaunchMode.externalApplication));
    });

    test('Returns false gracefully for empty or malformed URLs', () async {
      expect(await AppUrlLauncher.launch(null, ''), isFalse);
      expect(await AppUrlLauncher.launch(null, '   '), isFalse);
    });

    testWidgets('Shows error snackbar when both in-app and external launches fail', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () async {
                    await AppUrlLauncher.launch(
                      context,
                      'https://selffits.com/privacy',
                      fallbackMessage: 'Custom failure message',
                      launcher: (uri, mode) async => false,
                    );
                  },
                  child: const Text('Open'),
                );
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Custom failure message'), findsOneWidget);
    });
  });

  group('Student & Coach Settings Legal Link Parity Tests', () {
    testWidgets('StudentProfileScreen renders both Privacy Policy and Terms & Conditions', (tester) async {
      tester.view.physicalSize = const Size(800, 2000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final mockStorage = InMemorySecureStorageService();
      await mockStorage.saveSession(
        token: 'mock-student-token',
        userId: 'student-101',
        email: 'student@selffits.com',
        name: 'Arjun Verma',
        role: 'STUDENT',
      );

      final client = MockHttpClient((request) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'user': {
                'id': 'student-101',
                'name': 'Arjun Verma',
                'email': 'student@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
              'isEnrolled': false,
              'unreadNotificationsCount': 0,
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: client);
      final studentRepo = StudentRepository(apiClient: apiClient, secureStorage: mockStorage);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            secureStorageProvider.overrideWithValue(mockStorage),
            apiClientProvider.overrideWithValue(apiClient),
            studentRepositoryProvider.overrideWithValue(studentRepo),
            authProvider.overrideWith(
              (ref) => AuthNotifier(
                AuthRepository(apiClient: apiClient, secureStorage: mockStorage),
              )..state = AuthState.authenticated(
                  user: const AuthUser(
                    id: 'student-101',
                    name: 'Arjun Verma',
                    email: 'student@selffits.com',
                    role: 'STUDENT',
                  ),
                  accessToken: 'mock-student-token',
                ),
            ),
          ],
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            home: const StudentProfileScreen(showAppBar: true),
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('SUPPORT & ACADEMY'), findsOneWidget);
      expect(find.text('Official SELFFITS Web Portal'), findsOneWidget);
      expect(find.text('selffits.com'), findsOneWidget);
      expect(find.text('Admissions & Dojo Support'), findsOneWidget);
      expect(find.text('admissions@selffits.com'), findsOneWidget);
      expect(find.text('Privacy Policy'), findsOneWidget);
      expect(find.text('selffits.com/privacy'), findsOneWidget);
      expect(find.text('Terms & Conditions'), findsOneWidget);
      expect(find.text('selffits.com/terms'), findsOneWidget);
    });

    testWidgets('CoachProfileScreen renders both Privacy Policy and Terms & Conditions', (tester) async {
      tester.view.physicalSize = const Size(800, 2000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final mockStorage = InMemorySecureStorageService();
      await mockStorage.saveSession(
        token: 'mock-coach-token',
        userId: 'coach-202',
        email: 'sensei@selffits.com',
        name: 'Sensei Chen',
        role: 'COACH',
      );

      final client = MockHttpClient((request) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'coach': {
                'id': 'coach-202',
                'displayName': 'Sensei Chen',
                'email': 'sensei@selffits.com',
                'highestRank': '4th Dan Black Belt',
                'disciplines': ['Karate', 'Kickboxing'],
              },
              'totalBatchesCount': 2,
              'totalStudentsCount': 10,
              'batches': [],
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: client);
      final coachRepo = CoachRepository(apiClient: apiClient, secureStorage: mockStorage);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            secureStorageProvider.overrideWithValue(mockStorage),
            apiClientProvider.overrideWithValue(apiClient),
            coachRepositoryProvider.overrideWithValue(coachRepo),
            authProvider.overrideWith(
              (ref) => AuthNotifier(
                AuthRepository(apiClient: apiClient, secureStorage: mockStorage),
              )..state = AuthState.authenticated(
                  user: const AuthUser(
                    id: 'coach-202',
                    name: 'Sensei Chen',
                    email: 'sensei@selffits.com',
                    role: 'COACH',
                  ),
                  accessToken: 'mock-coach-token',
                ),
            ),
          ],
          child: MaterialApp(
            theme: AppTheme.luxuryWhiteTheme,
            home: const CoachProfileScreen(),
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('SUPPORT & ACADEMY'), findsOneWidget);
      expect(find.text('Official SELFFITS Web Portal'), findsOneWidget);
      expect(find.text('selffits.com/coach/dashboard'), findsOneWidget);
      expect(find.text('Instructor Support & Dojo Admin'), findsOneWidget);
      expect(find.text('admissions@selffits.com'), findsOneWidget);
      expect(find.text('Privacy Policy'), findsOneWidget);
      expect(find.text('selffits.com/privacy'), findsOneWidget);
      expect(find.text('Terms & Conditions'), findsOneWidget);
      expect(find.text('selffits.com/terms'), findsOneWidget);
    });
  });
}
