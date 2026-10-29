import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/app.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_exceptions.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/presentation/student_login_screen.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/auth/repositories/auth_repository.dart';
import 'package:selffits_mobile/features/onboarding/presentation/onboarding_screen.dart';
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';

/// Test HTTP client that routes requests to custom handlers.
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

  group('Module 2: AuthRepository & API Client Security Tests', () {
    late InMemorySecureStorageService mockStorage;

    setUp(() {
      mockStorage = InMemorySecureStorageService();
    });

    test(
      'Valid student login stores token in secure storage and returns AuthUser',
      () async {
        final mockClient = TestHttpClient((request) async {
          expect(request.url.path, '/api/v1/auth/login');
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'accessToken': 'valid-student-jwt-token-12345',
                'tokenType': 'Bearer',
                'expiresIn': 2592000,
                'user': {
                  'id': 'student-uuid-001',
                  'name': 'Arjun Sharma',
                  'email': 'student@selffits.com',
                  'role': 'STUDENT',
                  'isBlocked': false,
                  'image': null,
                },
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final result = await repo.login(
          email: 'student@selffits.com',
          password: 'Student@123',
        );

        expect(result.user.id, 'student-uuid-001');
        expect(result.user.name, 'Arjun Sharma');
        expect(result.user.role, 'STUDENT');
        expect(result.user.isStudent, isTrue);
        expect(result.accessToken, 'valid-student-jwt-token-12345');

        // Verify token is stored securely in hardware-backed storage
        final storedToken = await mockStorage.getAccessToken();
        expect(storedToken, 'valid-student-jwt-token-12345');
      },
    );

    test(
      'Invalid credentials throws InvalidCredentialsException without storing token',
      () async {
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {
                'code': 'INVALID_CREDENTIALS',
                'message': 'Invalid email or password.',
              },
            }),
            401,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        expect(
          () =>
              repo.login(email: 'wrong@selffits.com', password: 'badpassword'),
          throwsA(isA<InvalidCredentialsException>()),
        );

        // Verify no token was stored
        final hasToken = await mockStorage.hasToken();
        expect(hasToken, isFalse);
      },
    );

    test(
      'Empty or malformed input triggers validation error before sending network request',
      () async {
        final mockClient = TestHttpClient((request) async {
          fail(
            'Network request should not be dispatched for empty credentials',
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        expect(
          () => repo.login(email: '', password: 'password123'),
          throwsA(isA<ValidationException>()),
        );

        expect(
          () => repo.login(email: 'student@selffits.com', password: ''),
          throwsA(isA<ValidationException>()),
        );
      },
    );

    test(
      'Student-only access: Unauthorized role (COACH) throws ForbiddenRoleException and clears storage',
      () async {
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'accessToken': 'coach-jwt-token',
                'tokenType': 'Bearer',
                'expiresIn': 2592000,
                'user': {
                  'id': 'coach-uuid-1',
                  'name': 'Sensei Sujith',
                  'email': 'coach@selffits.com',
                  'role': 'COACH',
                  'isBlocked': false,
                },
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        expect(
          () => repo.login(email: 'coach@selffits.com', password: 'password'),
          throwsA(isA<ForbiddenRoleException>()),
        );

        final hasToken = await mockStorage.hasToken();
        expect(hasToken, isFalse);
      },
    );

    test(
      'Account blocked throws AccountBlockedException with safe error message',
      () async {
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {
                'code': 'ACCOUNT_BLOCKED',
                'message': 'Your account has been blocked by an administrator.',
              },
            }),
            403,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        expect(
          () => repo.login(email: 'blocked@selffits.com', password: 'password'),
          throwsA(isA<AccountBlockedException>()),
        );
      },
    );

    test(
      'Successful session restoration validates token with GET /api/v1/auth/me',
      () async {
        await mockStorage.saveSession(
          token: 'stored-active-token',
          userId: 'student-123',
          email: 'student@selffits.com',
          name: 'Arjun',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          expect(request.url.path, '/api/v1/auth/me');
          expect(
            request.headers['authorization'],
            'Bearer stored-active-token',
          );
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'id': 'student-123',
                'name': 'Arjun',
                'email': 'student@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final session = await repo.restoreSession();
        expect(session, isNotNull);
        expect(session!.user.name, 'Arjun');
        expect(session.accessToken, 'stored-active-token');
      },
    );

    test(
      'Missing token in secure storage returns null session immediately',
      () async {
        final mockClient = TestHttpClient((request) async {
          fail('Should not call API when no token is stored');
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final session = await repo.restoreSession();
        expect(session, isNull);
      },
    );

    test(
      'Expired token clears secure storage and returns null session',
      () async {
        await mockStorage.saveSession(
          token: 'expired-token-999',
          userId: 'student-123',
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
                'message':
                    'Mobile access token has expired. Please log in again.',
              },
            }),
            401,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final session = await repo.restoreSession();
        expect(session, isNull);

        // Verify storage was wiped
        final hasToken = await mockStorage.hasToken();
        expect(hasToken, isFalse);
      },
    );

    test(
      'Rejected / tampered token clears secure storage and returns null session',
      () async {
        await mockStorage.saveSession(
          token: 'tampered-signature-token',
          userId: 'student-123',
          email: 'student@selffits.com',
          name: 'Arjun',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {
                'code': 'INVALID_TOKEN_SIGNATURE',
                'message': 'Mobile token signature is invalid.',
              },
            }),
            401,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final session = await repo.restoreSession();
        expect(session, isNull);
        expect(await mockStorage.hasToken(), isFalse);
      },
    );

    test(
      'Network failures map to NetworkConnectionException without disclosing internal secrets',
      () async {
        final mockClient = TestHttpClient((request) async {
          throw const SocketException('Connection refused');
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        expect(
          () => repo.login(email: 'test@selffits.com', password: 'password123'),
          throwsA(isA<NetworkConnectionException>()),
        );
      },
    );

    test('Logout clears all stored credentials from secure storage', () async {
      await mockStorage.saveSession(
        token: 'active-token',
        userId: 'student-1',
        email: 'student@selffits.com',
        name: 'Student',
        role: 'STUDENT',
      );

      expect(await mockStorage.hasToken(), isTrue);

      final mockClient = TestHttpClient(
        (request) async => http.Response('', 200),
      );
      final apiClient = ApiClient(httpClient: mockClient);
      final repo = AuthRepository(
        apiClient: apiClient,
        secureStorage: mockStorage,
      );

      await repo.logout();

      expect(await mockStorage.hasToken(), isFalse);
      final userData = await mockStorage.getUserData();
      expect(userData['id'], isNull);
      expect(userData['email'], isNull);
    });

    test(
      'Security check: ApiException does not expose secrets or stack traces in toString()',
      () {
        const ex = ApiException(
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
          statusCode: 401,
        );

        expect(ex.toString(), 'Invalid email or password.');
        expect(ex.toString().contains('secret'), isFalse);
        expect(ex.toString().contains('NEXTAUTH'), isFalse);
        expect(ex.toString().contains('token'), isFalse);
      },
    );
  });

  group('Module 2: Widget & Protected Navigation Tests', () {
    testWidgets(
      'StudentLoginScreen displays Luxury White design elements and validates inputs',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          const ProviderScope(child: MaterialApp(home: StudentLoginScreen())),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 100));

        expect(find.text('Welcome Back'), findsOneWidget);
        expect(find.text('STUDENT PORTAL'), findsNothing);
        expect(find.text('Sign In'), findsOneWidget);

        // Tap Sign In with empty fields
        await tester.tap(find.text('Sign In'));
        await tester.pump();

        expect(find.text('Email address is required.'), findsOneWidget);
        expect(find.text('Password is required.'), findsOneWidget);
      },
    );

    testWidgets(
      'Demo quick-fill controls are absent and credentials require manual input',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          const ProviderScope(child: MaterialApp(home: StudentLoginScreen())),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 100));

        // Verify demo buttons do not exist on the screen
        expect(find.text('Tap to fill demo student account'), findsNothing);
        expect(find.text('Tap to fill demo coach account'), findsNothing);

        // Verify manual entry into form fields works
        await tester.enterText(
          find.widgetWithText(TextFormField, 'Enter your email address'),
          'student@selffits.com',
        );
        await tester.pump();

        expect(find.text('student@selffits.com'), findsOneWidget);
      },
    );

    testWidgets(
      'Protected Navigation: Unauthenticated state renders OnboardingScreen and transitions to PublicMainShell upon Skip',
      (WidgetTester tester) async {
        final mockStorage = InMemorySecureStorageService();
        // Storage is empty -> fresh install boots to OnboardingScreen

        await tester.pumpWidget(
          ProviderScope(
            overrides: [secureStorageProvider.overrideWithValue(mockStorage)],
            child: const SelffitsApp(),
          ),
        );

        // Pump through session restoration
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        expect(find.byType(OnboardingScreen), findsOneWidget);
        expect(find.byType(StudentHomeScreen), findsNothing);

        // User taps Skip on Onboarding
        await tester.tap(find.text('Skip'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        // Gatekeeper transitions immediately to PublicMainShell
        expect(find.byType(PublicMainShell), findsOneWidget);
        expect(find.byType(StudentHomeScreen), findsNothing);
        expect(await mockStorage.hasCompletedOnboarding(), isTrue);
      },
    );

    testWidgets(
      'Protected Navigation: Authenticated student session renders StudentHomeScreen',
      (WidgetTester tester) async {
        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'valid-test-token',
          userId: 'student-99',
          email: 'student@selffits.com',
          name: 'Rohit Verma',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'id': 'student-99',
                'name': 'Rohit Verma',
                'email': 'student@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final testApiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(mockStorage),
              apiClientProvider.overrideWithValue(testApiClient),
            ],
            child: const SelffitsApp(),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        // StudentHomeScreen is rendered directly on Account screen per requirements
        expect(find.byType(StudentHomeScreen), findsOneWidget);
        expect(find.text('Rohit Verma'), findsWidgets);
        expect(find.text('ACCOUNT INFORMATION'), findsOneWidget);
        expect(find.text('Account Role'), findsOneWidget);
        expect(find.text('STUDENT'), findsOneWidget);

        // Can switch to Dashboard tab
        await tester.tap(find.text('Dashboard'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.text('Hardware-Backed Session Active'), findsNothing);
        expect(find.text('Welcome back,'), findsOneWidget);
      },
    );

    testWidgets(
      'Logout action resets state and redirects immediately to StudentLoginScreen',
      (WidgetTester tester) async {
        final mockStorage = InMemorySecureStorageService();
        await mockStorage.saveSession(
          token: 'logout-test-token',
          userId: 'student-99',
          email: 'student@selffits.com',
          name: 'Rohit Verma',
          role: 'STUDENT',
        );

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'id': 'student-99',
                'name': 'Rohit Verma',
                'email': 'student@selffits.com',
                'role': 'STUDENT',
                'isBlocked': false,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final testApiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              secureStorageProvider.overrideWithValue(mockStorage),
              apiClientProvider.overrideWithValue(testApiClient),
            ],
            child: const SelffitsApp(),
          ),
        );

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        expect(find.byType(StudentHomeScreen), findsOneWidget);

        // Tap Log Out of Account button in the Account screen
        final logoutBtn = find.text('Log Out of Account');
        await tester.scrollUntilVisible(logoutBtn, 200);
        await tester.tap(logoutBtn);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Confirm logout dialog
        await tester.tap(find.widgetWithText(AppButton, 'Log Out'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));

        // Verify user was redirected back to PublicMainShell on logout without repeating onboarding
        expect(find.byType(PublicMainShell), findsOneWidget);
        expect(find.byType(StudentHomeScreen), findsNothing);
        expect(find.byType(OnboardingScreen), findsNothing);

        // Verify credentials were wiped while onboarding completion is preserved
        expect(await mockStorage.hasToken(), isFalse);
        expect(await mockStorage.hasCompletedOnboarding(), isTrue);
      },
    );
  });
}
