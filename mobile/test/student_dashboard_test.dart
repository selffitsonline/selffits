import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_exceptions.dart';
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

  group('Module 3: ClassStatusCalculator Unit Tests', () {
    test(
      'Unassigned batch evaluates to unassigned status with inactive button',
      () {
        const readiness = StudentClassReadiness(
          hasBatch: false,
          isReady: false,
          nextSession: StudentScheduleSession(
            nextClassDay: 'TBD',
            nextClassDate: 'Upcoming',
            nextClassFullDate: 'Upcoming Class',
            relativeLabel: 'Upcoming',
            isToday: false,
            clockTiming: '05:00 PM to 06:00 PM (GMT)',
            timeSlot: 'Evening',
            dayCombination: 'Weekly Schedule',
          ),
        );

        final result = ClassStatusCalculator.evaluate(readiness);
        expect(result.status, ClassLiveStatus.unassigned);
        expect(result.badgeLabel, 'Batch Pending');
        expect(result.isJoinButtonActive, isFalse);
      },
    );

    test('Inactive or cancelled batch evaluates to cancelled status', () {
      const readiness = StudentClassReadiness(
        hasBatch: true,
        isReady: false,
        batchStatus: 'CANCELLED',
        nextSession: StudentScheduleSession(
          nextClassDay: 'Today',
          nextClassDate: 'Oct 16, 2026',
          nextClassFullDate: 'Friday, Oct 16, 2026',
          relativeLabel: 'Today',
          isToday: true,
          clockTiming: '05:15 PM to 06:00 PM (GMT)',
          timeSlot: 'Evening',
          dayCombination: 'Sunday & Wednesday',
        ),
      );

      final result = ClassStatusCalculator.evaluate(readiness);
      expect(result.status, ClassLiveStatus.cancelled);
      expect(result.badgeLabel, 'Batch Inactive');
      expect(result.isJoinButtonActive, isFalse);
    });

    test(
      'Class in progress evaluates to LIVE NOW with active red join button',
      () {
        const readiness = StudentClassReadiness(
          hasBatch: true,
          isReady: true,
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          batchStatus: 'ACTIVE',
          nextSession: StudentScheduleSession(
            nextClassDay: 'Today',
            nextClassDate: 'Oct 16, 2026',
            nextClassFullDate: 'Friday, Oct 16, 2026',
            relativeLabel: 'Today',
            isToday: true,
            clockTiming: '05:15 PM to 06:00 PM (GMT)',
            timeSlot: 'Evening',
            dayCombination: 'Sunday & Wednesday',
          ),
        );

        // Reference time: 05:30 PM UTC (during class)
        final duringClassTime = DateTime.utc(2026, 10, 16, 17, 30);
        final result = ClassStatusCalculator.evaluate(
          readiness,
          referenceTime: duringClassTime,
        );

        expect(result.status, ClassLiveStatus.live);
        expect(result.badgeLabel, 'Live Now');
        expect(result.showLivePulse, isTrue);
        expect(result.isJoinButtonActive, isTrue);
      },
    );

    test(
      'Live class button remains disabled when isReady is false even if meetingUrl is present',
      () {
        const readiness = StudentClassReadiness(
          hasBatch: true,
          isReady: false,
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          batchStatus: 'ACTIVE',
          nextSession: StudentScheduleSession(
            nextClassDay: 'Today',
            nextClassDate: 'Oct 16, 2026',
            nextClassFullDate: 'Friday, Oct 16, 2026',
            relativeLabel: 'Today',
            isToday: true,
            clockTiming: '05:15 PM to 06:00 PM (GMT)',
            timeSlot: 'Evening',
            dayCombination: 'Sunday & Wednesday',
          ),
        );

        final duringClassTime = DateTime.utc(2026, 10, 16, 17, 30);
        final result = ClassStatusCalculator.evaluate(
          readiness,
          referenceTime: duringClassTime,
        );

        expect(result.status, ClassLiveStatus.live);
        expect(result.isJoinButtonActive, isFalse);
        expect(result.buttonHint, 'Awaiting Sensei Activation');
      },
    );

    test('Class starting within 30 mins evaluates to startingSoon', () {
      const readiness = StudentClassReadiness(
        hasBatch: true,
        isReady: true,
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        batchStatus: 'ACTIVE',
        nextSession: StudentScheduleSession(
          nextClassDay: 'Today',
          nextClassDate: 'Oct 16, 2026',
          nextClassFullDate: 'Friday, Oct 16, 2026',
          relativeLabel: 'Today',
          isToday: true,
          clockTiming: '05:15 PM to 06:00 PM (GMT)',
          timeSlot: 'Evening',
          dayCombination: 'Sunday & Wednesday',
        ),
      );

      // Reference time: 05:00 PM UTC (15 mins before 05:15 PM start)
      final shortlyBeforeTime = DateTime.utc(2026, 10, 16, 17, 0);
      final result = ClassStatusCalculator.evaluate(
        readiness,
        referenceTime: shortlyBeforeTime,
      );

      expect(result.status, ClassLiveStatus.startingSoon);
      expect(result.badgeLabel.contains('Live in'), isTrue);
      expect(result.isJoinButtonActive, isTrue);
    });

    test(
      'Completed today class evaluates to completedToday with inactive join button',
      () {
        const readiness = StudentClassReadiness(
          hasBatch: true,
          isReady: true,
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          batchStatus: 'ACTIVE',
          nextSession: StudentScheduleSession(
            nextClassDay: 'Today',
            nextClassDate: 'Oct 16, 2026',
            nextClassFullDate: 'Friday, Oct 16, 2026',
            relativeLabel: 'Today',
            isToday: true,
            clockTiming: '05:15 PM to 06:00 PM (GMT)',
            timeSlot: 'Evening',
            dayCombination: 'Sunday & Wednesday',
          ),
        );

        // Reference time: 06:30 PM UTC (after class ended)
        final afterClassTime = DateTime.utc(2026, 10, 16, 18, 30);
        final result = ClassStatusCalculator.evaluate(
          readiness,
          referenceTime: afterClassTime,
        );

        expect(result.status, ClassLiveStatus.completedToday);
        expect(result.badgeLabel, 'Completed Today');
        expect(result.isJoinButtonActive, isFalse);
      },
    );
  });

  group('Module 3: StudentRepository & Provider Tests', () {
    test(
      'getDashboard returns verified StudentDashboardData on 200 OK',
      () async {
        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'valid-student-jwt',
          userId: 'student-1',
          email: 'student@selffits.com',
          name: 'Arjun Sharma',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          expect(request.url.path, '/api/v1/student/dashboard');
          expect(request.headers['authorization'], 'Bearer valid-student-jwt');
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-1',
                  'name': 'Arjun Sharma',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollment': {
                  'id': 'enr-1',
                  'programTitle': 'Adults Karate',
                  'tierName': '3 Days / Week',
                  'remainingClasses': 14,
                  'totalClasses': 24,
                  'expiryDate': 'Dec 31, 2026',
                  'daysRemaining': 75,
                  'status': 'ACTIVE',
                },
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': true,
                  'batchCode': 'SF-B1-2026',
                  'batchName': 'Adults Karate — 1st Batch',
                  'programTitle': 'Adults Karate',
                  'coachName': 'Sensei Sujith John',
                  'coachRank': 'Black Belt 4th Dan',
                  'meetingUrl': 'https://meet.google.com/abc-defg-hij',
                  'capacityLabel': '6 / 8',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 16, 2026',
                    'nextClassFullDate': 'Friday, Oct 16, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                    'timeSlot': 'Evening',
                    'dayCombination': 'Sunday & Wednesday',
                  },
                },
                'unreadNotificationsCount': 2,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = StudentRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final data = await repo.getDashboard();
        expect(data.user.name, 'Arjun Sharma');
        expect(data.isEnrolled, isTrue);
        expect(data.enrollment?.remainingClasses, 14);
        expect(data.classReadiness.hasBatch, isTrue);
        expect(data.classReadiness.coachName, 'Sensei Sujith John');
        expect(data.classReadiness.hasValidMeetingUrl, isTrue);
      },
    );

    test('getDashboard throws TokenExpiredException on 401 response', () async {
      final mockStorage = InMemorySecureStorageService();
      await mockStorage.saveSession(
        token: 'expired-token',
        userId: 'student-1',
        email: 'student@selffits.com',
        name: 'Arjun',
        role: 'STUDENT',
      );

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'error': {
              'code': 'TOKEN_EXPIRED',
              'message': 'Mobile token expired.',
            },
          }),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: mockClient);
      final repo = StudentRepository(
        apiClient: apiClient,
        secureStorage: mockStorage,
      );

      expect(() => repo.getDashboard(), throwsA(isA<TokenExpiredException>()));
    });
  });

  group('Module 3: StudentHomeScreen Widget Tests', () {
    testWidgets(
      'StudentHomeScreen renders live class data, coach info, and metrics',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'widget-test-token',
          userId: 'student-100',
          email: 'student@selffits.com',
          name: 'Priya Patel',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-100',
                  'name': 'Priya Patel',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollment': {
                  'id': 'enr-100',
                  'programTitle': 'Kickboxing Conditioning',
                  'tierName': '5 Days / Week',
                  'remainingClasses': 18,
                  'totalClasses': 30,
                  'expiryDate': 'Nov 30, 2026',
                  'daysRemaining': 45,
                  'status': 'ACTIVE',
                },
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': true,
                  'batchCode': 'KB-B1-2026',
                  'batchName': 'Kickboxing — Evening Burn',
                  'programTitle': 'Kickboxing Conditioning',
                  'coachName': 'Sensei Sujith John',
                  'coachRank': 'Black Belt 4th Dan',
                  'meetingUrl': 'https://meet.google.com/test-meet-url',
                  'capacityLabel': '7 / 10',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 16, 2026',
                    'nextClassFullDate': 'Friday, Oct 16, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                    'timeSlot': 'Evening',
                    'dayCombination': 'Monday to Friday',
                  },
                },
                'unreadNotificationsCount': 0,
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
                          id: 'student-100',
                          name: 'Priya Patel',
                          email: 'student@selffits.com',
                          role: 'STUDENT',
                        ),
                        accessToken: 'widget-test-token',
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

        expect(find.text('Priya Patel'), findsOneWidget);
        expect(find.text('Kickboxing — Evening Burn'), findsOneWidget);
        expect(find.text('KB-B1-2026'), findsOneWidget);
        expect(
          find.text('Sensei Sujith John (Black Belt 4th Dan)'),
          findsOneWidget,
        );
        expect(find.text('7 / 10 Students'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW'), findsOneWidget);
      },
    );

    testWidgets(
      'StudentHomeScreen displays Batch Assignment in Progress when student has no batch',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'token-101',
          userId: 'student-101',
          email: 'rahul@selffits.com',
          name: 'Rahul Nair',
          role: 'STUDENT',
        );
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-101',
                  'name': 'Rahul Nair',
                  'email': 'rahul@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollment': null,
                'classReadiness': {
                  'hasBatch': false,
                  'isReady': false,
                  'nextSession': {
                    'nextClassDay': 'TBD',
                    'nextClassDate': '',
                    'nextClassFullDate': 'Upcoming',
                    'relativeLabel': 'Upcoming',
                    'isToday': false,
                    'clockTiming': '05:00 PM to 06:00 PM (GMT)',
                    'timeSlot': 'Evening',
                    'dayCombination': 'Weekly',
                  },
                },
                'unreadNotificationsCount': 0,
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
                          id: 'student-101',
                          name: 'Rahul Nair',
                          email: 'rahul@selffits.com',
                          role: 'STUDENT',
                        ),
                        accessToken: 'token-101',
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

        expect(find.text('Batch Assignment in Progress'), findsOneWidget);
        expect(find.text('BATCH PENDING'), findsOneWidget);
        expect(find.text('Your Class Is Being Prepared'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW (Not Ready)'), findsOneWidget);
      },
    );
  });
}
