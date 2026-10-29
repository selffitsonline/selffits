import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/public/models/public_catalog.dart';
import 'package:selffits_mobile/features/public/presentation/public_home_screen.dart';
import 'package:selffits_mobile/features/public/presentation/widgets/become_coach_section.dart';
import 'package:selffits_mobile/features/public/presentation/widgets/master_coaches_section.dart';

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

  group('Become a SELFFITS Coach Section: Model & Widget Tests', () {
    test('PublicBecomeCoachSection deserializes correctly from JSON', () {
      final json = {
        'isEnabled': true,
        'badgeText': 'Instructor Recruitment',
        'heading': 'BECOME A SELFFITS COACH',
        'description':
            'Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.',
        'buttonText': 'BECOME A COACH',
        'buttonLink': '/become-coach',
      };

      final section = PublicBecomeCoachSection.fromJson(json);
      expect(section.isEnabled, isTrue);
      expect(section.badgeText, 'Instructor Recruitment');
      expect(section.heading, 'BECOME A SELFFITS COACH');
      expect(
        section.description,
        contains('qualified fitness or martial arts instructor'),
      );
      expect(section.buttonText, 'BECOME A COACH');
      expect(section.buttonLink, '/become-coach');
      expect(section.toJson(), json);
    });

    test('PublicBecomeCoachSection provides robust defaults', () {
      final section = PublicBecomeCoachSection.fromJson({});
      expect(section.isEnabled, isTrue);
      expect(section.badgeText, 'Instructor Recruitment');
      expect(section.heading, 'BECOME A SELFFITS COACH');
      expect(section.buttonText, 'BECOME A COACH');
      expect(section.buttonLink, '/become-coach');
    });

    test('PublicCatalogData deserializes becomeCoachSection', () {
      final catalogJson = {
        'categories': [],
        'martialArtsTypes': [],
        'currencyNotice': 'USD',
        'checkoutBaseUrl': 'https://selffits.com/checkout',
        'updatedAt': '2026-10-25T16:00:00.000Z',
        'becomeCoachSection': {
          'isEnabled': true,
          'badgeText': 'Instructor Recruitment',
          'heading': 'BECOME A SELFFITS COACH',
          'description': 'Join our global faculty.',
          'buttonText': 'APPLY NOW',
          'buttonLink': '/become-coach',
        },
      };

      final catalog = PublicCatalogData.fromJson(catalogJson);
      expect(catalog.becomeCoachSection, isNotNull);
      expect(catalog.becomeCoachSection!.isEnabled, isTrue);
      expect(catalog.becomeCoachSection!.heading, 'BECOME A SELFFITS COACH');
      expect(catalog.becomeCoachSection!.buttonText, 'APPLY NOW');
    });

    testWidgets(
      'BecomeCoachSection renders dark charcoal card with recruitment details',
      (WidgetTester tester) async {
        const sectionData = PublicBecomeCoachSection(
          isEnabled: true,
          badgeText: 'Instructor Recruitment',
          heading: 'BECOME A SELFFITS COACH',
          description:
              'Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise.',
          buttonText: 'BECOME A COACH',
          buttonLink: '/become-coach',
        );

        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: BecomeCoachSection(recruitmentData: sectionData),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();

        // Badge check
        expect(find.text('INSTRUCTOR RECRUITMENT'), findsOneWidget);
        // Heading check
        expect(find.text('BECOME A SELFFITS COACH'), findsOneWidget);
        // Description check
        expect(
          find.text(
            'Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise.',
          ),
          findsOneWidget,
        );
        // Button check
        expect(find.text('BECOME A COACH'), findsOneWidget);
        expect(find.byIcon(Icons.arrow_forward_rounded), findsOneWidget);
        expect(find.byIcon(Icons.military_tech_rounded), findsOneWidget);

        // Verify card styling: dark charcoal #14161D
        final container = tester.widget<Container>(
          find.byType(Container).first,
        );
        final boxDecoration = container.decoration as BoxDecoration;
        expect(boxDecoration.color, equals(const Color(0xFF14161D)));
        expect(boxDecoration.borderRadius, equals(BorderRadius.circular(24)));
      },
    );

    testWidgets(
      'BecomeCoachSection respects admin isEnabled: false and hides',
      (WidgetTester tester) async {
        const sectionData = PublicBecomeCoachSection(
          isEnabled: false,
          badgeText: 'Instructor Recruitment',
          heading: 'BECOME A SELFFITS COACH',
          description: 'Test description',
          buttonText: 'BECOME A COACH',
          buttonLink: '/become-coach',
        );

        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: BecomeCoachSection(recruitmentData: sectionData),
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('BECOME A SELFFITS COACH'), findsNothing);
        expect(find.text('BECOME A COACH'), findsNothing);
      },
    );

    testWidgets(
      'Tapping BECOME A COACH button invokes callback without crashing',
      (WidgetTester tester) async {
        const sectionData = PublicBecomeCoachSection(
          isEnabled: true,
          badgeText: 'Instructor Recruitment',
          heading: 'BECOME A SELFFITS COACH',
          description: 'Join our faculty.',
          buttonText: 'BECOME A COACH',
          buttonLink: '/become-coach',
        );

        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: BecomeCoachSection(recruitmentData: sectionData),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();

        final buttonFinder = find.widgetWithText(
          ElevatedButton,
          'BECOME A COACH',
        );
        expect(buttonFinder, findsOneWidget);
        await tester.tap(buttonFinder);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
      },
    );

    testWidgets(
      'PublicHomeScreen renders BecomeCoachSection below MasterCoachesSection',
      (WidgetTester tester) async {
        final sampleCatalog = {
          'categories': [],
          'martialArtsTypes': [],
          'currencyNotice': 'USD',
          'checkoutBaseUrl': 'https://selffits.com/checkout',
          'updatedAt': '2026-10-25T16:00:00.000Z',
          'coachesSection': {
            'headingBadge': 'World Class Instructors',
            'headingTitle': 'Meet Our Master Coaches',
            'headingSubtitle': 'Learn from certified black belt instructors.',
            'items': [
              {
                'id': 'coach_1',
                'name': 'Sensei Rahul Sharma',
                'role': 'Head Martial Arts Instructor',
                'experience': '14+ Years Teaching',
                'rank': '4th Dan Black Belt',
                'rating': '4.9',
                'statusBadge': 'Live Form Evaluation Active',
                'image': '/images/adults_martial_arts.png',
                'bio': 'Master instructor.',
                'specialty': 'Martial Arts & Skills Progression',
              },
            ],
          },
          'becomeCoachSection': {
            'isEnabled': true,
            'badgeText': 'Instructor Recruitment',
            'heading': 'BECOME A SELFFITS COACH',
            'description':
                'Are you a qualified fitness or martial arts instructor? Join SELFFITS.',
            'buttonText': 'BECOME A COACH',
            'buttonLink': '/become-coach',
          },
        };

        final mockClient = MockHttpClient((request) async {
          return http.Response(
            jsonEncode({'success': true, 'data': sampleCatalog}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final storage = InMemorySecureStorageService();

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(
                ApiClient(httpClient: mockClient),
              ),
              secureStorageProvider.overrideWithValue(storage),
            ],
            child: const MaterialApp(home: Scaffold(body: PublicHomeScreen())),
          ),
        );
        await tester.pumpAndSettle();

        // Verify MasterCoachesSection is present
        expect(find.byType(MasterCoachesSection), findsOneWidget);
        expect(find.text('Meet Our Master Coaches'), findsOneWidget);

        // Verify BecomeCoachSection is present
        expect(find.byType(BecomeCoachSection), findsOneWidget);
        expect(find.text('BECOME A SELFFITS COACH'), findsOneWidget);

        // Verify vertical order: MasterCoachesSection appears above BecomeCoachSection
        final coachesY = tester
            .getTopLeft(find.byType(MasterCoachesSection))
            .dy;
        final becomeCoachY = tester
            .getTopLeft(find.byType(BecomeCoachSection))
            .dy;
        expect(becomeCoachY, greaterThan(coachesY));
      },
    );
  });
}
