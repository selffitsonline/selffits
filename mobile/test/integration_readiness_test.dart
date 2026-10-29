import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_endpoints.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/models/auth_state.dart';
import 'package:selffits_mobile/features/auth/models/auth_user.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/auth/repositories/auth_repository.dart';
import 'package:selffits_mobile/features/coach/presentation/coach_home_screen.dart';
import 'package:selffits_mobile/features/coach/presentation/screens/coach_profile_screen.dart';
import 'package:selffits_mobile/features/coach/presentation/tabs/coach_batches_tab.dart';
import 'package:selffits_mobile/features/coach/presentation/tabs/coach_schedule_tab.dart';
import 'package:selffits_mobile/features/coach/presentation/tabs/coach_students_tab.dart';
import 'package:selffits_mobile/features/coach/providers/coach_dashboard_provider.dart';
import 'package:selffits_mobile/features/coach/repositories/coach_repository.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';
import 'package:selffits_mobile/features/student/presentation/screens/student_profile_screen.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_certificates_tab.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_programs_tab.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_progress_tab.dart';
import 'package:selffits_mobile/features/student/providers/student_dashboard_provider.dart';
import 'package:selffits_mobile/features/student/repositories/student_repository.dart';

class TestMockClient extends http.BaseClient {
  final Future<http.Response> Function(http.BaseRequest request) handler;

  TestMockClient(this.handler);

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

  group('SELFFITS Mobile Integration & Release Readiness Tests', () {
    test('ApiEndpoints default to production https://selffits.com', () {
      expect(ApiEndpoints.baseUrl, 'https://selffits.com');
      expect(
        ApiEndpoints.uri('/api/v1/public/catalog').toString(),
        'https://selffits.com/api/v1/public/catalog',
      );
      expect(
        ApiEndpoints.uri(ApiEndpoints.studentDashboard).toString(),
        'https://selffits.com/api/v1/student/dashboard',
      );
      expect(
        ApiEndpoints.uri(ApiEndpoints.coachDashboard).toString(),
        'https://selffits.com/api/v1/coach/dashboard',
      );
      expect(
        ApiEndpoints.uri(ApiEndpoints.login).toString(),
        'https://selffits.com/api/v1/auth/login',
      );
      expect(
        ApiEndpoints.uri(ApiEndpoints.authMe).toString(),
        'https://selffits.com/api/v1/auth/me',
      );
    });

    test('Design System Luxury White tokens validation', () {
      expect(AppColors.background, const Color(0xFFF8F9FB));
      expect(AppColors.surface, const Color(0xFFFFFFFF));
      expect(AppColors.brandRed, const Color(0xFFE50914));
      expect(AppColors.brandBlue, const Color(0xFF0080FF));
      expect(AppColors.textPrimary, const Color(0xFF0F172A));
      expect(AppColors.textSecondary, const Color(0xFF475569));
    });

    testWidgets(
      'Student Portal: verifies all tabs and profile screen access under Luxury White theme',
      (tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'test-token',
          userId: 'test_student_1',
          email: 'arya@selffits.com',
          name: 'Arya Stark',
          role: 'STUDENT',
        );

        final sampleStudentJson = {
          'user': {
            'id': 'test_student_1',
            'name': 'Arya Stark',
            'email': 'arya@selffits.com',
            'role': 'STUDENT',
          },
          'isEnrolled': true,
          'enrollment': {
            'id': 'enr_1',
            'programTitle': 'Mixed Martial Arts',
            'tierName': 'Standard',
            'remainingClasses': 12,
            'totalClasses': 24,
            'expiryDate': '2026-12-31',
            'daysRemaining': 70,
            'status': 'ACTIVE',
            'martialArtsType': 'Karate',
          },
          'classReadiness': {
            'hasBatch': true,
            'isReady': true,
            'batchId': 'batch_1',
            'batchName': 'Evening Warriors',
            'programTitle': 'Mixed Martial Arts',
            'coachName': 'Sensei James',
            'dayCombination': 'Mon / Wed / Fri',
            'clockTiming': '06:00 PM to 07:00 PM (GMT)',
            'meetingUrl': 'https://meet.google.com/xyz-test',
            'nextSession': {
              'nextClassDay': 'Today',
              'nextClassDate': 'Oct 22',
              'nextClassFullDate': 'Wednesday, Oct 22, 2026',
              'relativeLabel': 'Today at 06:00 PM',
              'isToday': true,
              'clockTiming': '06:00 PM to 07:00 PM (GMT)',
              'timeSlot': 'Evening',
              'dayCombination': 'Mon / Wed / Fri',
            },
          },
          'unreadNotificationsCount': 1,
        };

        final testClient = TestMockClient((req) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleStudentJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: testClient);
        final studentRepo = StudentRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(mockStorage),
              apiClientProvider.overrideWithValue(apiClient),
              studentRepositoryProvider.overrideWithValue(studentRepo),
              authProvider.overrideWith(
                (ref) =>
                    AuthNotifier(
                        AuthRepository(
                          apiClient: apiClient,
                          secureStorage: mockStorage,
                        ),
                      )
                      ..state = AuthState.authenticated(
                        user: const AuthUser(
                          id: 'test_student_1',
                          name: 'Arya Stark',
                          email: 'arya@selffits.com',
                          role: 'STUDENT',
                        ),
                        accessToken: 'test-token',
                      ),
              ),
            ],
            child: MaterialApp(
              theme: AppTheme.luxuryWhiteTheme,
              home: const PublicMainShell(initialIndex: 1),
            ),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // 1. Initial Screen: Account screen directly per requirements
        expect(find.byType(StudentHomeScreen), findsOneWidget);
        expect(find.byType(StudentProfileScreen), findsOneWidget);
        expect(find.text('Arya Stark'), findsAtLeast(1));
        expect(find.text('arya@selffits.com'), findsAtLeast(1));
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);

        // 2. Switch to Dashboard Tab
        await tester.tap(find.text('Dashboard'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.text('Evening Warriors'), findsWidgets);
        expect(find.text('JOIN LIVE CLASS NOW'), findsOneWidget);

        // 3. Switch to "My Programs"
        await tester.tap(find.text('Programs'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(StudentProgramsTab), findsOneWidget);
        expect(find.text('MY PROGRAMS & MEMBERSHIPS'), findsOneWidget);
        expect(find.text('Mixed Martial Arts'), findsWidgets);

        // 4. Switch to "My Progress"
        await tester.tap(find.text('Progress'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(StudentProgressTab), findsOneWidget);
        expect(find.text('MY TRAINING PROGRESS'), findsOneWidget);
        expect(find.text('Attendance & Rank'), findsOneWidget);

        // 5. Switch to "Certificates"
        await tester.tap(find.text('Certificates'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(StudentCertificatesTab), findsOneWidget);
        expect(find.text('MY OFFICIAL CREDENTIALS'), findsOneWidget);

        // 6. Switch back to Account tab via bottom navigation
        await tester.tap(find.text('Account'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(StudentProfileScreen), findsOneWidget);
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);

        // 7. Verify no duplicate controls
        expect(find.byTooltip('Open navigation menu'), findsNothing);
        expect(find.byTooltip('Profile & Settings'), findsNothing);
      },
    );

    testWidgets(
      'Coach Portal: verifies all tabs and profile screen access under Luxury White theme',
      (tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'test-coach-token',
          userId: 'c_1',
          email: 'james@selffits.com',
          name: 'Sensei James Bond',
          role: 'COACH',
        );

        final sampleCoachJson = {
          'coach': {
            'id': 'c_1',
            'fullName': 'Sensei James Bond',
            'email': 'james@selffits.com',
            'highestRank': '4th Dan Black Belt',
            'disciplines': ['Karate', 'Kickboxing', 'Kung-Fu'],
          },
          'totalBatchesCount': 1,
          'totalStudentsCount': 1,
          'upcomingClass': {
            'id': 'b_1',
            'batchId': 'BATCH-001',
            'name': 'Master Tiger Batch',
            'programTitle': 'Adults Mixed Martial Arts',
            'beltLevel': 'Black Belt Track',
            'dayCombination': 'Mon / Wed / Fri',
            'timeSlot': '07:00 PM',
            'clockTiming': '07:00 PM to 08:00 PM (GMT)',
            'meetingUrl': 'https://meet.google.com/coach-test',
            'isMeetingActive': true,
            'status': 'ACTIVE',
            'maxCapacity': 15,
            'studentsCount': 1,
            'students': [
              {
                'id': 'st_1',
                'name': 'Bruce Wayne',
                'email': 'bruce@wayne.com',
                'assignedAt': '2026-01-15',
                'martialArtsType': 'Karate',
              },
            ],
            'nextSession': {
              'nextClassDay': 'Today',
              'nextClassDate': 'Oct 22',
              'nextClassFullDate': 'Wednesday, Oct 22, 2026',
              'relativeLabel': 'Today at 07:00 PM',
              'isToday': true,
              'clockTiming': '07:00 PM to 08:00 PM (GMT)',
              'timeSlot': 'Evening',
              'dayCombination': 'Mon / Wed / Fri',
            },
          },
          'batches': [
            {
              'id': 'b_1',
              'batchId': 'BATCH-001',
              'name': 'Master Tiger Batch',
              'programTitle': 'Adults Mixed Martial Arts',
              'beltLevel': 'Black Belt Track',
              'dayCombination': 'Mon / Wed / Fri',
              'timeSlot': '07:00 PM',
              'clockTiming': '07:00 PM to 08:00 PM (GMT)',
              'meetingUrl': 'https://meet.google.com/coach-test',
              'isMeetingActive': true,
              'status': 'ACTIVE',
              'maxCapacity': 15,
              'studentsCount': 1,
              'students': [
                {
                  'id': 'st_1',
                  'name': 'Bruce Wayne',
                  'email': 'bruce@wayne.com',
                  'assignedAt': '2026-01-15',
                  'martialArtsType': 'Karate',
                },
              ],
              'nextSession': {
                'nextClassDay': 'Today',
                'nextClassDate': 'Oct 22',
                'nextClassFullDate': 'Wednesday, Oct 22, 2026',
                'relativeLabel': 'Today at 07:00 PM',
                'isToday': true,
                'clockTiming': '07:00 PM to 08:00 PM (GMT)',
                'timeSlot': 'Evening',
                'dayCombination': 'Mon / Wed / Fri',
              },
            },
          ],
        };

        final testClient = TestMockClient((req) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCoachJson}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: testClient);
        final coachRepo = CoachRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(mockStorage),
              apiClientProvider.overrideWithValue(apiClient),
              coachRepositoryProvider.overrideWithValue(coachRepo),
              authProvider.overrideWith(
                (ref) =>
                    AuthNotifier(
                        AuthRepository(
                          apiClient: apiClient,
                          secureStorage: mockStorage,
                        ),
                      )
                      ..state = AuthState.authenticated(
                        user: const AuthUser(
                          id: 'c_1',
                          name: 'Sensei James Bond',
                          email: 'james@selffits.com',
                          role: 'COACH',
                        ),
                        accessToken: 'test-coach-token',
                      ),
              ),
            ],
            child: MaterialApp(
              theme: AppTheme.luxuryWhiteTheme,
              home: const CoachHomeScreen(),
            ),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // 1. Coach Dashboard Tab
        expect(
          find.text('Adults Mixed Martial Arts — Master Tiger Batch'),
          findsWidgets,
        );
        expect(find.text('Sensei James Bond'), findsOneWidget);
        expect(find.text('START LIVE DOJO (GOOGLE MEET)'), findsOneWidget);

        // 2. Switch to "Batches"
        await tester.tap(find.text('Batches'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(CoachBatchesTab), findsOneWidget);
        expect(find.text('ASSIGNED TRAINING BATCHES'), findsOneWidget);
        expect(find.text('My Dojo Batches'), findsOneWidget);

        // 3. Switch to "Schedule"
        await tester.tap(find.text('Schedule'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(CoachScheduleTab), findsOneWidget);
        expect(find.text('UPCOMING DOJO SCHEDULE'), findsOneWidget);
        expect(find.text('Teaching Schedule'), findsAtLeast(1));

        // 4. Switch to "Students"
        await tester.tap(find.text('Students'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(CoachStudentsTab), findsOneWidget);
        expect(find.text('ENROLLED STUDENTS'), findsOneWidget);
        expect(find.text('Bruce Wayne'), findsOneWidget);
        expect(find.text('bruce@wayne.com'), findsOneWidget);

        // 5. Open Profile via AppBar
        final profileButton = find.byTooltip('Sensei Profile & Settings');
        expect(profileButton, findsOneWidget);
        await tester.tap(profileButton);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(CoachProfileScreen), findsOneWidget);
        expect(find.text('Sensei James Bond'), findsOneWidget);
        expect(find.text('4th Dan Black Belt'), findsAtLeast(1));
      },
    );
  });
}
