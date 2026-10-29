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
import 'package:selffits_mobile/features/public/presentation/public_home_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';
import 'package:selffits_mobile/features/student/presentation/screens/student_profile_screen.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_certificates_tab.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_programs_tab.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_progress_tab.dart';
import 'package:selffits_mobile/features/student/presentation/widgets/student_drawer.dart';
import 'package:selffits_mobile/features/student/providers/student_dashboard_provider.dart';
import 'package:selffits_mobile/features/student/repositories/student_repository.dart';

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

  group('Student Portal Navigation & Section Tests', () {
    late InMemorySecureStorageService mockStorage;
    late ApiClient testApiClient;
    late StudentRepository testStudentRepo;

    setUp(() async {
      mockStorage = InMemorySecureStorageService();
      await mockStorage.saveSession(
        token: 'test-student-nav-token',
        userId: 'student-200',
        email: 'priya@selffits.com',
        name: 'Priya Patel',
        role: 'STUDENT',
      );

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'user': {
                'id': 'student-200',
                'name': 'Priya Patel',
                'email': 'priya@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
              'isEnrolled': true,
              'enrollment': {
                'id': 'enr-200',
                'programTitle': 'Kickboxing Conditioning',
                'tierName': '5 Days / Week',
                'remainingClasses': 18,
                'totalClasses': 30,
                'expiryDate': 'Nov 30, 2026',
                'daysRemaining': 45,
                'martialArtsType': 'Kickboxing',
                'includeDietNutrition': true,
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
              'unreadNotificationsCount': 1,
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      testApiClient = ApiClient(httpClient: mockClient);
      testStudentRepo = StudentRepository(
        apiClient: testApiClient,
        secureStorage: mockStorage,
      );
    });

    Widget createTestApp() {
      return ProviderScope(
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
                      id: 'student-200',
                      name: 'Priya Patel',
                      email: 'priya@selffits.com',
                      role: 'STUDENT',
                    ),
                    accessToken: 'test-student-nav-token',
                  ),
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: const PublicMainShell(initialIndex: 1),
        ),
      );
    }

    testWidgets(
      'PublicMainShell renders bottom Home/Account nav and top 4-item navigation defaulting to Account',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(createTestApp());
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Bottom curved navigation has exactly Home and Account
        expect(find.byType(BottomNavigationBar), findsOneWidget);
        expect(find.text('Home'), findsOneWidget);
        expect(find.text('Account'), findsOneWidget);

        // Top navigation inside Account screen has exactly 4 items in intended order
        expect(find.text('Dashboard'), findsOneWidget);
        expect(find.text('Programs'), findsOneWidget);
        expect(find.text('Progress'), findsOneWidget);
        expect(find.text('Certificates'), findsOneWidget);

        // Initially lands on Account Information
        expect(find.byType(StudentHomeScreen), findsOneWidget);
        expect(find.byType(StudentProfileScreen), findsOneWidget);
        expect(find.text('Priya Patel'), findsAtLeast(1));
        expect(find.text('priya@selffits.com'), findsAtLeast(1));
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);
        expect(find.text('MEMBERSHIP DETAILS'), findsOneWidget);
      },
    );

    testWidgets(
      'Switching tabs via top navigation bar and bottom bar renders correct tab content',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(createTestApp());
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // 1. Switch to Dashboard tab (index 0) - opens student dashboard only
        await tester.tap(find.text('Dashboard'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('Kickboxing — Evening Burn'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW'), findsOneWidget);

        // 2. Switch to My Programs tab (index 1)
        await tester.tap(find.text('Programs'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(StudentProgramsTab), findsOneWidget);
        expect(find.text('MY PROGRAMS & MEMBERSHIPS'), findsOneWidget);
        expect(find.text('Kickboxing Conditioning'), findsAtLeast(1));
        expect(find.text('5 Days / Week'), findsOneWidget);

        // 3. Switch to My Progress tab (index 2)
        await tester.tap(find.text('Progress'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(StudentProgressTab), findsOneWidget);
        expect(find.text('MY TRAINING PROGRESS'), findsOneWidget);
        expect(find.text('Attendance & Rank'), findsOneWidget);
        expect(find.text('Completed'), findsOneWidget);
        expect(find.text('Remaining'), findsOneWidget);
        expect(find.text('40%'), findsOneWidget);

        // 4. Switch to My Certificates tab (index 3)
        await tester.tap(find.text('Certificates'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(StudentCertificatesTab), findsOneWidget);
        expect(find.text('MY OFFICIAL CREDENTIALS'), findsOneWidget);
        expect(find.text('No Certificates Issued Yet'), findsOneWidget);
        expect(find.text('CERTIFICATION MILESTONES'), findsOneWidget);

        // 5. Switch back to Account information via bottom navigation Account tap
        await tester.tap(find.text('Account'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(StudentProfileScreen), findsOneWidget);
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);

        // 6. Switch to Home via bottom navigation - opens public/main Home screen
        await tester.tap(find.text('Home'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(PublicHomeScreen), findsOneWidget);

        // 7. Return to Account via bottom navigation
        await tester.tap(find.text('Account'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(StudentProfileScreen), findsOneWidget);
      },
    );

    testWidgets(
      'Account destination displays real student data, security, and logout controls',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(createTestApp());
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Verify StudentProfileScreen is mounted directly as Account destination
        expect(find.byType(StudentProfileScreen), findsOneWidget);
        expect(find.text('Priya Patel'), findsAtLeast(1));
        expect(find.text('priya@selffits.com'), findsAtLeast(1));
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);
        expect(find.text('Account Role'), findsOneWidget);
        expect(find.text('STUDENT'), findsOneWidget);
        expect(find.text('Account ID'), findsOneWidget);
        expect(find.text('student-200'), findsOneWidget);
        expect(find.text('MEMBERSHIP DETAILS'), findsOneWidget);
        expect(find.text('Kickboxing Conditioning'), findsAtLeast(1));
        expect(find.text('18 of 30 classes left'), findsOneWidget);
        expect(find.text('SECURITY & HARDWARE SESSION'), findsNothing);
        expect(find.text('SUPPORT & ACADEMY'), findsOneWidget);
        expect(find.text('Log Out of Account'), findsOneWidget);
      },
    );

    testWidgets(
      'No duplicate controls: hamburger menu and top header profile icon are removed',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(createTestApp());
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Left-side hamburger menu is removed
        expect(find.byTooltip('Open navigation menu'), findsNothing);
        expect(find.byType(StudentDrawer), findsNothing);

        // Top header profile icon is removed
        expect(find.byTooltip('Profile & Settings'), findsNothing);
      },
    );
  });
}
