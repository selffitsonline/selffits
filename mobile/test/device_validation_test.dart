import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/models/auth_state.dart';
import 'package:selffits_mobile/features/auth/models/auth_user.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/auth/repositories/auth_repository.dart';
import 'package:selffits_mobile/features/student/models/student_dashboard_data.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';
import 'package:selffits_mobile/features/student/providers/student_dashboard_provider.dart';
import 'package:selffits_mobile/features/student/repositories/student_repository.dart';
import 'package:selffits_mobile/features/student/utils/class_status_calculator.dart';

class TestHttpClient extends http.BaseClient {
  final Future<http.Response> Function(http.BaseRequest request) handler;

  TestHttpClient(this.handler);

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

  group('Module 4: Student Attendance & Timezone Calculations', () {
    test(
      'StudentEnrollmentSummary computes attendance progress accurately',
      () {
        const summary = StudentEnrollmentSummary(
          id: 'enr-101',
          programTitle: 'Karate Champions',
          remainingClasses: 18,
          totalClasses: 30,
          expiryDate: 'Nov 30, 2026',
          daysRemaining: 45,
          status: 'ACTIVE',
        );

        expect(summary.completedClasses, 12);
        expect(summary.progressFraction, closeTo(0.40, 0.001));
        expect(summary.progressPercentage, 40);
      },
    );

    test('StudentEnrollmentSummary handles zero total classes safely', () {
      const summary = StudentEnrollmentSummary(
        id: 'enr-102',
        programTitle: 'Intro Trial',
        remainingClasses: 0,
        totalClasses: 0,
        expiryDate: 'Expired',
        daysRemaining: 0,
        status: 'EXPIRED',
      );

      expect(summary.completedClasses, 0);
      expect(summary.progressFraction, 0.0);
      expect(summary.progressPercentage, 0);
    });

    test(
      'ClassStatusCalculator.formatLocalTime converts GMT timing string to local time',
      () {
        final localTime = ClassStatusCalculator.formatLocalTime(
          '05:15 PM to 06:00 PM (GMT)',
          referenceDate: DateTime.utc(2026, 10, 16, 12, 0),
        );

        expect(localTime, isNotNull);
        expect(localTime, contains('(Your Local Time)'));
        expect(localTime, contains('to'));
      },
    );

    test(
      'ClassStatusCalculator.formatLocalTime returns null on invalid schedule string',
      () {
        final invalid = ClassStatusCalculator.formatLocalTime(
          'Flexible Hours / On Demand',
        );
        expect(invalid, isNull);
      },
    );
  });

  group('Module 4: Student UI Features & State Validation', () {
    testWidgets(
      'Displays course attendance progress bar with percentage and class ratio',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'token-m4-1',
          userId: 'student-m4-1',
          email: 'student@selffits.com',
          name: 'Aarav Sharma',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-m4-1',
                  'name': 'Aarav Sharma',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                },
                'isEnrolled': true,
                'unreadNotificationsCount': 2,
                'enrollment': {
                  'id': 'enr-m4-1',
                  'programTitle': 'Kickboxing — Evening Burn',
                  'tierName': 'Black Belt Pro',
                  'remainingClasses': 10,
                  'totalClasses': 25,
                  'expiryDate': 'Dec 15, 2026',
                  'daysRemaining': 60,
                  'status': 'ACTIVE',
                },
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': true,
                  'batchId': 'b-m4-1',
                  'batchName': 'Kickboxing Warriors',
                  'batchCode': 'KB-M4',
                  'programTitle': 'Kickboxing — Evening Burn',
                  'timing': '05:15 PM to 06:00 PM (GMT)',
                  'meetingUrl': 'https://meet.google.com/xyz-uvw-rst',
                  'nextSession': {
                    'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                    'nextClassFullDate': 'Friday, Oct 16, 2026',
                    'dayCombination': 'Mon, Wed, Fri',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'secondsUntilStart': 1200,
                    'isStartingSoon': true,
                    'isLiveNow': false,
                    'isCompletedToday': false,
                  },
                },
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final testApiClient = ApiClient(httpClient: mockClient);
        final testStudentRepo = StudentRepository(
          apiClient: testApiClient,
          secureStorage: mockStorage,
        );

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(mockStorage),
              apiClientProvider.overrideWithValue(testApiClient),
              studentRepositoryProvider.overrideWithValue(testStudentRepo),
              authProvider.overrideWith(
                (ref) =>
                    AuthNotifier(
                        AuthRepository(
                          apiClient: testApiClient,
                          secureStorage: mockStorage,
                        ),
                      )
                      ..state = AuthState.authenticated(
                        user: const AuthUser(
                          id: 'student-m4-1',
                          name: 'Aarav Sharma',
                          email: 'student@selffits.com',
                          role: 'STUDENT',
                        ),
                        accessToken: 'token-m4-1',
                      ),
              ),
            ],
            child: MaterialApp(
              theme: AppTheme.luxuryWhiteTheme,
              home: const StudentHomeScreen(),
            ),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        await tester.pump(const Duration(milliseconds: 300));

        // 1. Unread notifications badge
        expect(find.text('2 updates'), findsOneWidget);

        // 2. Attendance Progress Bar
        expect(find.text('Course Attendance Progress'), findsOneWidget);
        // 25 - 10 = 15 completed, 15/25 = 60%
        expect(find.text('15 of 25 (60%)'), findsOneWidget);

        // 3. Dual Timezone Display (Your Local Time)
        expect(find.textContaining('(Your Local Time)'), findsOneWidget);
      },
    );

    testWidgets(
      'Displays un-enrolled empty state when student has no active enrollment',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'token-m4-unenrolled',
          userId: 'student-m4-unenrolled',
          email: 'new@selffits.com',
          name: 'Neha Gupta',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-m4-unenrolled',
                  'name': 'Neha Gupta',
                  'email': 'new@selffits.com',
                  'role': 'STUDENT',
                },
                'isEnrolled': false,
                'unreadNotificationsCount': 0,
                'enrollment': null,
                'classReadiness': {
                  'hasBatch': false,
                  'isReady': false,
                  'nextSession': {
                    'clockTiming': 'Schedule Pending',
                    'nextClassFullDate': 'Enrollment Required',
                    'dayCombination': 'Contact Sensei',
                    'secondsUntilStart': 0,
                    'isStartingSoon': false,
                    'isLiveNow': false,
                    'isCompletedToday': false,
                  },
                },
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final testApiClient = ApiClient(httpClient: mockClient);
        final testStudentRepo = StudentRepository(
          apiClient: testApiClient,
          secureStorage: mockStorage,
        );

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(mockStorage),
              apiClientProvider.overrideWithValue(testApiClient),
              studentRepositoryProvider.overrideWithValue(testStudentRepo),
              authProvider.overrideWith(
                (ref) =>
                    AuthNotifier(
                        AuthRepository(
                          apiClient: testApiClient,
                          secureStorage: mockStorage,
                        ),
                      )
                      ..state = AuthState.authenticated(
                        user: const AuthUser(
                          id: 'student-m4-unenrolled',
                          name: 'Neha Gupta',
                          email: 'new@selffits.com',
                          role: 'STUDENT',
                        ),
                        accessToken: 'token-m4-unenrolled',
                      ),
              ),
            ],
            child: MaterialApp(
              theme: AppTheme.luxuryWhiteTheme,
              home: const StudentHomeScreen(),
            ),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        await tester.pump(const Duration(milliseconds: 300));

        // Un-enrolled specific cards
        expect(find.text('NO ACTIVE MEMBERSHIP'), findsOneWidget);
        expect(find.text('No Active Martial Arts Enrollment'), findsOneWidget);
        expect(find.text('MEMBERSHIP STATUS'), findsOneWidget);
        expect(
          find.textContaining('Visit selffits.com on web to view programs'),
          findsOneWidget,
        );

        // Class hero section should NOT be rendered
        expect(find.text('YOUR UPCOMING CLASS'), findsNothing);
      },
    );
  });

  group('Module 4: Multi-Device Screen Viewport Validation', () {
    Widget createTestApp(
      ApiClient client,
      InMemorySecureStorageService storage, {
      TextScaler? textScaler,
    }) {
      return ProviderScope(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          apiClientProvider.overrideWithValue(client),
          studentRepositoryProvider.overrideWithValue(
            StudentRepository(apiClient: client, secureStorage: storage),
          ),
          authProvider.overrideWith(
            (ref) =>
                AuthNotifier(
                    AuthRepository(apiClient: client, secureStorage: storage),
                  )
                  ..state = AuthState.authenticated(
                    user: const AuthUser(
                      id: 'student-device-test',
                      name: 'Sensei Student',
                      email: 'test@selffits.com',
                      role: 'STUDENT',
                    ),
                    accessToken: 'token-device-test',
                  ),
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          builder: (context, child) {
            if (textScaler != null) {
              return MediaQuery(
                data: MediaQuery.of(context).copyWith(textScaler: textScaler),
                child: child!,
              );
            }
            return child!;
          },
          home: const StudentHomeScreen(),
        ),
      );
    }

    Future<InMemorySecureStorageService> createAuthenticatedStorage() async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'token-device-test',
        userId: 'student-device-test',
        email: 'test@selffits.com',
        name: 'Sensei Student',
        role: 'STUDENT',
      );
      return storage;
    }

    final standardMockClient = TestHttpClient((request) async {
      return http.Response(
        jsonEncode({
          'success': true,
          'data': {
            'user': {
              'id': 'student-device-test',
              'name': 'Sensei Student',
              'email': 'test@selffits.com',
              'role': 'STUDENT',
            },
            'isEnrolled': true,
            'unreadNotificationsCount': 1,
            'enrollment': {
              'id': 'enr-dev-1',
              'programTitle': 'Karate Champions',
              'tierName': 'Black Belt Pro',
              'remainingClasses': 12,
              'totalClasses': 24,
              'expiryDate': 'Dec 31, 2026',
              'daysRemaining': 75,
              'status': 'ACTIVE',
            },
            'classReadiness': {
              'hasBatch': true,
              'isReady': true,
              'batchName': 'Elite Warriors Batch',
              'batchCode': 'KC-E1',
              'programTitle': 'Karate Champions',
              'timing': '05:15 PM to 06:00 PM (GMT)',
              'meetingUrl': 'https://meet.google.com/abc-defg-hij',
              'coachName': 'Sujith John',
              'coachRank': '4th Dan Black Belt',
              'nextSession': {
                'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                'nextClassFullDate': 'Friday, Oct 16, 2026',
                'dayCombination': 'Mon, Wed, Fri',
                'relativeLabel': 'Today',
                'isToday': true,
                'secondsUntilStart': 600,
                'isStartingSoon': true,
                'isLiveNow': false,
                'isCompletedToday': false,
              },
            },
          },
        }),
        200,
        headers: {'content-type': 'application/json'},
      );
    });

    testWidgets(
      'Validates Compact Phone (360 x 640 dp) without layout overflow',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(360, 640);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = await createAuthenticatedStorage();
        await tester.pumpWidget(
          createTestApp(ApiClient(httpClient: standardMockClient), storage),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Header and cards render cleanly
        expect(find.text('Sensei Student'), findsOneWidget);
        expect(find.text('Elite Warriors Batch'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'Validates Modern Standard Phone (390 x 844 dp) without layout overflow',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(390, 844);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = await createAuthenticatedStorage();
        await tester.pumpWidget(
          createTestApp(ApiClient(httpClient: standardMockClient), storage),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Sensei Student'), findsOneWidget);
        expect(find.text('Elite Warriors Batch'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'Validates Large Phone (412 x 915 dp) without layout overflow',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(412, 915);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = await createAuthenticatedStorage();
        await tester.pumpWidget(
          createTestApp(ApiClient(httpClient: standardMockClient), storage),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Sensei Student'), findsOneWidget);
        expect(find.text('Elite Warriors Batch'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets('Validates Tablet (800 x 1280 dp) without layout overflow', (
      WidgetTester tester,
    ) async {
      tester.view.physicalSize = const Size(800, 1280);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final storage = await createAuthenticatedStorage();
      await tester.pumpWidget(
        createTestApp(ApiClient(httpClient: standardMockClient), storage),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Sensei Student'), findsOneWidget);
      expect(find.text('Elite Warriors Batch'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
      'Validates Accessibility Text Scale Factor (1.3x) without layout crash',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(390, 844);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = await createAuthenticatedStorage();
        await tester.pumpWidget(
          createTestApp(
            ApiClient(httpClient: standardMockClient),
            storage,
            textScaler: const TextScaler.linear(1.3),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Sensei Student'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );
  });

  group('Module 4: Luxury White Theme & Accessibility Consistency', () {
    testWidgets(
      'Verifies Luxury White theme enforcement on Scaffold and AppBar',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1200);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = InMemorySecureStorageService();
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'st-theme',
                  'name': 'Theme Student',
                  'email': 'theme@selffits.com',
                  'role': 'STUDENT',
                },
                'isEnrolled': false,
                'unreadNotificationsCount': 0,
                'enrollment': null,
                'classReadiness': {
                  'hasBatch': false,
                  'isReady': false,
                  'nextSession': {
                    'clockTiming': 'Schedule Pending',
                    'nextClassFullDate': 'Enrollment Required',
                    'dayCombination': 'Contact Sensei',
                    'secondsUntilStart': 0,
                    'isStartingSoon': false,
                    'isLiveNow': false,
                    'isCompletedToday': false,
                  },
                },
              },
            }),
            200,
          );
        });

        final client = ApiClient(httpClient: mockClient);
        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(storage),
              apiClientProvider.overrideWithValue(client),
              studentRepositoryProvider.overrideWithValue(
                StudentRepository(apiClient: client, secureStorage: storage),
              ),
              authProvider.overrideWith(
                (ref) =>
                    AuthNotifier(
                        AuthRepository(
                          apiClient: client,
                          secureStorage: storage,
                        ),
                      )
                      ..state = AuthState.authenticated(
                        user: const AuthUser(
                          id: 'st-theme',
                          name: 'Theme Student',
                          email: 'theme@selffits.com',
                          role: 'STUDENT',
                        ),
                        accessToken: 'token-theme',
                      ),
              ),
            ],
            child: MaterialApp(
              theme: AppTheme.luxuryWhiteTheme,
              home: const StudentHomeScreen(),
            ),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
        expect(scaffold.backgroundColor, AppColors.background);
        expect(AppColors.background, const Color(0xFFF8F9FB));
      },
    );
  });
}
