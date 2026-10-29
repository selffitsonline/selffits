import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/app.dart';
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_exceptions.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/models/auth_state.dart';
import 'package:selffits_mobile/features/auth/models/auth_user.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/auth/repositories/auth_repository.dart';
import 'package:selffits_mobile/features/coach/models/coach_dashboard_data.dart';
import 'package:selffits_mobile/features/coach/presentation/coach_home_screen.dart';
import 'package:selffits_mobile/features/coach/providers/coach_dashboard_provider.dart';
import 'package:selffits_mobile/features/coach/repositories/coach_repository.dart';
import 'package:selffits_mobile/features/onboarding/presentation/onboarding_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';

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

final Map<String, dynamic> sampleCoachDashboardJson = {
  'coach': {
    'id': 'coach-001',
    'displayName': 'Master Kenji Sato',
    'email': 'kenji@selffits.com',
    'highestRank': '5th Dan Black Belt Shotokan',
    'disciplines': ['Karate', 'Kickboxing', 'Self-Defense'],
  },
  'totalBatchesCount': 2,
  'totalStudentsCount': 18,
  'upcomingClass': {
    'id': 'batch-001',
    'batchId': 'BATCH-KAR-01',
    'name': 'Elite Warriors Batch A',
    'programTitle': 'Karate Champions',
    'dayCombination': 'Monday & Thursday',
    'clockTiming': '05:00 PM to 06:00 PM (GMT)',
    'timeSlot': 'Evening',
    'meetingUrl': 'https://meet.google.com/abc-defg-hij',
    'maxCapacity': 20,
    'studentsCount': 10,
    'status': 'ACTIVE',
    'beltLevel': 'Brown & Black Belt',
    'nextSession': {
      'nextClassDay': 'Today',
      'nextClassDate': 'Oct 16, 2026',
      'nextClassFullDate': 'Friday, Oct 16, 2026',
      'relativeLabel': 'Today',
      'isToday': true,
      'clockTiming': '05:00 PM to 06:00 PM (GMT)',
      'timeSlot': 'Evening',
      'dayCombination': 'Monday & Thursday',
    },
    'students': [
      {
        'id': 'st-1',
        'name': 'Aarav Patel',
        'email': 'aarav@example.com',
        'martialArtsType': 'Karate',
      },
      {
        'id': 'st-2',
        'name': 'Diya Sharma',
        'email': 'diya@example.com',
        'martialArtsType': 'Karate',
      },
    ],
  },
  'batches': [
    {
      'id': 'batch-001',
      'batchId': 'BATCH-KAR-01',
      'name': 'Elite Warriors Batch A',
      'programTitle': 'Karate Champions',
      'dayCombination': 'Monday & Thursday',
      'clockTiming': '05:00 PM to 06:00 PM (GMT)',
      'timeSlot': 'Evening',
      'meetingUrl': 'https://meet.google.com/abc-defg-hij',
      'maxCapacity': 20,
      'studentsCount': 10,
      'status': 'ACTIVE',
      'beltLevel': 'Brown & Black Belt',
      'nextSession': {
        'nextClassDay': 'Today',
        'nextClassDate': 'Oct 16, 2026',
        'nextClassFullDate': 'Friday, Oct 16, 2026',
        'relativeLabel': 'Today',
        'isToday': true,
        'clockTiming': '05:00 PM to 06:00 PM (GMT)',
        'timeSlot': 'Evening',
        'dayCombination': 'Monday & Thursday',
      },
      'students': [
        {
          'id': 'st-1',
          'name': 'Aarav Patel',
          'email': 'aarav@example.com',
          'martialArtsType': 'Karate',
        },
        {
          'id': 'st-2',
          'name': 'Diya Sharma',
          'email': 'diya@example.com',
          'martialArtsType': 'Karate',
        },
      ],
    },
    {
      'id': 'batch-002',
      'batchId': 'BATCH-KICK-02',
      'name': 'Striking Masters Batch B',
      'programTitle': 'Kickboxing Dynamics',
      'dayCombination': 'Tuesday & Friday',
      'clockTiming': '06:30 PM to 07:30 PM (GMT)',
      'timeSlot': 'Night',
      'meetingUrl': 'https://meet.google.com/xyz-uvw-rst',
      'maxCapacity': 15,
      'studentsCount': 8,
      'status': 'ACTIVE',
      'beltLevel': 'All Levels',
      'nextSession': {
        'nextClassDay': 'Tomorrow',
        'nextClassDate': 'Oct 17, 2026',
        'nextClassFullDate': 'Saturday, Oct 17, 2026',
        'relativeLabel': 'Tomorrow',
        'isToday': false,
        'clockTiming': '06:30 PM to 07:30 PM (GMT)',
        'timeSlot': 'Night',
        'dayCombination': 'Tuesday & Friday',
      },
      'students': [
        {
          'id': 'st-3',
          'name': 'Rohan Gupta',
          'email': 'rohan@example.com',
          'martialArtsType': 'Kickboxing',
        },
      ],
    },
  ],
};

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('Module 5: Coach DTO Deserialization Tests', () {
    test('Correctly parses full CoachDashboardData from JSON', () {
      final data = CoachDashboardData.fromJson(sampleCoachDashboardJson);

      expect(data.coach.id, 'coach-001');
      expect(data.coach.displayName, 'Master Kenji Sato');
      expect(data.coach.email, 'kenji@selffits.com');
      expect(data.coach.highestRank, '5th Dan Black Belt Shotokan');
      expect(data.coach.disciplines, ['Karate', 'Kickboxing', 'Self-Defense']);

      expect(data.totalBatchesCount, 2);
      expect(data.totalStudentsCount, 18);

      expect(data.upcomingClass, isNotNull);
      expect(data.upcomingClass!.name, 'Elite Warriors Batch A');
      expect(data.upcomingClass!.hasValidMeetingUrl, isTrue);
      expect(data.upcomingClass!.isFull, isFalse);
      expect(data.upcomingClass!.students.length, 2);
      expect(data.upcomingClass!.students.first.name, 'Aarav Patel');

      expect(data.batches.length, 2);
      expect(data.batches[1].name, 'Striking Masters Batch B');
      expect(data.batches[1].studentsCount, 8);
    });

    test('Handles null upcomingClass and empty batches gracefully', () {
      final emptyJson = {
        'coach': {
          'id': 'coach-002',
          'displayName': 'Sensei Tanaka',
          'email': 'tanaka@selffits.com',
        },
        'totalBatchesCount': 0,
        'totalStudentsCount': 0,
        'upcomingClass': null,
        'batches': [],
      };

      final data = CoachDashboardData.fromJson(emptyJson);

      expect(data.coach.displayName, 'Sensei Tanaka');
      expect(data.coach.highestRank, 'Certified Instructor');
      expect(data.coach.disciplines, isEmpty);
      expect(data.upcomingClass, isNull);
      expect(data.batches, isEmpty);
      expect(data.totalBatchesCount, 0);
      expect(data.totalStudentsCount, 0);
    });

    test('CoachBatchSummary computes capacity and status flags accurately', () {
      final batchJson = {
        'id': 'batch-full',
        'batchId': 'BATCH-FULL',
        'name': 'Full Batch',
        'programTitle': 'Judo Masters',
        'dayCombination': 'Mon/Wed',
        'clockTiming': '04:00 PM (GMT)',
        'timeSlot': 'Evening',
        'maxCapacity': 10,
        'studentsCount': 10,
        'status': 'ACTIVE',
        'nextSession': {
          'nextClassDay': 'Today',
          'nextClassDate': 'Oct 16',
          'nextClassFullDate': 'Oct 16, 2026',
          'relativeLabel': 'Today',
          'isToday': true,
          'clockTiming': '04:00 PM (GMT)',
          'timeSlot': 'Evening',
          'dayCombination': 'Mon/Wed',
        },
        'students': [],
      };

      final batch = CoachBatchSummary.fromJson(batchJson);

      expect(batch.isFull, isTrue);
      expect(batch.isActive, isTrue);
      expect(batch.hasValidMeetingUrl, isFalse);
      expect(batch.students, isEmpty);
    });
  });

  group('Module 5: CoachRepository Unit Tests', () {
    test(
      'getDashboard returns CoachDashboardData on 200 OK with Bearer token',
      () async {
        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'coach-secret-jwt',
          userId: 'coach-001',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        String? capturedAuthHeader;
        final mockClient = TestHttpClient((request) async {
          capturedAuthHeader = request.headers['authorization'];
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = CoachRepository(
          apiClient: apiClient,
          secureStorage: storage,
        );

        final data = await repo.getDashboard();

        expect(capturedAuthHeader, 'Bearer coach-secret-jwt');
        expect(data.coach.displayName, 'Master Kenji Sato');
        expect(data.batches.length, 2);
      },
    );

    test(
      'getDashboard throws TokenExpiredException on 401 Unauthorized',
      () async {
        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'expired-token',
          userId: 'coach-001',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {'code': 'TOKEN_EXPIRED', 'message': 'Session expired.'},
            }),
            401,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = CoachRepository(
          apiClient: apiClient,
          secureStorage: storage,
        );

        expect(
          () async => await repo.getDashboard(),
          throwsA(isA<TokenExpiredException>()),
        );
      },
    );

    test(
      'getDashboard throws ApiException on 403 Forbidden role mismatch',
      () async {
        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'student-token',
          userId: 'student-001',
          email: 'student@selffits.com',
          name: 'Student User',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {'code': 'FORBIDDEN', 'message': 'Requires COACH role.'},
            }),
            403,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = CoachRepository(
          apiClient: apiClient,
          secureStorage: storage,
        );

        expect(
          () async => await repo.getDashboard(),
          throwsA(
            isA<ApiException>().having((e) => e.statusCode, 'statusCode', 403),
          ),
        );
      },
    );

    test(
      'getDashboard throws TokenExpiredException when no token in secure storage',
      () async {
        final storage = InMemorySecureStorageService(); // No session saved
        final apiClient = ApiClient(
          httpClient: TestHttpClient((_) async => http.Response('{}', 200)),
        );
        final repo = CoachRepository(
          apiClient: apiClient,
          secureStorage: storage,
        );

        expect(
          () async => await repo.getDashboard(),
          throwsA(isA<TokenExpiredException>()),
        );
      },
    );
  });

  group('Module 5: CoachDashboardNotifier State Tests', () {
    test(
      'loadDashboard transitions through loading to success state',
      () async {
        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'test-token',
          userId: 'coach-001',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final repo = CoachRepository(
          apiClient: ApiClient(httpClient: mockClient),
          secureStorage: storage,
        );

        final notifier = CoachDashboardNotifier(repo);

        expect(notifier.state.isLoading, isTrue);
        expect(notifier.state.hasData, isFalse);

        await notifier.loadDashboard();

        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.hasData, isTrue);
        expect(notifier.state.data!.coach.displayName, 'Master Kenji Sato');
        expect(notifier.state.errorMessage, isNull);
      },
    );

    test(
      'loadDashboard catches network failure and emits error message',
      () async {
        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'test-token',
          userId: 'coach-001',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Database failure',
              },
            }),
            500,
            headers: {'content-type': 'application/json'},
          );
        });

        final repo = CoachRepository(
          apiClient: ApiClient(httpClient: mockClient),
          secureStorage: storage,
        );

        final notifier = CoachDashboardNotifier(repo);
        await notifier.loadDashboard();

        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.hasData, isFalse);
        expect(notifier.state.errorMessage, isNotNull);
        expect(
          notifier.state.errorMessage!.contains('Database failure'),
          isTrue,
        );
      },
    );
  });

  group('Module 5: CoachHomeScreen Widget & Interaction Tests', () {
    Widget buildTestApp({
      required ISecureStorageService storage,
      required http.Client httpClient,
      AuthUser? user,
    }) {
      final testApiClient = ApiClient(httpClient: httpClient);
      final coachRepo = CoachRepository(
        apiClient: testApiClient,
        secureStorage: storage,
      );

      final authUser =
          user ??
          const AuthUser(
            id: 'coach-001',
            name: 'Master Kenji Sato',
            email: 'kenji@selffits.com',
            role: 'COACH',
          );

      return ProviderScope(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          apiClientProvider.overrideWithValue(testApiClient),
          coachRepositoryProvider.overrideWithValue(coachRepo),
          authProvider.overrideWith(
            (ref) =>
                AuthNotifier(
                    AuthRepository(
                      apiClient: testApiClient,
                      secureStorage: storage,
                    ),
                  )
                  ..state = AuthState.authenticated(
                    user: authUser,
                    accessToken: 'coach-token',
                  ),
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: const CoachHomeScreen(),
        ),
      );
    }

    testWidgets('Renders coach greeting, rank, disciplines, and metrics', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'token',
        userId: 'coach-001',
        email: 'kenji@selffits.com',
        name: 'Master Kenji Sato',
        role: 'COACH',
      );

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      await tester.pumpWidget(
        buildTestApp(storage: storage, httpClient: mockClient),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Master Kenji Sato'), findsOneWidget);
      expect(find.text('5th Dan Black Belt Shotokan'), findsOneWidget);
      expect(find.text('SENSEI VERIFIED'), findsOneWidget);

      // Disciplines
      expect(find.text('Karate'), findsWidgets);
      expect(find.text('Kickboxing'), findsWidgets);

      // Overview Metrics
      expect(find.text('Assigned Batches'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('Active Students'), findsOneWidget);
      expect(find.text('18'), findsOneWidget);

      // Hardware session active banner
      expect(find.text('Sensei Hardware Session Active'), findsOneWidget);
    });

    testWidgets('Renders Hero upcoming class card with Google Meet action', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'token',
        userId: 'coach-001',
        email: 'kenji@selffits.com',
        name: 'Master Kenji Sato',
        role: 'COACH',
      );

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      await tester.pumpWidget(
        buildTestApp(storage: storage, httpClient: mockClient),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('YOUR NEXT CLASS TO CONDUCT'), findsOneWidget);
      expect(
        find.text('Karate Champions — Elite Warriors Batch A'),
        findsWidgets,
      );
      expect(find.text('START LIVE DOJO (GOOGLE MEET)'), findsOneWidget);
    });

    testWidgets('Toggles expandable student roster on batch card', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'token',
        userId: 'coach-001',
        email: 'kenji@selffits.com',
        name: 'Master Kenji Sato',
        role: 'COACH',
      );

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        buildTestApp(storage: storage, httpClient: mockClient),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Students initially hidden
      expect(find.text('Aarav Patel'), findsNothing);
      expect(find.text('View Students'), findsWidgets);

      // Tap View Students on the first batch card
      await tester.tap(find.text('View Students').first);
      await tester.pump();

      // Student roster now visible
      expect(find.text('Aarav Patel'), findsOneWidget);
      expect(find.text('aarav@example.com'), findsOneWidget);
      expect(find.text('Diya Sharma'), findsOneWidget);
      expect(find.text('Hide Students'), findsOneWidget);

      // Tap Hide Students
      await tester.tap(find.text('Hide Students'));
      await tester.pump();

      // Student roster hidden again
      expect(find.text('Aarav Patel'), findsNothing);
      expect(find.text('View Students'), findsWidgets);
    });

    testWidgets('Renders empty state when coach has no assigned batches', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'token',
        userId: 'coach-001',
        email: 'empty@selffits.com',
        name: 'Sensei Empty',
        role: 'COACH',
      );

      final emptyJson = {
        'coach': {
          'id': 'coach-empty',
          'displayName': 'Sensei Empty',
          'email': 'empty@selffits.com',
        },
        'totalBatchesCount': 0,
        'totalStudentsCount': 0,
        'upcomingClass': null,
        'batches': [],
      };

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': emptyJson}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      await tester.pumpWidget(
        buildTestApp(
          storage: storage,
          httpClient: mockClient,
          user: const AuthUser(
            id: 'coach-empty',
            name: 'Sensei Empty',
            email: 'empty@selffits.com',
            role: 'COACH',
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('No Active Training Batches'), findsOneWidget);
      expect(
        find.text(
          'You currently have no batches assigned by the Academy. New training batches will appear here once scheduled by Administration.',
        ),
        findsOneWidget,
      );
    });

    testWidgets(
      'Renders error banner with Retry Connection button on API failure',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'token',
          userId: 'coach-001',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        var callCount = 0;
        final mockClient = TestHttpClient((request) async {
          callCount++;
          if (callCount == 1) {
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {
                  'code': 'NETWORK_ERROR',
                  'message': 'Dojo server unavailable.',
                },
              }),
              503,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(
          buildTestApp(storage: storage, httpClient: mockClient),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Connection Issue'), findsOneWidget);
        expect(find.text('Retry Connection'), findsOneWidget);

        // Tap Retry Connection
        await tester.tap(find.text('Retry Connection'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Successfully recovered
        expect(find.text('Connection Issue'), findsNothing);
        expect(find.text('Master Kenji Sato'), findsOneWidget);
      },
    );
  });

  group('Module 5: Role-Aware Routing & Gatekeeper Separation Tests', () {
    testWidgets('Student session resolves to StudentHomeScreen', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'student-token',
        userId: 'st-1',
        email: 'student@selffits.com',
        name: 'Student User',
        role: 'STUDENT',
      );

      final mockClient = TestHttpClient((request) async {
        if (request.url.path == '/api/v1/auth/me') {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'id': 'st-1',
                'name': 'Student User',
                'email': 'student@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'user': {
                'id': 'st-1',
                'name': 'Student User',
                'email': 'student@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
              'isEnrolled': false,
              'unreadNotificationsCount': 0,
              'enrollment': null,
              'classReadiness': {
                'hasBatch': false,
                'isReady': false,
                'nextSession': {
                  'clockTiming': 'Pending',
                  'nextClassFullDate': 'No classes',
                  'dayCombination': 'TBD',
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

      final apiClient = ApiClient(httpClient: mockClient);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            secureStorageProvider.overrideWithValue(storage),
            apiClientProvider.overrideWithValue(apiClient),
          ],
          child: const SelffitsApp(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(StudentHomeScreen), findsOneWidget);
      expect(find.byType(CoachHomeScreen), findsNothing);
    });

    testWidgets('Coach session resolves to CoachHomeScreen', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'coach-token',
        userId: 'coach-1',
        email: 'coach@selffits.com',
        name: 'Master Kenji Sato',
        role: 'COACH',
      );

      final mockClient = TestHttpClient((request) async {
        if (request.url.path == '/api/v1/auth/me') {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'id': 'coach-1',
                'name': 'Master Kenji Sato',
                'email': 'coach@selffits.com',
                'role': 'COACH',
                'isBlocked': false,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response(
          jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: mockClient);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            secureStorageProvider.overrideWithValue(storage),
            apiClientProvider.overrideWithValue(apiClient),
          ],
          child: const SelffitsApp(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(CoachHomeScreen), findsOneWidget);
      expect(find.byType(StudentHomeScreen), findsNothing);
    });

    testWidgets(
      'Unauthenticated session resolves to OnboardingScreen (or PublicMainShell when onboarded)',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();
        final mockClient = TestHttpClient(
          (_) async => http.Response(
            '{}',
            200,
            headers: {'content-type': 'application/json'},
          ),
        );

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(storage),
              apiClientProvider.overrideWithValue(
                ApiClient(httpClient: mockClient),
              ),
            ],
            child: const SelffitsApp(),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(OnboardingScreen), findsOneWidget);
        expect(find.byType(CoachHomeScreen), findsNothing);
        expect(find.byType(StudentHomeScreen), findsNothing);

        // And when onboarding is completed via Skip:
        await tester.tap(find.text('Skip'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(PublicMainShell), findsOneWidget);
        expect(find.byType(CoachHomeScreen), findsNothing);
        expect(find.byType(StudentHomeScreen), findsNothing);
      },
    );
  });

  group('Module 5: Multi-Device Responsive Viewports & Accessibility', () {
    Widget createResponsiveCoachApp(
      ISecureStorageService storage,
      http.Client httpClient, {
      TextScaler? textScaler,
    }) {
      final testApiClient = ApiClient(httpClient: httpClient);
      final coachRepo = CoachRepository(
        apiClient: testApiClient,
        secureStorage: storage,
      );

      return ProviderScope(
        overrides: [
          secureStorageProvider.overrideWithValue(storage),
          apiClientProvider.overrideWithValue(testApiClient),
          coachRepositoryProvider.overrideWithValue(coachRepo),
          authProvider.overrideWith(
            (ref) =>
                AuthNotifier(
                    AuthRepository(
                      apiClient: testApiClient,
                      secureStorage: storage,
                    ),
                  )
                  ..state = AuthState.authenticated(
                    user: const AuthUser(
                      id: 'coach-resp',
                      name: 'Master Kenji Sato',
                      email: 'kenji@selffits.com',
                      role: 'COACH',
                    ),
                    accessToken: 'token',
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
          home: const CoachHomeScreen(),
        ),
      );
    }

    testWidgets(
      'Validates Compact Phone (360 x 640 dp) without layout overflow',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(360, 640);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'token',
          userId: 'coach-resp',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(createResponsiveCoachApp(storage, mockClient));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Master Kenji Sato'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'Validates Modern Phone (390 x 844 dp) without layout overflow',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(390, 844);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'token',
          userId: 'coach-resp',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(createResponsiveCoachApp(storage, mockClient));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Master Kenji Sato'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'Validates Large Flagship Phone (412 x 915 dp) without layout overflow',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(412, 915);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'token',
          userId: 'coach-resp',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(createResponsiveCoachApp(storage, mockClient));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Master Kenji Sato'), findsOneWidget);
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

      final storage = InMemorySecureStorageService();
      await storage.saveSession(
        token: 'token',
        userId: 'coach-resp',
        email: 'kenji@selffits.com',
        name: 'Master Kenji Sato',
        role: 'COACH',
      );

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      await tester.pumpWidget(createResponsiveCoachApp(storage, mockClient));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Master Kenji Sato'), findsOneWidget);
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

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'token',
          userId: 'coach-resp',
          email: 'kenji@selffits.com',
          name: 'Master Kenji Sato',
          role: 'COACH',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachDashboardJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(
          createResponsiveCoachApp(
            storage,
            mockClient,
            textScaler: const TextScaler.linear(1.3),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Master Kenji Sato'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );
  });
}
