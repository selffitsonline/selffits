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
import 'package:selffits_mobile/features/coach/presentation/coach_home_screen.dart';
import 'package:selffits_mobile/features/coach/presentation/screens/coach_profile_screen.dart';
import 'package:selffits_mobile/features/coach/presentation/tabs/coach_batches_tab.dart';
import 'package:selffits_mobile/features/coach/presentation/tabs/coach_schedule_tab.dart';
import 'package:selffits_mobile/features/coach/presentation/tabs/coach_students_tab.dart';
import 'package:selffits_mobile/features/coach/presentation/widgets/coach_drawer.dart';
import 'package:selffits_mobile/features/coach/providers/coach_dashboard_provider.dart';
import 'package:selffits_mobile/features/coach/repositories/coach_repository.dart';

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

final Map<String, dynamic> sampleCoachData = {
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
      'batchId': 'BATCH-KB-02',
      'name': 'Kickboxing Pro Fit',
      'programTitle': 'Kickboxing Conditioning',
      'dayCombination': 'Tuesday & Friday',
      'clockTiming': '06:00 PM to 07:00 PM (GMT)',
      'timeSlot': 'Evening',
      'meetingUrl': 'https://meet.google.com/xyz-uvwx-rst',
      'maxCapacity': 15,
      'studentsCount': 8,
      'status': 'ACTIVE',
      'nextSession': {
        'nextClassDay': 'Tomorrow',
        'nextClassDate': 'Oct 17, 2026',
        'nextClassFullDate': 'Saturday, Oct 17, 2026',
        'relativeLabel': 'Tomorrow',
        'isToday': false,
        'clockTiming': '06:00 PM to 07:00 PM (GMT)',
        'timeSlot': 'Evening',
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

  group('Coach Portal Navigation & Section Tests', () {
    late InMemorySecureStorageService mockStorage;

    setUp(() async {
      mockStorage = InMemorySecureStorageService();
      await mockStorage.saveSession(
        token: 'test-coach-nav-token',
        userId: 'coach-001',
        email: 'kenji@selffits.com',
        name: 'Master Kenji Sato',
        role: 'COACH',
      );
    });

    Widget createTestApp({Map<String, dynamic>? customData}) {
      final client = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': customData ?? sampleCoachData}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: client);
      final repo = CoachRepository(
        apiClient: apiClient,
        secureStorage: mockStorage,
      );

      return ProviderScope(
        overrides: [
          secureStorageProvider.overrideWithValue(mockStorage),
          apiClientProvider.overrideWithValue(apiClient),
          coachRepositoryProvider.overrideWithValue(repo),
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
                      id: 'coach-001',
                      name: 'Master Kenji Sato',
                      email: 'kenji@selffits.com',
                      role: 'COACH',
                    ),
                    accessToken: 'test-coach-nav-token',
                  ),
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.luxuryWhiteTheme,
          home: const CoachHomeScreen(),
        ),
      );
    }

    testWidgets(
      'CoachHomeScreen renders BottomNavigationBar with 4 primary tabs',
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

        expect(find.byType(BottomNavigationBar), findsOneWidget);
        expect(find.text('Dashboard'), findsOneWidget);
        expect(find.text('Batches'), findsOneWidget);
        expect(find.text('Schedule'), findsOneWidget);
        expect(find.text('Students'), findsOneWidget);

        // Initially at tab 0 (Dashboard)
        expect(find.text('Master Kenji Sato'), findsOneWidget);
        expect(find.text('5th Dan Black Belt Shotokan'), findsOneWidget);
        expect(find.text('YOUR NEXT CLASS TO CONDUCT'), findsOneWidget);
      },
    );

    testWidgets(
      'Switching tabs via BottomNavigationBar renders correct tab content',
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

        // 1. Switch to Batches tab (index 1)
        await tester.tap(find.text('Batches'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(CoachBatchesTab), findsOneWidget);
        expect(find.text('ASSIGNED TRAINING BATCHES'), findsOneWidget);
        expect(find.text('My Dojo Batches'), findsOneWidget);
        expect(find.text('ACTIVE BATCHES (2)'), findsOneWidget);
        expect(find.text('BATCH-KAR-01'), findsWidgets);

        // 2. Switch to Schedule tab (index 2)
        await tester.tap(find.text('Schedule'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(CoachScheduleTab), findsOneWidget);
        expect(find.text('UPCOMING DOJO SCHEDULE'), findsOneWidget);
        expect(find.text('Teaching Schedule'), findsAtLeast(1));
        expect(find.text('SCHEDULED SESSIONS BY BATCH'), findsOneWidget);
        expect(find.text('SENSEI DOJO PROTOCOL'), findsWidgets);

        // 3. Switch to Students tab (index 3)
        await tester.tap(find.text('Students'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.byType(CoachStudentsTab), findsOneWidget);
        expect(find.text('ENROLLED STUDENTS'), findsOneWidget);
        expect(find.text('Student Rosters'), findsOneWidget);
        expect(find.text('Aarav Patel'), findsAtLeast(1));
        expect(find.text('aarav@example.com'), findsAtLeast(1));
        expect(find.text('Diya Sharma'), findsAtLeast(1));
        expect(find.text('Rohan Gupta'), findsOneWidget);

        // 4. Switch back to Dashboard tab (index 0)
        await tester.tap(find.text('Dashboard'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('YOUR NEXT CLASS TO CONDUCT'), findsOneWidget);
        expect(find.text('START LIVE DOJO (GOOGLE MEET)'), findsOneWidget);
      },
    );

    testWidgets(
      'AppBar Profile icon opens CoachProfileScreen with full sensei details',
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

        // Tap profile icon button in AppBar
        final profileButton = find.byTooltip('Sensei Profile & Settings');
        expect(profileButton, findsOneWidget);
        await tester.tap(profileButton);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Verify CoachProfileScreen is mounted
        expect(find.byType(CoachProfileScreen), findsOneWidget);
        expect(find.text('Sensei Profile & Settings'), findsOneWidget);
        expect(find.text('Master Kenji Sato'), findsAtLeast(1));
        expect(find.text('kenji@selffits.com'), findsAtLeast(1));
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);
        expect(find.text('TEACHING OVERVIEW'), findsOneWidget);
        expect(find.text('SECURITY & HARDWARE SESSION'), findsOneWidget);
        expect(find.text('SUPPORT & ACADEMY'), findsOneWidget);
        expect(find.text('Log Out of Sensei Account'), findsOneWidget);
      },
    );

    testWidgets(
      'CoachDrawer opens and provides navigation across all coach sections',
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

        // Open Drawer via Scaffold drawer button
        final drawerButton = find.byTooltip('Open navigation menu');
        expect(drawerButton, findsOneWidget);
        await tester.tap(drawerButton);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Verify Drawer is displayed
        expect(find.byType(CoachDrawer), findsOneWidget);
        expect(find.text('Master Kenji Sato'), findsAtLeast(1));
        expect(find.text('kenji@selffits.com'), findsAtLeast(1));

        // Drawer navigation list items
        expect(find.text('Dashboard'), findsAtLeast(1));
        expect(find.text('My Batches'), findsOneWidget);
        expect(find.text('Teaching Schedule'), findsOneWidget);
        expect(find.text('Student Rosters'), findsOneWidget);
        expect(find.text('Profile & Settings'), findsOneWidget);

        // Tap 'My Batches' in drawer
        await tester.tap(find.text('My Batches'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Drawer closed, Batches active
        expect(find.byType(CoachDrawer), findsNothing);
        expect(find.text('ASSIGNED TRAINING BATCHES'), findsOneWidget);
      },
    );

    testWidgets(
      'Empty states are rendered properly when coach has 0 batches and students',
      (WidgetTester tester) async {
        tester.view.physicalSize = const Size(800, 1600);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final emptyCoachData = {
          'coach': {
            'id': 'coach-empty',
            'displayName': 'Sensei Empty',
            'email': 'empty@selffits.com',
            'highestRank': '1st Dan',
            'disciplines': <String>[],
          },
          'totalBatchesCount': 0,
          'totalStudentsCount': 0,
          'upcomingClass': null,
          'batches': <Map<String, dynamic>>[],
        };

        await tester.pumpWidget(createTestApp(customData: emptyCoachData));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // 1. Check Batches Tab empty state
        await tester.tap(find.text('Batches'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('No Active Training Batches'), findsOneWidget);

        // 2. Check Schedule Tab empty state
        await tester.tap(find.text('Schedule'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('No Upcoming Sessions Scheduled'), findsOneWidget);

        // 3. Check Students Tab empty state
        await tester.tap(find.text('Students'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        expect(find.text('No Enrolled Students Yet'), findsOneWidget);
      },
    );
  });
}
