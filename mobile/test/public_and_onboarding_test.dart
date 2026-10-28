import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/app.dart';
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/presentation/student_login_screen.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/onboarding/presentation/onboarding_screen.dart';
import 'package:selffits_mobile/features/public/models/public_catalog.dart';
import 'package:selffits_mobile/features/public/presentation/account_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_home_screen.dart';
import 'package:selffits_mobile/features/public/presentation/public_main_shell.dart';
import 'package:selffits_mobile/features/public/presentation/widgets/martial_arts_journey_section.dart';
import 'package:selffits_mobile/features/public/presentation/widgets/explore_programs_section.dart';
import 'package:selffits_mobile/features/public/repositories/catalog_repository.dart';

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

Map<String, dynamic> createSampleCatalogJson() {
  return {
    'updatedAt': '2026-10-16T12:00:00.000Z',
    'currencyNotice':
        'Prices in USD (\$) and INR (₹) synchronized with live academy administration.',
    'checkoutBaseUrl': 'https://selffits.com/checkout',
    'categories': [
      {
        'id': 'mma_kids',
        'category': 'mma',
        'group': 'kids',
        'title': 'Mixed Martial Arts (Kids)',
        'targetAudience': 'Kids (Ages 5-14)',
        'description': 'Discipline, self-defense, agility and focus.',
        'membershipPlans': [
          {
            'daysPerWeek': 2,
            'monthlyPriceUSD': 29.0,
            'monthlyPriceINR': 2499.0,
            'label': '2 Days / Week',
            'badge': 'Standard',
            'activeStatus': true,
            'curriculum': ['2 live classes weekly', 'Form assessment'],
          },
          {
            'daysPerWeek': 4,
            'monthlyPriceUSD': 49.0,
            'monthlyPriceINR': 3999.0,
            'label': '4 Days / Week',
            'badge': 'Most Popular',
            'activeStatus': true,
            'curriculum': ['4 live classes weekly', 'Full belt curriculum'],
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
        'batchTimings': [
          {
            'id': 'timing-1',
            'batchName': 'Batch A (IST Evening)',
            'startTime': '17:00',
            'endTime': '18:00',
            'timezone': 'IST',
            'displayLabel': '5:00 PM - 6:00 PM IST',
            'activeStatus': true,
          },
        ],
      },
      {
        'id': 'mma_adults',
        'category': 'mma',
        'group': 'adults',
        'title': 'MMA & Conditioning (Adults)',
        'targetAudience': 'Adults (15+)',
        'description': 'Combat conditioning and tactical self-defense.',
        'membershipPlans': [
          {
            'daysPerWeek': 3,
            'monthlyPriceUSD': 39.0,
            'monthlyPriceINR': 3499.0,
            'label': '3 Days / Week',
            'badge': null,
            'activeStatus': true,
            'curriculum': ['3 live classes weekly'],
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
        'batchTimings': [],
      },
    ],
    'martialArtsTypes': [
      {'id': 'mma', 'label': 'Mixed Martial Arts'},
    ],
    'dietNutrition': {
      'title': 'Diet & Nutrition Program',
      'description': 'Personalized meal plan.',
      'priceUSD': 10.0,
      'activeStatus': true,
    },
  };
}

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('Public & Onboarding Module: Model & Repository Unit Tests', () {
    test(
      'PublicCatalogData deserializes correctly from authoritative JSON',
      () {
        final json = createSampleCatalogJson();
        final catalog = PublicCatalogData.fromJson(json);

        expect(catalog.checkoutBaseUrl, 'https://selffits.com/checkout');
        expect(catalog.categories.length, 2);

        final kids = catalog.categories.first;
        expect(kids.id, 'mma_kids');
        expect(kids.title, 'Mixed Martial Arts (Kids)');
        expect(kids.membershipPlans.length, 2);
        expect(kids.membershipPlans.first.monthlyPriceINR, 2499.0);
        expect(kids.membershipPlans.first.monthlyPriceUSD, 29.0);
        expect(kids.membershipPlans[1].badge, 'Most Popular');
      },
    );

    test(
      'PublicBeltSyllabusSection deserializes mobile-resolved description correctly',
      () {
        final json = {
          'headingBadge': 'BELT PROGRESSION SYLLABUS',
          'headingTitle': 'Your Martial Arts Learning Journey',
          'headingSubtitle':
              'Custom short mobile description for martial arts.',
          'belts': [
            {
              'id': 'white_belt',
              'name': 'White Belt',
              'subtitle': 'Fundamentals',
              'isEnabled': true,
              'syllabus': ['Stance basics'],
            },
          ],
        };
        final section = PublicBeltSyllabusSection.fromJson(json);
        expect(
          section.headingSubtitle,
          'Custom short mobile description for martial arts.',
        );
        expect(section.belts.length, 1);
        expect(section.belts.first.name, 'White Belt');
      },
    );

    testWidgets(
      'MartialArtsJourneySection displays resolved mobile description in UI',
      (WidgetTester tester) async {
        const testSection = PublicBeltSyllabusSection(
          headingBadge: 'BELT PROGRESSION SYLLABUS',
          headingTitle: 'Your Martial Arts Learning Journey',
          headingSubtitle: 'Custom short mobile description for martial arts.',
          belts: [
            PublicBeltItem(
              id: 'white_belt',
              name: 'White Belt',
              subtitle: 'Fundamentals',
              isEnabled: true,
              syllabus: ['Stance basics'],
            ),
          ],
        );

        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: MartialArtsJourneySection(
                  syllabusData: testSection,
                  onExploreMartialArts: () {},
                ),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(
          find.text('Custom short mobile description for martial arts.'),
          findsOneWidget,
        );
        expect(find.text('Your Martial Arts Learning Journey'), findsOneWidget);
        expect(find.text('White Belt'), findsWidgets);
      },
    );

    testWidgets(
      'ExploreProgramsSection renders SizedBox.shrink when sectionData is null and never renders fake hardcoded prices',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: ExploreProgramsSection(
                sectionData: null,
                onSelectProgram: (_, _) {},
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Explore Our Programs'), findsNothing);
        expect(find.textContaining('Kids Martial Arts'), findsNothing);
        expect(find.textContaining('\$25'), findsNothing);
      },
    );

    testWidgets(
      'ExploreProgramsSection renders real program items when provided',
      (WidgetTester tester) async {
        const testSection = PublicFeaturedProgramsSection(
          headingBadge: 'PATHWAYS',
          headingTitle: 'Explore Our Programs',
          headingSubtitle: 'Live online pathways',
          items: [
            PublicFeaturedProgram(
              id: 'p1',
              title: 'Real Server Program',
              category: 'MARTIAL ARTS',
              image: '/images/real.png',
              description: 'Authentic description from backend',
              classes: '12 classes',
              duration: '3 days/wk',
              priceStartsUSD: '35',
              targetCategory: 'mma',
              targetAudience: 'adults',
              href: '/programs/p1',
            ),
          ],
        );

        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: ExploreProgramsSection(
                  sectionData: testSection,
                  onSelectProgram: (_, _) {},
                ),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Explore Our Programs'), findsOneWidget);
        expect(find.text('Real Server Program'), findsOneWidget);
        expect(find.text('\$35 / mo'), findsOneWidget);
      },
    );

    test('CatalogRepository loads from API and saves to cache', () async {
      final storage = InMemorySecureStorageService();
      final mockClient = MockHttpClient((request) async {
        if (request.url.path.contains('/catalog')) {
          return http.Response(
            jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('Not Found', 404);
      });

      final apiClient = ApiClient(httpClient: mockClient);
      final repo = CatalogRepository(apiClient: apiClient, storage: storage);

      final result = await repo.getCatalog();
      expect(result.data?.categories.length, 2);
      expect(result.isFromCache, isFalse);

      // Verify cached in storage
      final cachedJson = await storage.getCachedCatalog();
      expect(cachedJson, isNotNull);
      expect(cachedJson!.contains('mma_kids'), isTrue);
    });

    test('CatalogRepository falls back to cached data when offline', () async {
      final storage = InMemorySecureStorageService();
      // Pre-populate cached catalog
      await storage.saveCachedCatalog(jsonEncode(createSampleCatalogJson()));

      final mockClient = MockHttpClient((request) async {
        // Network failure
        return http.Response('Server Error', 500);
      });

      final apiClient = ApiClient(httpClient: mockClient);
      final repo = CatalogRepository(apiClient: apiClient, storage: storage);

      final result = await repo.getCatalog();
      expect(result.data?.categories.length, 2);
      expect(result.isFromCache, isTrue); // Served from cache
    });
  });

  group('Public & Onboarding Module: Onboarding Flow Widget Tests', () {
    testWidgets(
      'First launch displays Slide 1 and allows Next button progression',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();

        await tester.pumpWidget(
          ProviderScope(
            overrides: [secureStorageProvider.overrideWithValue(storage)],
            child: const MaterialApp(home: OnboardingScreen()),
          ),
        );
        await tester.pumpAndSettle();

        // Slide 1 verification
        expect(find.text('Welcome to SELFFITS'), findsOneWidget);
        expect(find.text('Skip'), findsOneWidget);
        expect(find.text('Next'), findsOneWidget);

        // Advance to Slide 2
        await tester.tap(find.text('Next'));
        await tester.pumpAndSettle();

        expect(find.text('Live Classes & Coaching'), findsOneWidget);
        expect(find.text('Next'), findsOneWidget);

        // Advance to Slide 3
        await tester.tap(find.text('Next'));
        await tester.pumpAndSettle();

        expect(find.text('Start Your Training Journey'), findsOneWidget);
        expect(find.text('Get Started'), findsOneWidget);
        expect(find.text('Next'), findsNothing);
      },
    );

    testWidgets(
      'Get Started on Slide 3 completes onboarding and persists flag',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();

        await tester.pumpWidget(
          ProviderScope(
            overrides: [secureStorageProvider.overrideWithValue(storage)],
            child: const SelffitsApp(),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        expect(find.byType(OnboardingScreen), findsOneWidget);

        // Advance to Slide 2
        await tester.tap(find.text('Next'));
        await tester.pumpAndSettle();

        // Advance to Slide 3
        await tester.tap(find.text('Next'));
        await tester.pumpAndSettle();

        // Tap Get Started
        await tester.tap(find.text('Get Started'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        // Reaches PublicMainShell
        expect(find.byType(PublicMainShell), findsOneWidget);
        expect(await storage.hasCompletedOnboarding(), isTrue);
      },
    );

    testWidgets(
      'Skip on Slide 1 completes onboarding and reaches PublicMainShell',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();

        await tester.pumpWidget(
          ProviderScope(
            overrides: [secureStorageProvider.overrideWithValue(storage)],
            child: const SelffitsApp(),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        expect(find.byType(OnboardingScreen), findsOneWidget);

        // Tap Skip
        await tester.tap(find.text('Skip'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        // Reaches PublicMainShell
        expect(find.byType(PublicMainShell), findsOneWidget);
        expect(await storage.hasCompletedOnboarding(), isTrue);
      },
    );

    testWidgets(
      'Returning guest directly enters PublicMainShell without onboarding',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();
        await storage.setCompletedOnboarding(true);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [secureStorageProvider.overrideWithValue(storage)],
            child: const SelffitsApp(),
          ),
        );
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));

        expect(find.byType(PublicMainShell), findsOneWidget);
        expect(find.byType(OnboardingScreen), findsNothing);
      },
    );
  });

  group('Public & Onboarding Module: Two-Tab Shell & Public Home Tests', () {
    testWidgets('PublicMainShell contains exactly two tabs: Home and Account', (
      WidgetTester tester,
    ) async {
      final storage = InMemorySecureStorageService();
      await storage.setCompletedOnboarding(true);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [secureStorageProvider.overrideWithValue(storage)],
          child: const MaterialApp(home: PublicMainShell()),
        ),
      );
      await tester.pumpAndSettle();

      final bottomNavFinder = find.byType(BottomNavigationBar);
      expect(bottomNavFinder, findsOneWidget);

      final BottomNavigationBar bottomNav = tester.widget(bottomNavFinder);
      expect(bottomNav.items.length, 2);
      expect(bottomNav.items[0].label, 'Home');
      expect(bottomNav.items[1].label, 'Account');
    });

    testWidgets(
      'Switching between Home and Account tabs updates view cleanly',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();
        await storage.setCompletedOnboarding(true);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [secureStorageProvider.overrideWithValue(storage)],
            child: const MaterialApp(home: PublicMainShell()),
          ),
        );
        await tester.pumpAndSettle();

        // Initially on Home (index 0)
        expect(find.byType(PublicHomeScreen), findsOneWidget);
        expect(find.byType(AccountScreen), findsNothing);

        // Tap Account tab specifically on BottomNavigationBar
        final accountTab = find.descendant(
          of: find.byType(BottomNavigationBar),
          matching: find.text('Account'),
        );
        await tester.tap(accountTab);
        await tester.pumpAndSettle();

        // Now on Account tab (index 1)
        expect(find.byType(AccountScreen), findsOneWidget);
        expect(find.byType(StudentLoginScreen), findsOneWidget);

        // Tap Home tab
        final homeTab = find.descendant(
          of: find.byType(BottomNavigationBar),
          matching: find.text('Home'),
        );
        await tester.tap(homeTab);
        await tester.pumpAndSettle();

        // Back on Home tab
        expect(find.byType(PublicHomeScreen), findsOneWidget);
      },
    );

    testWidgets(
      'PublicHomeScreen renders catalog data, categories, and live pricing',
      (WidgetTester tester) async {
        final mockClient = MockHttpClient((request) async {
          if (request.url.path.contains('/catalog')) {
            return http.Response(
              jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response('Not Found', 404);
        });

        final storage = InMemorySecureStorageService();

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

        // Header banner
        expect(find.text('Explore Programs & Weekly Schedule'), findsOneWidget);

        // Category selection dock
        expect(find.text('Mixed Martial Arts'), findsWidgets);
        expect(find.text('Fitness & Weight'), findsOneWidget);
        expect(find.text('Kids'), findsOneWidget);
        expect(find.text('Adults Mix'), findsOneWidget);
        expect(find.text('Ladies Only'), findsOneWidget);

        // Interactive Schedule Builder Steps
        expect(find.text('Select Weekly Training Frequency'), findsOneWidget);
        expect(find.textContaining('Select Batch Timing'), findsOneWidget);
        expect(find.text('Enrollment Schedule Summary'), findsOneWidget);

        // Membership plans and authoritative prices
        expect(find.text('\$29'), findsWidgets);
        expect(find.text('\$49'), findsOneWidget);
        expect(find.text('Most Popular'), findsOneWidget);
      },
    );

    testWidgets(
      'PublicHomeScreen shows offline indicator when catalog is served from cache',
      (WidgetTester tester) async {
        final storage = InMemorySecureStorageService();
        // Pre-seed cached catalog
        await storage.saveCachedCatalog(jsonEncode(createSampleCatalogJson()));

        // Offline client
        final mockClient = MockHttpClient((request) async {
          return http.Response('Offline Error', 503);
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

        // Cache notice banner
        expect(find.textContaining('cached academy pricing'), findsOneWidget);
        // Data still rendered from cache
        expect(find.text('Explore Programs & Weekly Schedule'), findsOneWidget);
        expect(find.text('\$29'), findsWidgets);
      },
    );

    test(
      'CatalogRepository forceRefresh sends cache-busting query and headers',
      () async {
        final storage = InMemorySecureStorageService();
        http.BaseRequest? capturedRequest;

        final mockClient = MockHttpClient((request) async {
          capturedRequest = request;
          return http.Response(
            jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final repository = CatalogRepository(
          apiClient: ApiClient(httpClient: mockClient),
          storage: storage,
        );
        repository.clearMemoryCache();

        // 1. Normal request (forceRefresh = false)
        final normalResult = await repository.getCatalog(forceRefresh: false);
        expect(normalResult.data, isNotNull);
        expect(normalResult.isFromCache, isFalse);
        expect(capturedRequest?.url.queryParameters.containsKey('t'), isFalse);
        expect(capturedRequest?.headers.containsKey('cache-control'), isFalse);

        // 2. Force refresh (forceRefresh = true)
        final refreshResult = await repository.getCatalog(forceRefresh: true);
        expect(refreshResult.data, isNotNull);
        expect(refreshResult.isFromCache, isFalse);
        expect(capturedRequest?.url.queryParameters.containsKey('t'), isTrue);
        expect(capturedRequest?.headers['cache-control'], contains('no-cache'));
        expect(capturedRequest?.headers['pragma'], equals('no-cache'));

        // 3. Force refresh offline fallback
        final offlineClient = MockHttpClient((request) async {
          return http.Response('Offline Error', 503);
        });
        final offlineRepo = CatalogRepository(
          apiClient: ApiClient(httpClient: offlineClient),
          storage: storage,
        );
        offlineRepo.clearMemoryCache();
        final offlineResult = await offlineRepo.getCatalog(forceRefresh: true);
        expect(offlineResult.isFromCache, isTrue);
        expect(offlineResult.data, isNotNull);
      },
    );

    test('CatalogRepository reuses in-memory cache without repeating network call', () async {
      final storage = InMemorySecureStorageService();
      int networkCallCount = 0;

      final mockClient = MockHttpClient((request) async {
        networkCallCount++;
        return http.Response(
          jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final repository = CatalogRepository(
        apiClient: ApiClient(httpClient: mockClient),
        storage: storage,
      );
      repository.clearMemoryCache();

      // 1. First call: hits network
      final result1 = await repository.getCatalog();
      expect(result1.data, isNotNull);
      expect(networkCallCount, equals(1));
      expect(repository.isMemoryCacheValid, isTrue);
      expect(repository.memoryCachedData, isNotNull);

      // 2. Second call: instant memory return, 0 network calls
      final result2 = await repository.getCatalog();
      expect(result2.data, isNotNull);
      expect(networkCallCount, equals(1)); // Still exactly 1!

      // 3. getCachedData returns memory cache immediately
      final cachedResult = await repository.getCachedData();
      expect(cachedResult, isNotNull);
      expect(networkCallCount, equals(1));
    });

    test('CatalogRepository deduplicates concurrent in-flight requests', () async {
      final storage = InMemorySecureStorageService();
      int networkCallCount = 0;

      final mockClient = MockHttpClient((request) async {
        networkCallCount++;
        await Future.delayed(const Duration(milliseconds: 50));
        return http.Response(
          jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final repository = CatalogRepository(
        apiClient: ApiClient(httpClient: mockClient),
        storage: storage,
      );
      repository.clearMemoryCache();

      // Fire 3 concurrent calls simultaneously
      final futures = await Future.wait([
        repository.getCatalog(),
        repository.getCatalog(),
        repository.getCatalog(),
      ]);

      // Exactly 1 network call occurred
      expect(networkCallCount, equals(1));
      expect(futures[0].data, isNotNull);
      expect(futures[1].data, isNotNull);
      expect(futures[2].data, isNotNull);
    });

    test('CatalogRepository clearMemoryCache cleanly resets state', () async {
      final storage = InMemorySecureStorageService();
      final mockClient = MockHttpClient((request) async {
        return http.Response(
          jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final repository = CatalogRepository(
        apiClient: ApiClient(httpClient: mockClient),
        storage: storage,
      );
      repository.clearMemoryCache();

      await repository.getCatalog();
      expect(repository.isMemoryCacheValid, isTrue);

      repository.clearMemoryCache();
      expect(repository.isMemoryCacheValid, isFalse);
      expect(repository.memoryCachedData, isNull);
    });

    test('CatalogRepository forceRefresh bypasses memory cache', () async {
      final storage = InMemorySecureStorageService();
      int networkCallCount = 0;

      final mockClient = MockHttpClient((request) async {
        networkCallCount++;
        return http.Response(
          jsonEncode({'success': true, 'data': createSampleCatalogJson()}),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final repository = CatalogRepository(
        apiClient: ApiClient(httpClient: mockClient),
        storage: storage,
      );
      repository.clearMemoryCache();

      // 1. Initial call
      await repository.getCatalog();
      expect(networkCallCount, equals(1));

      // 2. Normal call within TTL: served from memory
      await repository.getCatalog(forceRefresh: false);
      expect(networkCallCount, equals(1));

      // 3. Force refresh: bypasses memory cache and hits server
      await repository.getCatalog(forceRefresh: true);
      expect(networkCallCount, equals(2));
    });
  });
}
