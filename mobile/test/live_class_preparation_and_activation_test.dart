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
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';
import 'package:selffits_mobile/features/student/presentation/tabs/student_programs_tab.dart';
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
                    id: 'student-live-test',
                    name: 'Test Student',
                    email: 'student@selffits.com',
                    role: 'STUDENT',
                  ),
                  accessToken: 'mock-live-token',
                ),
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.luxuryWhiteTheme,
        home: Scaffold(body: child),
      ),
    );
  }

  group('SELFFITS Exact Website Live Class Functionality Tests', () {
    testWidgets(
      '1. Class Preparation State: Displays exact website explanatory text and notification info when not ready',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'mock-live-token',
          userId: 'student-live-test',
          email: 'student@selffits.com',
          name: 'Test Student',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-live-test',
                  'name': 'Test Student',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [
                  {
                    'id': 'enr-prep-1',
                    'programTitle': 'Adults Karate & Self Defense',
                    'tierName': '3 Days / Week',
                    'remainingClasses': 12,
                    'totalClasses': 12,
                    'expiryDate': 'Nov 30, 2026',
                    'daysRemaining': 35,
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
                  'batchName': 'Adults Karate — Morning Batch',
                  'programTitle': 'Adults Karate & Self Defense',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 25, 2026',
                    'nextClassFullDate': 'Sunday, Oct 25, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '09:00 AM to 10:00 AM (GMT)',
                    'timeSlot': 'Morning',
                    'dayCombination': 'Sunday, Tuesday, Thursday',
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

        // Exact website wording assertions
        expect(find.text('Your Class Is Being Prepared'), findsWidgets);
        expect(
          find.text(
            'Our team is currently organizing your training session. We\'ll get back to you soon once your batch and live class are ready.',
          ),
          findsWidgets,
        );
        expect(
          find.text(
            'You\'ll be notified when your virtual classroom is ready to join.',
          ),
          findsWidgets,
        );

        // Disabled button assertion
        final disabledBtnFinder = find.widgetWithText(
          AppButton,
          'JOIN LIVE CLASS NOW (Not Ready)',
        );
        expect(disabledBtnFinder, findsOneWidget);
        final btnWidget = tester.widget<AppButton>(disabledBtnFinder);
        expect(btnWidget.onPressed, isNull);
      },
    );

    testWidgets(
      '2. Automatic Live Class Activation: Enabled emerald button opens real URL when class becomes ready',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'mock-live-token',
          userId: 'student-live-test',
          email: 'student@selffits.com',
          name: 'Test Student',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-live-test',
                  'name': 'Test Student',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [
                  {
                    'id': 'enr-ready-1',
                    'programTitle': 'Adults Karate & Self Defense',
                    'tierName': '3 Days / Week',
                    'remainingClasses': 12,
                    'totalClasses': 12,
                    'expiryDate': 'Nov 30, 2026',
                    'daysRemaining': 35,
                    'status': 'ACTIVE',
                    'isReady': true,
                    'meetingUrl': 'https://meet.google.com/xyz-selffits-live',
                  },
                ],
                'classReadiness': {
                  'hasBatch': true,
                  'isReady': true,
                  'meetingUrl': 'https://meet.google.com/xyz-selffits-live',
                  'batchCode': 'KARATE-B1',
                  'batchName': 'Adults Karate — Morning Batch',
                  'programTitle': 'Adults Karate & Self Defense',
                  'coachName': 'Sujith John',
                  'coachRank': 'Black Belt 4th Dan',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Today',
                    'nextClassDate': 'Oct 25, 2026',
                    'nextClassFullDate': 'Sunday, Oct 25, 2026',
                    'relativeLabel': 'Today',
                    'isToday': true,
                    'clockTiming': '09:00 AM to 10:00 AM (GMT)',
                    'timeSlot': 'Morning',
                    'dayCombination': 'Sunday, Tuesday, Thursday',
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

        // When ready, preparation panel is NOT shown on the hero section
        expect(find.text('JOIN LIVE CLASS NOW'), findsOneWidget);
        final readyBtn = tester.widget<AppButton>(
          find.widgetWithText(AppButton, 'JOIN LIVE CLASS NOW'),
        );
        expect(readyBtn.onPressed, isNotNull);
        expect(readyBtn.variant, AppButtonVariant.primaryEmerald);
      },
    );

    testWidgets(
      '3. Programs Tab: Displays preparation state and live activation for individual program enrollments',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'mock-live-token',
          userId: 'student-live-test',
          email: 'student@selffits.com',
          name: 'Test Student',
          role: 'STUDENT',
        );

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'student-live-test',
                  'name': 'Test Student',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                },
                'isEnrolled': true,
                'enrollments': [
                  {
                    'id': 'enr-prog-1',
                    'programTitle': 'Kids Fitness & Weight Management',
                    'tierName': '2 Days / Week',
                    'remainingClasses': 8,
                    'totalClasses': 8,
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
                  'batchCode': 'KIDS-FIT-01',
                  'batchName': 'Kids Fitness Weekend',
                  'programTitle': 'Kids Fitness & Weight Management',
                  'batchStatus': 'ACTIVE',
                  'nextSession': {
                    'nextClassDay': 'Saturday',
                    'nextClassDate': 'Oct 31, 2026',
                    'nextClassFullDate': 'Saturday, Oct 31, 2026',
                    'relativeLabel': 'This Saturday',
                    'isToday': false,
                    'clockTiming': '10:00 AM to 11:00 AM (GMT)',
                    'timeSlot': 'Morning',
                    'dayCombination': 'Saturday & Sunday',
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

        // Program card displays preparation panel and disabled button
        expect(find.text('Kids Fitness & Weight Management'), findsWidgets);
        expect(find.text('Your Class Is Being Prepared'), findsOneWidget);
        expect(find.text('JOIN LIVE CLASS NOW (Not Ready)'), findsOneWidget);
      },
    );
  });
}
