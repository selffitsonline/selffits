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
import 'package:selffits_mobile/features/student/presentation/screens/student_profile_screen.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_programs_tab.dart';
import 'package:selffits_mobile/features/student/presentation/widgets/student_drawer.dart';
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

  Widget buildTestApp({
    required ISecureStorageService storage,
    required ApiClient apiClient,
    required StudentRepository repo,
    required Widget child,
  }) {
    return ProviderScope(
      overrides: [
        secureStorageProvider.overrideWithValue(storage),
        apiClientProvider.overrideWithValue(apiClient),
        studentRepositoryProvider.overrideWithValue(repo),
        authProvider.overrideWith(
          (ref) =>
              AuthNotifier(
                  AuthRepository(apiClient: apiClient, secureStorage: storage),
                )
                ..state = AuthState.authenticated(
                  user: const AuthUser(
                    id: 'student-dash-test',
                    name: 'Karan Mehra',
                    email: 'karan@selffits.com',
                    role: 'STUDENT',
                  ),
                  accessToken: 'test-token-parity',
                ),
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.luxuryWhiteTheme,
        home: Scaffold(body: child),
      ),
    );
  }

  group('SELFFITS Dashboard Fixes and Website Parity Tests', () {
    testWidgets(
      '1. Dashboard displays ONLY the single upcoming class and no duplicate enrollment cards',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'test-token-parity',
          userId: 'student-dash-test',
          email: 'karan@selffits.com',
          name: 'Karan Mehra',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-dash-test',
                  'name': 'Karan Mehra',
                  'email': 'karan@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [
                  {
                    'id': 'enr-1',
                    'programTitle': 'Adults Karate & Self Defense',
                    'tierName': '3 Days / Week',
                    'remainingClasses': 10,
                    'totalClasses': 24,
                    'expiryDate': 'Nov 20, 2026',
                    'daysRemaining': 25,
                    'status': 'ACTIVE',
                    'isReady': false,
                    'meetingUrl': null,
                  },
                  {
                    'id': 'enr-2',
                    'programTitle': 'HIIT & Weight Management',
                    'tierName': '2 Days / Week',
                    'remainingClasses': 6,
                    'totalClasses': 16,
                    'expiryDate': 'Dec 15, 2026',
                    'daysRemaining': 50,
                    'status': 'ACTIVE',
                    'isReady': false,
                    'meetingUrl': null,
                  },
                ],
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': false,
                  'meetingUrl': null,
                  'batchCode': 'KARATE-B1',
                  'batchName': 'Adults Karate Evening Batch',
                  'programTitle': 'Adults Karate & Self Defense',
                  'coachName': 'Sensei Rahul Sharma',
                  'coachRank': 'Black Belt 5th Dan',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 25, 2026',
                    'nextClassFullDate': 'Sunday, Oct 25, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                    'timeSlot': '1st Batch',
                    'dayCombination': 'Sunday, Wednesday, Friday',
                  },
                },
                'unreadNotificationsCount': 0,
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

        await tester.pumpWidget(
          buildTestApp(
            storage: mockStorage,
            apiClient: apiClient,
            repo: repo,
            child: const StudentHomeScreen(initialIndex: 0),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // 1. Single next upcoming class section
        expect(find.text('YOUR UPCOMING CLASS'), findsOneWidget);
        expect(find.text('Adults Karate Evening Batch'), findsOneWidget);
        expect(find.text('KARATE-B1'), findsOneWidget);

        // 2. Preparation message & disabled button
        expect(find.text('Your Class Is Being Prepared'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW (Not Ready)'), findsOneWidget);

        // 3. Technical session banner is NOT visible
        expect(find.text('Hardware-Backed Session Active'), findsNothing);
        expect(find.text('Hardware-Backed Session'), findsNothing);

        // 4. Multiple enrollment cards are NOT duplicated in upcoming class section
        expect(find.text('YOUR ENROLLMENTS & MEMBERSHIPS'), findsNothing);
        // Manage All Programs section is completely removed from dashboard
        expect(find.textContaining('Manage All Programs'), findsNothing);
        expect(find.text('View All'), findsNothing);
      },
    );

    testWidgets(
      '2. Automatic Live Class Activation: Button activates emerald with meeting link when ready',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'test-token-parity',
          userId: 'student-dash-test',
          email: 'karan@selffits.com',
          name: 'Karan Mehra',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-dash-test',
                  'name': 'Karan Mehra',
                  'email': 'karan@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [
                  {
                    'id': 'enr-1',
                    'programTitle': 'Adults Karate & Self Defense',
                    'status': 'ACTIVE',
                    'isReady': true,
                    'meetingUrl': 'https://meet.google.com/selffits-live-class',
                  },
                ],
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': true,
                  'meetingUrl': 'https://meet.google.com/selffits-live-class',
                  'batchCode': 'KARATE-B1',
                  'batchName': 'Adults Karate Evening Batch',
                  'programTitle': 'Adults Karate & Self Defense',
                  'coachName': 'Sensei Rahul Sharma',
                  'coachRank': 'Black Belt 5th Dan',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 25, 2026',
                    'nextClassFullDate': 'Sunday, Oct 25, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                    'timeSlot': '1st Batch',
                    'dayCombination': 'Sunday, Wednesday, Friday',
                  },
                },
                'unreadNotificationsCount': 0,
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

        await tester.pumpWidget(
          buildTestApp(
            storage: mockStorage,
            apiClient: apiClient,
            repo: repo,
            child: const StudentHomeScreen(initialIndex: 0),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // When ready: Enabled emerald Join Live Class button
        expect(find.text('JOIN LIVE CLASS NOW'), findsOneWidget);
        final joinBtn = tester.widget<AppButton>(
          find.widgetWithText(AppButton, 'JOIN LIVE CLASS NOW'),
        );
        expect(joinBtn.onPressed, isNotNull);
        expect(joinBtn.variant, AppButtonVariant.primaryEmerald);

        // Preparation panel is hidden when live
        expect(find.text('Your Class Is Being Prepared'), findsNothing);
      },
    );

    testWidgets(
      '3. Technical Session Banner is removed from Profile and Student Drawer screens',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'test-token-parity',
          userId: 'student-dash-test',
          email: 'karan@selffits.com',
          name: 'Karan Mehra',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-dash-test',
                  'name': 'Karan Mehra',
                  'email': 'karan@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [],
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

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = StudentRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        // A. Profile Screen
        await tester.pumpWidget(
          buildTestApp(
            storage: mockStorage,
            apiClient: apiClient,
            repo: repo,
            child: const StudentProfileScreen(),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('SECURITY & HARDWARE SESSION'), findsNothing);
        expect(find.text('Hardware-Backed Session'), findsNothing);

        // B. Student Drawer
        await tester.pumpWidget(
          buildTestApp(
            storage: mockStorage,
            apiClient: apiClient,
            repo: repo,
            child: Scaffold(
              drawer: StudentDrawer(
                selectedIndex: 0,
                onSectionSelected: (_) {},
              ),
            ),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Hardware-backed mobile session'), findsNothing);
        expect(find.text('Hardware-Backed Session Active'), findsNothing);
      },
    );

    testWidgets(
      '4. Programs Tab displays ALL active enrollments with full metrics and live readiness',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'test-token-parity',
          userId: 'student-dash-test',
          email: 'karan@selffits.com',
          name: 'Karan Mehra',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-dash-test',
                  'name': 'Karan Mehra',
                  'email': 'karan@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [
                  {
                    'id': 'prog-1',
                    'programTitle': 'Adults Martial Arts Championship',
                    'tierName': '3 Days / Week',
                    'remainingClasses': 12,
                    'totalClasses': 24,
                    'expiryDate': 'Nov 30, 2026',
                    'daysRemaining': 36,
                    'status': 'ACTIVE',
                    'isReady': false,
                    'meetingUrl': null,
                  },
                  {
                    'id': 'prog-2',
                    'programTitle': 'Kids Virtual Dojo Training',
                    'tierName': '2 Days / Week',
                    'remainingClasses': 8,
                    'totalClasses': 16,
                    'expiryDate': 'Dec 25, 2026',
                    'daysRemaining': 61,
                    'status': 'ACTIVE',
                    'isReady': true,
                    'meetingUrl': 'https://meet.google.com/kids-dojo-live',
                  },
                ],
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': false,
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 25, 2026',
                    'nextClassFullDate': 'Sunday, Oct 25, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '05:15 PM to 06:00 PM (GMT)',
                    'timeSlot': '1st Batch',
                    'dayCombination': 'Sunday, Wednesday, Friday',
                  },
                },
                'unreadNotificationsCount': 0,
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

        await tester.pumpWidget(
          buildTestApp(
            storage: mockStorage,
            apiClient: apiClient,
            repo: repo,
            child: const StudentProgramsTab(),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Both enrollments are present in Programs tab
        expect(find.text('Adults Martial Arts Championship'), findsOneWidget);
        expect(find.text('Kids Virtual Dojo Training'), findsOneWidget);

        // Individual readiness states
        expect(find.text('Your Class Is Being Prepared'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW (Not Ready)'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW'), findsOneWidget);
      },
    );
  });
}
