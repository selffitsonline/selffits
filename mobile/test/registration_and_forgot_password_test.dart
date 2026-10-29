import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_exceptions.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/models/registration_payload.dart';
import 'package:selffits_mobile/features/auth/presentation/email_verification_screen.dart';
import 'package:selffits_mobile/features/auth/presentation/forgot_password_screen.dart';
import 'package:selffits_mobile/features/auth/presentation/student_login_screen.dart';
import 'package:selffits_mobile/features/auth/presentation/student_registration_screen.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/auth/repositories/auth_repository.dart';

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

  group('AuthRepository Registration & Forgot Password Unit Tests', () {
    late InMemorySecureStorageService mockStorage;

    setUp(() {
      mockStorage = InMemorySecureStorageService();
    });

    test(
      'Valid Martial Arts registration succeeds and returns RegistrationResult',
      () async {
        final mockClient = TestHttpClient((request) async {
          expect(request.url.path, '/api/v1/auth/register');
          final body = jsonDecode((request as http.Request).body);
          expect(body['registeredProgram'], 'MARTIAL_ARTS');
          expect(body['email'], 'student@example.com');
          expect(body['studentType'], 'Adult (18+)');
          expect(body['martialArtsLevel'], "Beginner — I'm just starting");

          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'userId': 'user-123',
                'email': 'student@example.com',
                'fullName': 'Bruce Lee',
                'registeredProgram': 'MARTIAL_ARTS',
                'emailVerificationRequired': true,
                'message':
                    'Registration successful! Please check your email to verify your account.',
              },
            }),
            201,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        final payload = const RegistrationPayload(
          registeredProgram: 'MARTIAL_ARTS',
          fullName: 'Bruce Lee',
          email: 'student@example.com',
          phone: '+91 9876543210',
          password: 'Password@123',
          confirmPassword: 'Password@123',
          studentType: 'Adult (18+)',
          martialArtsLevel: "Beginner — I'm just starting",
          trainingGoal: 'Self-defence',
        );

        final result = await repo.registerStudent(payload);

        expect(result.userId, 'user-123');
        expect(result.email, 'student@example.com');
        expect(result.registeredProgram, 'MARTIAL_ARTS');
        expect(result.emailVerificationRequired, isTrue);

        // CRITICAL: Registration must NOT store token or authenticate student
        expect(await mockStorage.hasToken(), isFalse);
      },
    );

    test(
      'Duplicate email registration throws DuplicateEmailException (409)',
      () async {
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {
                'code': 'DUPLICATE_EMAIL',
                'message':
                    'An account with this email address already exists. Please log in or reset your password.',
                'fieldErrors': {
                  'email': ['Email address is already registered'],
                },
              },
            }),
            409,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        const payload = RegistrationPayload(
          registeredProgram: 'MARTIAL_ARTS',
          fullName: 'Bruce Lee',
          email: 'existing@example.com',
          phone: '+91 9876543210',
          password: 'Password@123',
          confirmPassword: 'Password@123',
        );

        expect(
          () => repo.registerStudent(payload),
          throwsA(
            isA<DuplicateEmailException>().having(
              (e) => e.code,
              'code',
              'DUPLICATE_EMAIL',
            ),
          ),
        );
      },
    );

    test(
      'Registration rate limiting throws RateLimitException (429) with Retry-After',
      () async {
        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {
                'code': 'TOO_MANY_ATTEMPTS',
                'message':
                    'Too many registration requests from this IP. Please try again in 900 seconds.',
              },
            }),
            429,
            headers: {'content-type': 'application/json', 'retry-after': '900'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: mockStorage,
        );

        const payload = RegistrationPayload(
          registeredProgram: 'MARTIAL_ARTS',
          fullName: 'Bruce Lee',
          email: 'rate@example.com',
          phone: '+91 9876543210',
          password: 'Password@123',
          confirmPassword: 'Password@123',
        );

        expect(
          () => repo.registerStudent(payload),
          throwsA(
            isA<RateLimitException>()
                .having((e) => e.code, 'code', 'TOO_MANY_ATTEMPTS')
                .having((e) => e.retryAfterSeconds, 'retryAfterSeconds', 900),
          ),
        );
      },
    );

    test('Forgot password returns generic message on valid request', () async {
      final mockClient = TestHttpClient((request) async {
        expect(request.url.path, '/api/v1/auth/forgot-password');
        final body = jsonDecode((request as http.Request).body);
        expect(body['email'], 'student@example.com');

        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'message':
                  'If an account exists with that email, a password reset link has been sent.',
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

      final message = await repo.forgotPassword(email: 'student@example.com');
      expect(
        message,
        'If an account exists with that email, a password reset link has been sent.',
      );
    });

    test('Forgot password throws ValidationException on empty email', () async {
      final apiClient = ApiClient(
        httpClient: TestHttpClient((_) async => http.Response('', 500)),
      );
      final repo = AuthRepository(
        apiClient: apiClient,
        secureStorage: mockStorage,
      );

      expect(
        () => repo.forgotPassword(email: '   '),
        throwsA(isA<ValidationException>()),
      );
    });
  });

  group('Widget Tests: StudentLoginScreen Navigation Entry Points', () {
    testWidgets(
      'StudentLoginScreen displays Forgot Password and Create Account links',
      (tester) async {
        await tester.pumpWidget(
          const ProviderScope(child: MaterialApp(home: StudentLoginScreen())),
        );
        await tester.pumpAndSettle();

        expect(find.text('Forgot Password?'), findsOneWidget);
        expect(find.text('Create Account'), findsOneWidget);

        // Verify tapping Forgot Password navigates to ForgotPasswordScreen
        await tester.tap(find.text('Forgot Password?'));
        await tester.pumpAndSettle();

        expect(find.byType(ForgotPasswordScreen), findsOneWidget);
        expect(
          find.text(
            'Enter your registered email address to receive a secure password recovery link.',
          ),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'Tapping Create Account on StudentLoginScreen navigates to StudentRegistrationScreen',
      (tester) async {
        await tester.pumpWidget(
          const ProviderScope(child: MaterialApp(home: StudentLoginScreen())),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.text('Create Account'));
        await tester.pumpAndSettle();

        expect(find.byType(StudentRegistrationScreen), findsOneWidget);
        expect(find.text('Join SELFFITS Academy'), findsOneWidget);
        expect(find.text('Martial Arts'), findsOneWidget);
        expect(find.text('Weight Management & Fitness'), findsOneWidget);
      },
    );
  });

  group('Widget Tests: ForgotPasswordScreen', () {
    testWidgets('Validates email format and displays validation error', (
      tester,
    ) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: ForgotPasswordScreen())),
      );
      await tester.pumpAndSettle();

      // Tap Send Recovery Link with empty email
      await tester.tap(find.text('Send Recovery Link'));
      await tester.pumpAndSettle();

      expect(find.text('Email address is required.'), findsOneWidget);
    });

    testWidgets('Successful forgot password displays generic confirmation view', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final mockClient = TestHttpClient((request) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'message':
                  'If an account exists with that email, a password reset link has been sent.',
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: mockClient);
      final repo = AuthRepository(
        apiClient: apiClient,
        secureStorage: InMemorySecureStorageService(),
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [authRepositoryProvider.overrideWithValue(repo)],
          child: const MaterialApp(home: ForgotPasswordScreen()),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byType(TextFormField).first,
        'registered@example.com',
      );
      await tester.ensureVisible(find.text('Send Recovery Link'));
      await tester.tap(find.text('Send Recovery Link'));
      await tester.pumpAndSettle();

      expect(find.text('Reset Link Dispatched'), findsOneWidget);
      expect(
        find.text(
          'If an account exists with that email, a password reset link has been sent.',
        ),
        findsOneWidget,
      );
      expect(find.text('Back to Sign In'), findsOneWidget);
    });
  });

  group('Widget Tests: StudentRegistrationScreen & Step Progression', () {
    testWidgets(
      'Step 0 allows selecting programme and progresses to Contact Details',
      (tester) async {
        tester.view.physicalSize = const Size(800, 1400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(
          const ProviderScope(
            child: MaterialApp(home: StudentRegistrationScreen()),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Join SELFFITS Academy'), findsOneWidget);
        expect(find.text('Martial Arts'), findsOneWidget);
        expect(find.text('Weight Management & Fitness'), findsOneWidget);

        // Select Weight Management & Fitness
        await tester.ensureVisible(find.text('Weight Management & Fitness'));
        await tester.tap(find.text('Weight Management & Fitness'));
        await tester.pumpAndSettle();

        // Proceed to Step 1 (Contact Details)
        await tester.ensureVisible(find.text('Continue to Questionnaire'));
        await tester.tap(find.text('Continue to Questionnaire'));
        await tester.pumpAndSettle();

        expect(find.text('Step 1 of 4'), findsOneWidget);
        expect(find.text('Contact Details'), findsOneWidget);
        expect(find.text('Next: Student Type'), findsOneWidget);
      },
    );

    testWidgets(
      'Step 1 validates required fields before proceeding to Step 2',
      (tester) async {
        tester.view.physicalSize = const Size(800, 1400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(
          const ProviderScope(
            child: MaterialApp(home: StudentRegistrationScreen()),
          ),
        );
        await tester.pumpAndSettle();

        // Continue to questionnaire (Martial Arts default)
        await tester.ensureVisible(find.text('Continue to Questionnaire'));
        await tester.tap(find.text('Continue to Questionnaire'));
        await tester.pumpAndSettle();

        expect(find.text('Contact Details'), findsOneWidget);

        // Attempt to proceed with empty fields
        await tester.ensureVisible(find.text('Next: Student Type'));
        await tester.tap(find.text('Next: Student Type'));
        await tester.pumpAndSettle();

        expect(find.text('Full name is required.'), findsOneWidget);
        expect(find.text('Email address is required.'), findsOneWidget);
      },
    );

    testWidgets(
      'Preserves questionnaire answers when navigating back and forth',
      (tester) async {
        tester.view.physicalSize = const Size(800, 1400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(
          const ProviderScope(
            child: MaterialApp(home: StudentRegistrationScreen()),
          ),
        );
        await tester.pumpAndSettle();

        // Step 0 -> Step 1 (Contact Details)
        await tester.ensureVisible(find.text('Continue to Questionnaire'));
        await tester.tap(find.text('Continue to Questionnaire'));
        await tester.pumpAndSettle();

        // Fill in details: index 0 = Name, 1 = Email, 2 = Phone
        await tester.enterText(find.byType(TextFormField).at(0), 'Bruce Wayne');
        await tester.enterText(
          find.byType(TextFormField).at(1),
          'bruce@wayne.com',
        );
        await tester.enterText(
          find.byType(TextFormField).at(2),
          '+91 9876543210',
        );
        await tester.pumpAndSettle();

        // Navigate back to Step 0 (Programme Selection)
        await tester.ensureVisible(find.byTooltip('Previous Step'));
        await tester.tap(find.byTooltip('Previous Step'));
        await tester.pumpAndSettle();

        expect(find.text('Join SELFFITS Academy'), findsOneWidget);

        // Navigate forward to Step 1 again
        await tester.ensureVisible(find.text('Continue to Questionnaire'));
        await tester.tap(find.text('Continue to Questionnaire'));
        await tester.pumpAndSettle();

        expect(find.text('Step 1 of 4'), findsOneWidget);
        // Verify values were preserved
        expect(find.text('Bruce Wayne'), findsOneWidget);
        expect(find.text('bruce@wayne.com'), findsOneWidget);
      },
    );

    testWidgets(
      'Full flow: completes questionnaire, security, review, and registers successfully',
      (tester) async {
        tester.view.physicalSize = const Size(800, 1400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        final mockClient = TestHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'userId': 'usr_999',
                'email': 'student@selffits.com',
                'fullName': 'Arjun Sharma',
                'registeredProgram': 'MARTIAL_ARTS',
                'emailVerificationRequired': true,
                'message':
                    'Registration successful! Please check your email to verify your account.',
              },
            }),
            201,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final repo = AuthRepository(
          apiClient: apiClient,
          secureStorage: InMemorySecureStorageService(),
        );

        await tester.pumpWidget(
          ProviderScope(
            overrides: [authRepositoryProvider.overrideWithValue(repo)],
            child: const MaterialApp(home: StudentRegistrationScreen()),
          ),
        );
        await tester.pumpAndSettle();

        // Step 0 -> Step 1 (Contact Details)
        await tester.ensureVisible(find.text('Continue to Questionnaire'));
        await tester.tap(find.text('Continue to Questionnaire'));
        await tester.pumpAndSettle();

        // Step 1: Fill inputs
        await tester.enterText(
          find.byType(TextFormField).at(0),
          'Arjun Sharma',
        );
        await tester.enterText(
          find.byType(TextFormField).at(1),
          'student@selffits.com',
        );
        await tester.enterText(
          find.byType(TextFormField).at(2),
          '+91 9998887776',
        );
        await tester.pumpAndSettle();

        // Proceed to Step 2 (Student Type)
        await tester.ensureVisible(find.text('Next: Student Type'));
        await tester.tap(find.text('Next: Student Type'));
        await tester.pumpAndSettle();

        expect(find.text('Step 2 of 4'), findsOneWidget);
        expect(find.text('Student Type'), findsOneWidget);
        expect(find.text('Adult (18+)'), findsOneWidget);
        expect(find.text('Child (under 18)'), findsOneWidget);

        // Proceed to Step 3 (Programme Questions)
        await tester.ensureVisible(find.text('Next: Programme Questions'));
        await tester.tap(find.text('Next: Programme Questions'));
        await tester.pumpAndSettle();

        expect(find.text('Step 3 of 4'), findsOneWidget);
        expect(find.text('Martial Arts Profile'), findsOneWidget);

        // Proceed to Step 4 (Security & Review)
        await tester.ensureVisible(find.text('Next: Account Security'));
        await tester.tap(find.text('Next: Account Security'));
        await tester.pumpAndSettle();

        expect(find.text('Step 4 of 4'), findsOneWidget);
        expect(find.text('Secure Your Account & Review'), findsOneWidget);
        expect(find.text('Profile Summary'), findsOneWidget);
        expect(find.text('Arjun Sharma'), findsOneWidget);
        expect(find.text('student@selffits.com'), findsWidgets);

        // Fill passwords
        await tester.enterText(
          find.byType(TextFormField).at(0),
          'Password@123',
        );
        await tester.enterText(
          find.byType(TextFormField).at(1),
          'Password@123',
        );
        await tester.pumpAndSettle();

        // Submit
        await tester.ensureVisible(find.text('Create Student Profile'));
        await tester.tap(find.text('Create Student Profile'));
        await tester.pumpAndSettle();

        // Should transition to EmailVerificationScreen
        expect(find.byType(EmailVerificationScreen), findsOneWidget);
        expect(find.text('VERIFY YOUR EMAIL ADDRESS'), findsOneWidget);
        expect(find.textContaining('student@selffits.com'), findsWidgets);
        expect(find.text('Go to Sign In'), findsOneWidget);
      },
    );
  });

  group('Widget Tests: EmailVerificationScreen', () {
    testWidgets(
      'EmailVerificationScreen displays compulsory verification notice and expiration',
      (tester) async {
        await tester.pumpWidget(
          const MaterialApp(
            home: EmailVerificationScreen(
              email: 'unverified@selffits.com',
              emailDeliveryWarning: 'Delivery is slightly delayed.',
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('VERIFY YOUR EMAIL ADDRESS'), findsOneWidget);
        expect(find.textContaining('unverified@selffits.com'), findsOneWidget);
        expect(find.text('Compulsory Account Activation'), findsOneWidget);
        expect(
          find.text('This verification link expires in 24 hours.'),
          findsOneWidget,
        );
        expect(find.text('Delivery is slightly delayed.'), findsOneWidget);
        expect(find.text('Go to Sign In'), findsOneWidget);
      },
    );
  });
}
