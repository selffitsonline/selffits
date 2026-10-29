import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/design_system/design_system.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_exceptions.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/presentation/student_login_screen.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/public/presentation/enrollment_checkout_screen.dart';
import 'package:selffits_mobile/features/public/presentation/purchase_success_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_home_screen.dart';
import 'package:selffits_mobile/features/public/providers/catalog_provider.dart';

class MockHttpClient extends http.BaseClient {
  final Future<http.Response> Function(http.BaseRequest) handler;
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

Map<String, dynamic> createTestCatalogJson() {
  return {
    'updatedAt': '2026-10-17T12:00:00.000Z',
    'currencyNotice':
        'Prices in USD (\$) and INR (₹) synchronized with live academy administration.',
    'checkoutBaseUrl': 'https://selffits.com/checkout',
    'martialArtsTypes': [
      {'id': 'karate', 'label': 'Karate'},
      {'id': 'kick-boxing', 'label': 'Kick Boxing'},
    ],
    'dietNutrition': {
      'title': 'Diet & Nutrition Program',
      'description': 'Personalized meal plan.',
      'priceUSD': 10.0,
      'activeStatus': true,
    },
    'categories': [
      {
        'id': 'mma_kids',
        'category': 'mma',
        'group': 'kids',
        'title': 'Kids Martial Arts',
        'targetAudience': 'Kids (Ages 8–20)',
        'description': 'Structured Karate discipline.',
        'membershipPlans': [
          {
            'daysPerWeek': 1,
            'monthlyPriceUSD': 25.0,
            'monthlyPriceINR': 1999.0,
            'label': '1 Day / Week',
            'badge': null,
            'activeStatus': true,
            'curriculum': ['Stances', 'Focus'],
          },
          {
            'daysPerWeek': 3,
            'monthlyPriceUSD': 55.0,
            'monthlyPriceINR': 4399.0,
            'label': '3 Days / Week',
            'badge': 'MOST POPULAR',
            'activeStatus': true,
            'curriculum': ['Intermediate stances', 'Sparring'],
          },
        ],
        'batchTimings': [
          {
            'id': 'mma-kids-b1',
            'batchName': 'Junior Batch 1',
            'startTime': '04:00 PM',
            'endTime': '04:45 PM',
            'timezone': 'GMT (UTC+0)',
            'displayLabel': '04:00 PM – 04:45 PM',
            'activeStatus': true,
          },
        ],
        'trainingDays': [
          {
            'dayName': 'Sunday',
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
          {
            'dayName': 'Monday',
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
          {
            'dayName': 'Tuesday',
            'selectable': false,
            'restDay': true,
            'activeStatus': true,
          },
          {
            'dayName': 'Wednesday',
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
          {
            'dayName': 'Thursday',
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
          {
            'dayName': 'Friday',
            'selectable': false,
            'restDay': true,
            'activeStatus': true,
          },
          {
            'dayName': 'Saturday',
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
        ],
      },
    ],
  };
}

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('Enrollment and Checkout Flow Tests', () {
    testWidgets(
      'EnrollmentCheckoutScreen renders summary, pricing breakdown, and auto-fills test card',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'valid-jwt-token',
          userId: 'u1',
          email: 'student@selffits.com',
          name: 'Student',
          role: 'STUDENT',
        );
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: EnrollmentCheckoutScreen()),
          ),
        );
        // Initialize catalog in provider
        final element = tester.element(find.byType(EnrollmentCheckoutScreen));
        final container = ProviderScope.containerOf(element);
        await container.read(catalogProvider.notifier).loadCatalog();
        await tester.pumpAndSettle();

        // Check for Step 2 banner
        expect(find.text('Review Schedule & Checkout'), findsOneWidget);
        expect(find.text('STEP 2 OF 2'), findsOneWidget);

        // Check Price Breakdown card
        expect(find.text('Price Breakdown'), findsOneWidget);
        expect(find.text('Total Amount Due'), findsOneWidget);

        // Check Card Payment section
        expect(find.text('Card Payment'), findsOneWidget);
        expect(find.text('Auto-Fill Test Card'), findsOneWidget);

        // Tap Auto-Fill Test Card
        await tester.tap(find.text('Auto-Fill Test Card'));
        await tester.pumpAndSettle();

        expect(find.text('12/28'), findsWidgets);
        expect(find.text('123'), findsWidgets);
      },
    );

    testWidgets(
      'EnrollmentCheckoutScreen validates coupon and submits enrollment successfully',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/coupons/validate')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'code': 'SAVE10',
                  'discountType': 'FLAT',
                  'discountValue': 10.0,
                  'discountAmount': 10.0,
                  'finalAmount': 15.0,
                  'originalAmount': 25.0,
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/payments/create-order')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'orderId': 'test-order-123',
                  'amount': 15.0,
                  'currency': 'USD',
                  'keyId': 'rzp_test_key',
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/payments/test-checkout')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'razorpayOrderId': 'test-order-123',
                  'razorpayPaymentId': 'test-pay-123',
                  'razorpaySignature': 'valid_test_signature',
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/student/enroll')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'enrollmentId': 'test-enr-123',
                  'programTitle': 'Kids Martial Arts',
                  'tierName': '1 Day / Week Membership Plan',
                  'amountPaid': 15.0,
                  'currency': 'USD',
                  'status': 'ACTIVE',
                },
              }),
              201,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/student/dashboard')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'u1',
                    'name': 'Student',
                    'email': 'student@selffits.com',
                    'role': 'STUDENT',
                    'isBlocked': false,
                  },
                  'isEnrolled': true,
                  'enrollment': null,
                  'classReadiness': {
                    'hasBatch': false,
                    'isReady': false,
                    'nextSession': {},
                  },
                  'unreadNotificationsCount': 0,
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'valid-jwt-token',
          userId: 'u1',
          email: 'student@selffits.com',
          name: 'Student',
          role: 'STUDENT',
        );
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: EnrollmentCheckoutScreen()),
          ),
        );

        // Load catalog data into provider
        final element = tester.element(find.byType(EnrollmentCheckoutScreen));
        final container = ProviderScope.containerOf(element);
        await container.read(catalogProvider.notifier).loadCatalog();
        await tester.pumpAndSettle();

        // Enter coupon
        final couponField = find.byType(TextField).first;
        await tester.enterText(couponField, 'SAVE10');
        await tester.tap(find.text('Apply'));
        await tester.pumpAndSettle();

        // Verify coupon applied badge
        expect(find.textContaining('Coupon SAVE10 applied'), findsOneWidget);

        // Auto-fill test card
        await tester.tap(find.text('Auto-Fill Test Card'));
        await tester.pumpAndSettle();

        // Tap Confirm Enrollment
        await tester.tap(find.textContaining('Pay & Confirm Enrollment'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 600));

        // Verify full-screen confirmation with intended contact message
        expect(find.byType(PurchaseSuccessScreen), findsOneWidget);
        expect(find.text('Enrollment Confirmed!'), findsOneWidget);
        expect(
          find.textContaining('Thank you! Our team will contact you soon.'),
          findsOneWidget,
        );
        expect(find.textContaining('Go to Student Dashboard'), findsOneWidget);
      },
    );

    testWidgets(
      'User clicking Proceed to Enrollment opens native EnrollmentCheckoutScreen',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'auth-test-token',
          userId: 'u1',
          email: 'student@selffits.com',
          name: 'Student',
          role: 'STUDENT',
        );
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: PublicHomeScreen()),
          ),
        );
        await tester.pumpAndSettle();

        // Scroll down to Checkout CTA button
        await tester.drag(
          find.byType(SingleChildScrollView).first,
          const Offset(0, -1200),
        );
        await tester.pumpAndSettle();

        final ctaFinder = find.byWidgetPredicate(
          (widget) =>
              widget is AppButton &&
              widget.label.contains('Proceed to Enrollment'),
        );
        expect(ctaFinder, findsOneWidget);

        // Tap Proceed to Enrollment
        await tester.tap(ctaFinder);
        await tester.pumpAndSettle();

        // Verify native EnrollmentCheckoutScreen opened
        expect(find.byType(EnrollmentCheckoutScreen), findsOneWidget);
        expect(find.text('Review Schedule & Checkout'), findsOneWidget);
        expect(find.byTooltip('Back to Schedule'), findsOneWidget);
      },
    );

    testWidgets(
      'Unauthenticated customer clicking Proceed to Enrollment navigates to StudentLoginScreen',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: PublicHomeScreen()),
          ),
        );
        await tester.pumpAndSettle();

        await tester.drag(
          find.byType(SingleChildScrollView).first,
          const Offset(0, -1200),
        );
        await tester.pumpAndSettle();

        final ctaFinder = find.byWidgetPredicate(
          (widget) =>
              widget is AppButton &&
              widget.label.contains('Proceed to Enrollment'),
        );
        await tester.tap(ctaFinder);
        await tester.pumpAndSettle();

        expect(find.byType(StudentLoginScreen), findsOneWidget);
      },
    );

    test(
      'buildCheckoutUrl preserves all enrollment selections, martial arts type, diet addon, and pricing',
      () {
        final testContainer = ProviderContainer();
        addTearDown(testContainer.dispose);

        final notifier = testContainer.read(catalogProvider.notifier);

        // Verify buildCheckoutUrl with Adult MMA, Kick Boxing, 1 day/wk, Sunday, Diet add-on $10
        notifier.setProgramCategory('mma');
        notifier.setMartialArtsType('kick-boxing');
        notifier.setDaysPerWeek(1);
        notifier.toggleTrainingDay('Sunday');
        notifier.toggleDietNutrition();

        final checkoutUrl = notifier.buildCheckoutUrl(couponCode: 'SAVE10');
        final uri = Uri.parse(checkoutUrl);

        expect(uri.scheme, 'https');
        expect(uri.host, 'selffits.com');
        expect(uri.path, '/checkout');
        expect(uri.queryParameters['freq'], '1');
        expect(uri.queryParameters['days'], 'Sunday');
        expect(uri.queryParameters['type'], 'kick-boxing');
        expect(uri.queryParameters['dietAddon'], 'true');
        expect(uri.queryParameters['dietPrice'], '10');
        expect(uri.queryParameters['currency'], 'USD');
        expect(uri.queryParameters['plan'], 'plan-1-day');
        expect(uri.queryParameters['coupon'], 'SAVE10');
        expect(uri.queryParameters.containsKey('batch'), isTrue);
        expect(uri.queryParameters.containsKey('price'), isTrue);
      },
    );

    test(
      'ApiClient throws explicit 404 ApiException when server route returns 404 HTML',
      () async {
        final mockClient = MockHttpClient((request) async {
          return http.Response(
            '<!DOCTYPE html><html><body>404 Not Found</body></html>',
            404,
            headers: {'content-type': 'text/html'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);

        expect(
          () => apiClient.post('/api/v1/student/enroll', body: {'test': true}),
          throwsA(
            isA<ApiException>()
                .having((e) => e.statusCode, 'statusCode', 404)
                .having(
                  (e) => e.message,
                  'message',
                  'Server endpoint unavailable (HTTP 404).',
                ),
          ),
        );
      },
    );

    testWidgets(
      'Unsuccessful/cancelled browser checkout (isEnrolled: false) does not navigate to dashboard',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/student/dashboard')) {
            // Returns isEnrolled: false because user cancelled/closed browser
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'u1',
                    'name': 'Student',
                    'email': 'student@selffits.com',
                    'role': 'STUDENT',
                    'isBlocked': false,
                  },
                  'isEnrolled': false,
                  'enrollment': null,
                  'classReadiness': {
                    'hasBatch': false,
                    'isReady': false,
                    'nextSession': {},
                  },
                  'unreadNotificationsCount': 0,
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'valid-jwt-token',
          userId: 'u1',
          email: 'student@selffits.com',
          name: 'Student',
          role: 'STUDENT',
        );
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: EnrollmentCheckoutScreen()),
          ),
        );
        await tester.pumpAndSettle();

        // Submit button is present and enabled
        final submitFinder = find.widgetWithText(
          AppButton,
          'Pay & Confirm Enrollment (\$25)',
        );
        expect(submitFinder, findsOneWidget);
        final appButton = tester.widget<AppButton>(submitFinder);
        expect(appButton.onPressed, isNotNull);
      },
    );

    testWidgets(
      'Backend enrollment failure (HTTP 404) displays error banner and does not fabricate success',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/payments/create-order')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'orderId': 'test-order-123',
                  'amount': 25.0,
                  'currency': 'USD',
                  'keyId': 'rzp_test_key',
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/payments/test-checkout')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'razorpayOrderId': 'test-order-123',
                  'razorpayPaymentId': 'test-pay-123',
                  'razorpaySignature': 'valid_test_signature',
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/student/enroll')) {
            return http.Response(
              '<!DOCTYPE html><html><body>404 Not Found</body></html>',
              404,
              headers: {'content-type': 'text/html'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'valid-jwt-token',
          userId: 'u1',
          email: 'student@selffits.com',
          name: 'Student',
          role: 'STUDENT',
        );
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: EnrollmentCheckoutScreen()),
          ),
        );

        final element = tester.element(find.byType(EnrollmentCheckoutScreen));
        final container = ProviderScope.containerOf(element);
        await container.read(catalogProvider.notifier).loadCatalog();
        await tester.pumpAndSettle();

        // Auto-fill test card
        await tester.tap(find.text('Auto-Fill Test Card'));
        await tester.pumpAndSettle();

        // Submit payment
        await tester.tap(find.textContaining('Pay & Confirm Enrollment'));
        await tester.pump();
        await tester.pumpAndSettle();

        // Verify error banner is displayed and no false enrollment was created
        expect(find.textContaining('unavailable (HTTP 404)'), findsOneWidget);
        expect(find.text('Enrollment Confirmed!'), findsNothing);
      },
    );

    testWidgets(
      'Successful backend enrollment confirmation displays success modal with details',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/api/v1/public/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createTestCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/payments/create-order')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'orderId': 'test-order-123',
                  'amount': 25.0,
                  'currency': 'USD',
                  'keyId': 'rzp_test_key',
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/payments/test-checkout')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'razorpayOrderId': 'test-order-123',
                  'razorpayPaymentId': 'test-pay-123',
                  'razorpaySignature': 'valid_test_signature',
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/student/enroll')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'enrollmentId': 'enr_test_12345',
                  'programTitle': 'Kids Martial Arts',
                  'tierName': '1 Day / Week',
                  'totalClassesGranted': 4,
                  'remainingClasses': 4,
                  'startDate': DateTime.now().toIso8601String(),
                  'endDate': DateTime.now()
                      .add(const Duration(days: 30))
                      .toIso8601String(),
                  'status': 'ACTIVE',
                  'amountPaid': 25.0,
                  'currency': 'USD',
                  'martialArtsType': 'Karate',
                  'includeDietNutrition': false,
                  'batchName': 'Junior Batch 1',
                  'classTiming': '04:00 PM – 04:45 PM',
                  'daysPerWeek': 1,
                  'selectedDays': ['Sunday'],
                },
              }),
              201,
              headers: {'content-type': 'application/json'},
            );
          }
          if (request.url.path.contains('/api/v1/student/dashboard')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'u1',
                    'name': 'Student',
                    'email': 'student@selffits.com',
                    'role': 'STUDENT',
                  },
                  'isEnrolled': true,
                  'enrollment': null,
                  'classReadiness': {
                    'canJoinNow': false,
                    'isTodayClassDay': false,
                    'timeRemainingSeconds': 0,
                    'sessionTimeDisplay': 'None',
                  },
                  'unreadNotificationsCount': 0,
                },
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            '{"success": true}',
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();
        await storage.saveSession(
          token: 'valid-jwt-token',
          userId: 'u1',
          email: 'student@selffits.com',
          name: 'Student',
          role: 'STUDENT',
        );
        final apiClient = ApiClient(httpClient: mockClient);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(apiClient),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: EnrollmentCheckoutScreen()),
          ),
        );

        final element = tester.element(find.byType(EnrollmentCheckoutScreen));
        final container = ProviderScope.containerOf(element);
        await container.read(catalogProvider.notifier).loadCatalog();
        await tester.pumpAndSettle();

        // Auto-fill test card
        await tester.tap(find.text('Auto-Fill Test Card'));
        await tester.pumpAndSettle();

        // Submit payment
        await tester.tap(find.textContaining('Pay & Confirm Enrollment'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 600));

        // Verify dedicated full-screen PurchaseSuccessScreen is displayed per Requirement 4
        expect(find.byType(PurchaseSuccessScreen), findsOneWidget);
        expect(find.text('Enrollment Confirmed!'), findsOneWidget);
        expect(
          find.textContaining('Thank you! Our team will contact you soon.'),
          findsOneWidget,
        );
        expect(find.text('Kids Martial Arts'), findsOneWidget);
        expect(find.text('Go to Student Dashboard Now'), findsOneWidget);
      },
    );
  });
}
