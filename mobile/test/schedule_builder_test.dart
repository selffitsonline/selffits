import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/public/presentation/public_home_screen.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';

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

Map<String, dynamic> createAuthoritativeScheduleBuilderJson() {
  return {
    'updatedAt': '2026-10-17T12:00:00.000Z',
    'currencyNotice':
        'Prices in USD (\$) and INR (₹) synchronized with live academy administration.',
    'checkoutBaseUrl': 'https://selffits.com/checkout',
    'martialArtsTypes': [
      {'id': 'karate', 'label': 'Karate'},
      {'id': 'kick-boxing', 'label': 'Kick Boxing'},
      {'id': 'taekwondo', 'label': 'Taekwondo'},
      {'id': 'tai-chi', 'label': 'Tai Chi'},
      {'id': 'weapons-only', 'label': 'Weapons Only'},
    ],
    'dietNutrition': {
      'title': 'Diet & Nutrition Program',
      'description':
          'Personalized performance meal plan & calorie macro breakdown.',
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
        'description': 'Structured Karate & discipline for young champions.',
        'membershipPlans': [
          {
            'daysPerWeek': 1,
            'monthlyPriceUSD': 25.0,
            'monthlyPriceINR': 1999.0,
            'label': '1 Day / Week',
            'badge': null,
            'activeStatus': true,
            'curriculum': ['Breathing & meditation', 'Warm-up routine'],
          },
          {
            'daysPerWeek': 2,
            'monthlyPriceUSD': 40.0,
            'monthlyPriceINR': 3199.0,
            'label': '2 Days / Week',
            'badge': null,
            'activeStatus': true,
            'curriculum': ['Stances and kicks', 'Flexibility drills'],
          },
          {
            'daysPerWeek': 3,
            'monthlyPriceUSD': 55.0,
            'monthlyPriceINR': 4399.0,
            'label': '3 Days / Week',
            'badge': 'MOST POPULAR',
            'activeStatus': true,
            'curriculum': ['Self-defense strikes', 'Kata patterns'],
          },
          {
            'daysPerWeek': 4,
            'monthlyPriceUSD': 70.0,
            'monthlyPriceINR': 5599.0,
            'label': '4 Days / Week',
            'badge': null,
            'activeStatus': true,
            'curriculum': ['Sparring technique', 'Reaction speed'],
          },
          {
            'daysPerWeek': 5,
            'monthlyPriceUSD': 85.0,
            'monthlyPriceINR': 6799.0,
            'label': '5 Days / Week',
            'badge': 'BEST VALUE',
            'activeStatus': true,
            'curriculum': ['Master combinations', 'Belt exam preparation'],
          },
        ],
        'batchTimings': [
          {
            'id': 'mma-kids-b1',
            'batchName': '1st Batch',
            'startTime': '11:00 AM',
            'endTime': '12:00 PM',
            'timezone': 'GMT (UTC+0)',
            'displayLabel': '11:00 AM to 12:00 PM',
            'activeStatus': true,
          },
          {
            'id': 'mma-kids-b2',
            'batchName': '2nd Batch',
            'startTime': '02:30 PM',
            'endTime': '03:30 PM',
            'timezone': 'GMT (UTC+0)',
            'displayLabel': '02:30 PM to 03:30 PM',
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
      {
        'id': 'fitness_adults',
        'category': 'fitness',
        'group': 'adults',
        'title': 'Adult Fitness & Weight Management',
        'targetAudience': 'Adults (All Levels)',
        'description': 'High-intensity metabolic interval training.',
        'membershipPlans': [
          {
            'daysPerWeek': 1,
            'monthlyPriceUSD': 20.0,
            'monthlyPriceINR': 1599.0,
            'label': '1 Day / Week',
            'badge': null,
            'activeStatus': true,
            'curriculum': ['HIIT warmup', 'Core conditioning'],
          },
          {
            'daysPerWeek': 3,
            'monthlyPriceUSD': 50.0,
            'monthlyPriceINR': 3999.0,
            'label': '3 Days / Week',
            'badge': 'MOST POPULAR',
            'activeStatus': true,
            'curriculum': ['Calorie burner', 'Tabata sets'],
          },
        ],
        'batchTimings': [
          {
            'id': 'fit-b1',
            'batchName': 'Morning Shred',
            'startTime': '06:00 AM',
            'endTime': '07:00 AM',
            'timezone': 'GMT (UTC+0)',
            'displayLabel': '06:00 AM to 07:00 AM',
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
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
          {
            'dayName': 'Wednesday',
            'selectable': false,
            'restDay': true,
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
            'selectable': true,
            'restDay': false,
            'activeStatus': true,
          },
          {
            'dayName': 'Saturday',
            'selectable': false,
            'restDay': true,
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

  group('Interactive Schedule Builder Comprehensive Tests', () {
    testWidgets('Full Interactive Schedule Builder User Journey', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final storage = InMemorySecureStorageService();
      final mockClient = MockHttpClient((request) async {
        if (request.url.path.contains('/api/v1/public/catalog')) {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': createAuthoritativeScheduleBuilderJson(),
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('Not Found', 404);
      });

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            secureStorageProvider.overrideWithValue(storage),
            apiClientProvider.overrideWithValue(
              ApiClient(httpClient: mockClient),
            ),
          ],
          child: const MaterialApp(home: Scaffold(body: PublicHomeScreen())),
        ),
      );

      await tester.pumpAndSettle();

      // 1. Verify Top Section & Header
      expect(find.text('Explore Programs & Weekly Schedule'), findsOneWidget);
      expect(find.text('INTERACTIVE SCHEDULE BUILDER'), findsOneWidget);

      // 2. Verify Category Controls
      expect(find.text('Mixed Martial Arts'), findsWidgets);
      expect(find.text('Fitness & Weight'), findsOneWidget);

      // 3. Verify Martial Arts Type Chips
      expect(find.text('Karate'), findsWidgets);
      expect(find.text('Kick Boxing'), findsOneWidget);
      expect(find.text('Taekwondo'), findsOneWidget);

      // Tap on Kick Boxing
      await tester.ensureVisible(find.text('Kick Boxing'));
      await tester.tap(find.text('Kick Boxing'));
      await tester.pumpAndSettle();

      // 4. Verify Audience Tabs
      expect(find.text('Kids'), findsOneWidget);
      expect(find.text('Adults Mix'), findsOneWidget);
      expect(find.text('Ladies Only'), findsOneWidget);

      // 5. Verify Step 1: Frequency Cards & Prices
      expect(find.text('Select Weekly Training Frequency'), findsOneWidget);
      expect(find.text('\$25'), findsWidgets);
      expect(find.text('\$40'), findsOneWidget);
      expect(find.text('\$55'), findsOneWidget);
      expect(find.text('MOST POPULAR'), findsOneWidget);
      expect(find.text('BEST VALUE'), findsOneWidget);

      // Tap 3 Days / Week
      await tester.ensureVisible(find.text('3 Days'));
      await tester.tap(find.text('3 Days'));
      await tester.pumpAndSettle();

      // 6. Verify Step 2: Training Days & Rest Day Badges
      await tester.ensureVisible(find.text('TUE'));
      expect(find.text('REST DAY'), findsNWidgets(2)); // Tuesday & Friday
      expect(find.text('TUE'), findsOneWidget);
      expect(find.text('FRI'), findsOneWidget);

      // Tuesday is a rest day, tapping it must not select it
      await tester.tap(find.text('TUE'), warnIfMissed: false);
      await tester.pumpAndSettle();

      // Tap Monday and Wednesday to complete 3 days
      await tester.ensureVisible(find.text('MON'));
      await tester.tap(find.text('MON'));
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('WED'));
      await tester.tap(find.text('WED'));
      await tester.pumpAndSettle();

      // 7. Verify Step 3: Class Batch Timings
      await tester.ensureVisible(find.text('02:30 PM to 03:30 PM'));
      expect(find.text('1st Batch'), findsOneWidget);
      expect(find.text('2nd Batch'), findsOneWidget);
      expect(find.text('02:30 PM to 03:30 PM'), findsOneWidget);

      // Tap 2nd Batch
      await tester.tap(find.text('02:30 PM to 03:30 PM'));
      await tester.pumpAndSettle();

      // 8. Verify Step 4: Curriculum Accordion Expand/Collapse
      await tester.ensureVisible(find.text('Curriculum Syllabus (3 Day Plan)'));
      expect(find.text('Curriculum Syllabus (3 Day Plan)'), findsOneWidget);
      await tester.tap(find.text('Curriculum Syllabus (3 Day Plan)'));
      await tester.pumpAndSettle();
      expect(find.text('Self-defense strikes'), findsOneWidget);
      expect(find.text('Kata patterns'), findsOneWidget);

      // 9. Verify Step 5: Diet & Nutrition Program Add-on
      await tester.ensureVisible(
        find.text('Diet & Nutrition Program (Optional)'),
      );
      expect(find.text('Diet & Nutrition Program (Optional)'), findsOneWidget);
      expect(find.text('+\$10'), findsOneWidget);
      expect(find.text('Proceed to Enrollment (\$55)'), findsOneWidget);

      // Toggle Diet Add-on ON
      await tester.tap(find.text('Diet & Nutrition Program (Optional)'));
      await tester.pumpAndSettle();

      // Total price should increase from $55 to $65
      await tester.ensureVisible(find.text('Proceed to Enrollment (\$65)'));
      expect(find.text('Proceed to Enrollment (\$65)'), findsOneWidget);
      expect(find.text('\$65'), findsWidgets);

      // 10. Switch to 5 Days / Week -> auto-selects all 5 active days
      await tester.ensureVisible(find.text('5 Days'));
      await tester.tap(find.text('5 Days'));
      await tester.pumpAndSettle();

      // Price for 5 days ($85) + Diet ($10) = $95
      await tester.ensureVisible(find.text('Proceed to Enrollment (\$95)'));
      expect(find.text('Proceed to Enrollment (\$95)'), findsOneWidget);
    });
  });
}
