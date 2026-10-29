import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:selffits_mobile/core/network/api_client.dart';
import 'package:selffits_mobile/core/network/api_endpoints.dart';
import 'package:selffits_mobile/core/storage/secure_storage_service.dart';
import 'package:selffits_mobile/features/auth/models/auth_state.dart';
import 'package:selffits_mobile/features/auth/models/auth_user.dart';
import 'package:selffits_mobile/features/auth/providers/auth_provider.dart';
import 'package:selffits_mobile/features/coach/presentation/coach_home_screen.dart';
import 'package:selffits_mobile/features/notifications/models/notification_item.dart';
import 'package:selffits_mobile/features/notifications/presentation/notification_badge_button.dart';
import 'package:selffits_mobile/features/notifications/presentation/notifications_screen.dart';
import 'package:selffits_mobile/features/notifications/providers/notification_provider.dart';
import 'package:selffits_mobile/features/notifications/services/deep_link_navigator.dart';
import 'package:selffits_mobile/features/notifications/services/fcm_push_service.dart';
import 'package:selffits_mobile/features/notifications/services/notification_service.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';

class MockHttpHandler {
  final Future<http.Response> Function(http.BaseRequest request) handler;
  MockHttpHandler(this.handler);
}

class TestClient extends http.BaseClient {
  final Future<http.Response> Function(http.BaseRequest request) _handler;
  TestClient(this._handler);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final response = await _handler(request);
    return http.StreamedResponse(
      Stream.value(response.bodyBytes),
      response.statusCode,
      headers: response.headers,
    );
  }
}

void main() {
  group('Module 6: NotificationItem & PushNotificationPayload Model Tests', () {
    test(
      'Correctly serializes and deserializes NotificationItem from JSON',
      () {
        final json = {
          'id': 'notif-123',
          'title': '15-Minute Class Reminder',
          'message': 'Advanced Muay Thai starts in 15 minutes.',
          'isRead': false,
          'createdAt': '2026-10-16T18:00:00.000Z',
          'type': 'class_reminder',
          'deepLink': 'selffits://class/live?batchId=batch-1',
          'meetingUrl': 'https://meet.google.com/abc-defg-hij',
          'batchId': 'batch-1',
        };

        final item = NotificationItem.fromJson(json);
        expect(item.id, 'notif-123');
        expect(item.title, '15-Minute Class Reminder');
        expect(item.isRead, false);
        expect(item.type, 'class_reminder');
        expect(item.meetingUrl, 'https://meet.google.com/abc-defg-hij');

        final serialized = item.toJson();
        expect(serialized['id'], 'notif-123');
        expect(serialized['type'], 'class_reminder');
      },
    );

    test('Correctly parses PushNotificationPayload from remote push data', () {
      final data = {
        'title': 'Schedule Change Notice',
        'body': 'Your class timing has moved to 7:00 PM GMT.',
        'type': 'schedule_change',
        'batchId': 'batch-2',
        'deepLink': 'selffits://dashboard/student',
      };

      final payload = PushNotificationPayload.fromData(data);
      expect(payload.title, 'Schedule Change Notice');
      expect(payload.body, 'Your class timing has moved to 7:00 PM GMT.');
      expect(payload.type, 'schedule_change');
      expect(payload.batchId, 'batch-2');
      expect(payload.deepLink, 'selffits://dashboard/student');
    });
  });

  group('Module 6: DeepLinkNavigator Route Resolution Tests', () {
    test('Parses selffits://class/live with meeting URL', () {
      const link =
          'selffits://class/live?batchId=batch-muay-thai&meetingUrl=https://meet.google.com/xyz-uvw-rst';
      final parsed = DeepLinkNavigator.parse(link);

      expect(parsed.action, DeepLinkAction.joinLiveClass);
      expect(parsed.batchId, 'batch-muay-thai');
      expect(parsed.meetingUrl, 'https://meet.google.com/xyz-uvw-rst');
    });

    test(
      'Parses selffits://dashboard/student and selffits://dashboard/coach',
      () {
        final studentLink = DeepLinkNavigator.parse(
          'selffits://dashboard/student',
        );
        expect(studentLink.action, DeepLinkAction.studentDashboard);

        final coachLink = DeepLinkNavigator.parse('selffits://dashboard/coach');
        expect(coachLink.action, DeepLinkAction.coachDashboard);
      },
    );

    test('Parses selffits://notifications', () {
      final link = DeepLinkNavigator.parse('selffits://notifications');
      expect(link.action, DeepLinkAction.notificationsFeed);
    });

    test('Parses external HTTPS link to externalWeb', () {
      final link = DeepLinkNavigator.parse(
        'https://meet.google.com/live-class-123',
      );
      expect(link.action, DeepLinkAction.externalWeb);
      expect(link.meetingUrl, 'https://meet.google.com/live-class-123');
    });

    test('Handles malformed or unrecognized deep links gracefully', () {
      final link = DeepLinkNavigator.parse('invalid://random/path');
      expect(link.action, DeepLinkAction.unknown);
    });

    test('Executes callbacks when navigating via DeepLinkNavigator', () async {
      bool openedMeeting = false;
      bool openedNotifications = false;

      await DeepLinkNavigator.navigate(
        deepLink:
            'selffits://class/live?meetingUrl=https://meet.google.com/test',
        onOpenMeeting: (url) {
          openedMeeting = true;
        },
      );
      expect(openedMeeting, true);

      await DeepLinkNavigator.navigate(
        deepLink: 'selffits://notifications',
        onOpenNotifications: () {
          openedNotifications = true;
        },
      );
      expect(openedNotifications, true);
    });

    test('Parses deep link variations and whitespace gracefully', () {
      expect(
        DeepLinkNavigator.parse('  selffits://notifications  ').action,
        DeepLinkAction.notificationsFeed,
      );
      expect(
        DeepLinkNavigator.parse('selffits:///notifications').action,
        DeepLinkAction.notificationsFeed,
      );
      expect(
        DeepLinkNavigator.parse('selffits://student/dashboard').action,
        DeepLinkAction.studentDashboard,
      );
      expect(
        DeepLinkNavigator.parse('selffits://coach/dashboard').action,
        DeepLinkAction.coachDashboard,
      );
      expect(
        DeepLinkNavigator.parse('').action,
        DeepLinkAction.unknown,
      );
      expect(
        DeepLinkNavigator.parse('   ').action,
        DeepLinkAction.unknown,
      );
      expect(
        DeepLinkNavigator.parse('selffits://unknown/route').action,
        DeepLinkAction.unknown,
      );
    });

    test('Executes student and coach dashboard callbacks when provided', () async {
      bool openedStudent = false;
      bool openedCoach = false;

      final studentResult = await DeepLinkNavigator.navigate(
        deepLink: 'selffits://dashboard/student',
        onOpenStudentDashboard: () {
          openedStudent = true;
        },
      );
      expect(studentResult, true);
      expect(openedStudent, true);

      final coachResult = await DeepLinkNavigator.navigate(
        deepLink: 'selffits://dashboard/coach',
        onOpenCoachDashboard: () {
          openedCoach = true;
        },
      );
      expect(coachResult, true);
      expect(openedCoach, true);

      final invalidResult = await DeepLinkNavigator.navigate(
        deepLink: 'invalid://malformed',
      );
      expect(invalidResult, false);
    });
  });

  group('Module 6: Device Token Registration & Unlinking Service Tests', () {
    test(
      'Registers FCM device token via POST /api/v1/notifications/device-token',
      () async {
        late String recordedMethod;
        late String recordedPath;
        late Map<String, dynamic> recordedBody;
        late String? recordedAuthHeader;

        final mockClient = TestClient((request) async {
          recordedMethod = request.method;
          recordedPath = request.url.path;
          recordedAuthHeader = request.headers['authorization'];
          final bytes = await request.finalize().toBytes();
          recordedBody = jsonDecode(utf8.decode(bytes));

          return http.Response(
            jsonEncode({
              'success': true,
              'data': {'registered': true, 'token': 'fcm-test-token-123'},
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final service = HttpNotificationService(apiClient: apiClient);

        await service.registerDeviceToken(
          token: 'fcm-test-token-123',
          platform: 'android',
          deviceId: 'pixel-8-pro',
          accessToken: 'student-jwt-access-token',
        );

        expect(recordedMethod, 'POST');
        expect(recordedPath, ApiEndpoints.deviceToken);
        expect(recordedAuthHeader, 'Bearer student-jwt-access-token');
        expect(recordedBody['token'], 'fcm-test-token-123');
        expect(recordedBody['platform'], 'android');
        expect(recordedBody['deviceId'], 'pixel-8-pro');
      },
    );

    test(
      'Unlinks device token on logout via DELETE /api/v1/notifications/device-token',
      () async {
        late String recordedMethod;
        late String recordedPath;
        late Map<String, dynamic> recordedBody;

        final mockClient = TestClient((request) async {
          recordedMethod = request.method;
          recordedPath = request.url.path;
          final bytes = await request.finalize().toBytes();
          recordedBody = jsonDecode(utf8.decode(bytes));

          return http.Response(
            jsonEncode({
              'success': true,
              'data': {'unregistered': true},
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final apiClient = ApiClient(httpClient: mockClient);
        final service = HttpNotificationService(apiClient: apiClient);

        await service.unregisterDeviceToken(
          token: 'fcm-test-token-123',
          accessToken: 'student-jwt-access-token',
        );

        expect(recordedMethod, 'DELETE');
        expect(recordedPath, ApiEndpoints.deviceToken);
        expect(recordedBody['token'], 'fcm-test-token-123');
      },
    );

    test('Fetches in-app notifications and parses list', () async {
      final mockClient = TestClient((request) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'notifications': [
                {
                  'id': 'n-1',
                  'title': 'Sensei Notice',
                  'message': 'Belt evaluation next Friday.',
                  'isRead': false,
                  'createdAt': '2026-10-16T12:00:00.000Z',
                  'type': 'announcement',
                },
                {
                  'id': 'n-2',
                  'title': 'Class Started',
                  'message': 'Join Google Meet now.',
                  'isRead': true,
                  'createdAt': '2026-10-15T17:00:00.000Z',
                  'type': 'class_reminder',
                },
              ],
              'unreadCount': 1,
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(httpClient: mockClient);
      final service = HttpNotificationService(apiClient: apiClient);

      final items = await service.fetchNotifications(accessToken: 'token');
      expect(items.length, 2);
      expect(items.first.title, 'Sensei Notice');
      expect(items.first.isRead, false);
      expect(items.last.isRead, true);
    });
  });

  group('Module 6: NotificationsNotifier Riverpod State & Permissions Tests', () {
    test(
      'Permission transition updates state and syncs device token when granted',
      () async {
        final mockClient = TestClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {'registered': true, 'token': 'test-token'},
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final container = ProviderContainer(
          overrides: [
            apiClientProvider.overrideWithValue(
              ApiClient(httpClient: mockClient),
            ),
            authProvider.overrideWith((ref) {
              final repo = ref.watch(authRepositoryProvider);
              final notifier = AuthNotifier(repo);
              notifier.state = AuthState.authenticated(
                user: const AuthUser(
                  id: 'student-1',
                  email: 'student@selffits.com',
                  name: 'Karate Kid',
                  role: 'STUDENT',
                  isBlocked: false,
                ),
                accessToken: 'valid-test-access-token',
              );
              return notifier;
            }),
          ],
        );

        final notifier = container.read(notificationsProvider.notifier);

        expect(
          container.read(notificationsProvider).permissionStatus,
          NotificationPermissionStatus.notDetermined,
        );

        final status = await notifier.requestPermission();
        expect(status, NotificationPermissionStatus.granted);
        expect(
          container.read(notificationsProvider).permissionStatus,
          NotificationPermissionStatus.granted,
        );
        expect(
          container.read(notificationsProvider).registeredToken,
          isNotNull,
        );
      },
    );

    test(
      'Incoming simulated push updates notifications state in real-time',
      () async {
        final container = ProviderContainer();
        final service =
            container.read(notificationServiceProvider)
                as HttpNotificationService;

        expect(
          container.read(notificationsProvider).notifications.isEmpty,
          true,
        );
        expect(container.read(notificationsProvider).unreadCount, 0);

        service.simulateIncomingPush(
          PushNotificationPayload(
            title: 'Live Class Alert',
            body: 'Sensei is online. Tap to join.',
            type: 'class_reminder',
            meetingUrl: 'https://meet.google.com/live',
            createdAt: DateTime.now(),
          ),
        );

        // Allow stream microtask to deliver
        await Future<void>.delayed(const Duration(milliseconds: 50));

        final state = container.read(notificationsProvider);
        expect(state.notifications.length, 1);
        expect(state.unreadCount, 1);
        expect(state.notifications.first.title, 'Live Class Alert');
        expect(
          state.notifications.first.meetingUrl,
          'https://meet.google.com/live',
        );
      },
    );

    test(
      'Mark as read and Mark all read update unread counts correctly',
      () async {
        final container = ProviderContainer();
        container.read(notificationsProvider.notifier);
        final service =
            container.read(notificationServiceProvider)
                as HttpNotificationService;

        service.simulateIncomingPush(
          PushNotificationPayload(
            title: 'Notif 1',
            body: 'Msg 1',
            type: 'general',
            createdAt: DateTime.now(),
          ),
        );
        service.simulateIncomingPush(
          PushNotificationPayload(
            title: 'Notif 2',
            body: 'Msg 2',
            type: 'general',
            createdAt: DateTime.now(),
          ),
        );

        await Future<void>.delayed(const Duration(milliseconds: 50));
        expect(container.read(notificationsProvider).unreadCount, 2);

        final firstId = container
            .read(notificationsProvider)
            .notifications
            .first
            .id;
        await container
            .read(notificationsProvider.notifier)
            .markAsRead(firstId);
        expect(container.read(notificationsProvider).unreadCount, 1);

        await container.read(notificationsProvider.notifier).markAllAsRead();
        expect(container.read(notificationsProvider).unreadCount, 0);
      },
    );
  });

  group('Module 6: Android Native FCM Integration & Token Lifecycle Tests', () {
    test(
      'FcmPushService fails gracefully without crashing when Firebase is unconfigured',
      () async {
        final fcm = FcmPushService.forTesting();
        final initialized = await fcm.initialize();
        expect(initialized, false);
        expect(fcm.isFirebaseInitialized, false);
        expect(
          await fcm.checkPermission(),
          NotificationPermissionStatus.notDetermined,
        );
        expect(
          await fcm.requestPermission(),
          NotificationPermissionStatus.notDetermined,
        );
        expect(await fcm.getFcmToken(), isNull);
        expect(await fcm.getInitialPayload(), isNull);
        await fcm.deleteToken(); // safe, does not throw
      },
    );

    test(
      'HttpNotificationService respects enableFallbackDevToken toggle',
      () async {
        final apiClient = ApiClient();
        final serviceNoFallback = HttpNotificationService(
          apiClient: apiClient,
          enableFallbackDevToken: false,
        );
        expect(await serviceNoFallback.getDeviceToken(), isNull);

        final serviceWithFallback = HttpNotificationService(
          apiClient: apiClient,
          enableFallbackDevToken: true,
        );
        final token = await serviceWithFallback.getDeviceToken();
        expect(token, isNotNull);
        expect(token!.isNotEmpty, true);
      },
    );

    test(
      'HttpNotificationService preserves cached device token once set',
      () async {
        final apiClient = ApiClient();
        final service = HttpNotificationService(apiClient: apiClient);
        service.setDeviceToken('manual-fcm-token-xyz');
        expect(await service.getDeviceToken(), 'manual-fcm-token-xyz');
      },
    );

    test(
      'NotificationsNotifier responds to token refresh event and re-syncs',
      () async {
        String? registeredToken;
        final mockClient = TestClient((request) async {
          if (request.url.path == ApiEndpoints.deviceToken) {
            final bytes = await request.finalize().toBytes();
            final body = jsonDecode(utf8.decode(bytes));
            registeredToken = body['token'] as String?;
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {'registered': true, 'token': registeredToken},
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(jsonEncode({'success': true}), 200);
        });

        final container = ProviderContainer(
          overrides: [
            apiClientProvider.overrideWithValue(
              ApiClient(httpClient: mockClient),
            ),
            authProvider.overrideWith((ref) {
              final repo = ref.watch(authRepositoryProvider);
              final notifier = AuthNotifier(repo);
              notifier.state = AuthState.authenticated(
                user: const AuthUser(
                  id: 'student-99',
                  email: 'student99@selffits.com',
                  name: 'Test Student',
                  role: 'STUDENT',
                  isBlocked: false,
                ),
                accessToken: 'valid-token-student-99',
              );
              return notifier;
            }),
          ],
        );

        final notifier = container.read(notificationsProvider.notifier);

        // Trigger manual device token sync
        await notifier.syncDeviceToken(overrideToken: 'initial-token-111');
        expect(
          container.read(notificationsProvider).registeredToken,
          'initial-token-111',
        );
        expect(registeredToken, 'initial-token-111');

        // Simulate token refresh event
        await notifier.syncDeviceToken(overrideToken: 'refreshed-fcm-token-222');
        expect(
          container.read(notificationsProvider).registeredToken,
          'refreshed-fcm-token-222',
        );
        expect(registeredToken, 'refreshed-fcm-token-222');
      },
    );

    test(
      'NotificationsNotifier unregisterOnLogout clears state and backend token',
      () async {
        String? unregisteredToken;
        final mockClient = TestClient((request) async {
          if (request.method == 'DELETE' &&
              request.url.path == ApiEndpoints.deviceToken) {
            final bytes = await request.finalize().toBytes();
            final body = jsonDecode(utf8.decode(bytes));
            unregisteredToken = body['token'] as String?;
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {'unregistered': true},
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
          return http.Response(
            jsonEncode({'success': true, 'data': {}}),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        final container = ProviderContainer(
          overrides: [
            apiClientProvider.overrideWithValue(
              ApiClient(httpClient: mockClient),
            ),
            authProvider.overrideWith((ref) {
              final repo = ref.watch(authRepositoryProvider);
              final notifier = AuthNotifier(repo);
              notifier.state = AuthState.authenticated(
                user: const AuthUser(
                  id: 'student-100',
                  email: 'logout-test@selffits.com',
                  name: 'Logout Student',
                  role: 'STUDENT',
                  isBlocked: false,
                ),
                accessToken: 'logout-test-access-token',
              );
              return notifier;
            }),
          ],
        );

        final notifier = container.read(notificationsProvider.notifier);
        await notifier.syncDeviceToken(overrideToken: 'token-to-delete-999');
        expect(
          container.read(notificationsProvider).registeredToken,
          'token-to-delete-999',
        );

        await notifier.unregisterOnLogout();

        expect(unregisteredToken, 'token-to-delete-999');
        expect(container.read(notificationsProvider).registeredToken, isNull);
        expect(container.read(notificationsProvider).notifications.isEmpty, true);
        expect(container.read(notificationsProvider).unreadCount, 0);
      },
    );
  });

  group(
    'Module 6: NotificationsScreen & NotificationBadgeButton UI Widget Tests',
    () {
      testWidgets(
        'NotificationBadgeButton displays badge counter when unreadCount > 0',
        (WidgetTester tester) async {
          final container = ProviderContainer();
          container.read(notificationsProvider.notifier);
          final service =
              container.read(notificationServiceProvider)
                  as HttpNotificationService;

          service.simulateIncomingPush(
            PushNotificationPayload(
              title: 'Test Class Alert',
              body: 'Class starting in 15 min.',
              type: 'class_reminder',
              createdAt: DateTime.now(),
            ),
          );

          await tester.pumpWidget(
            UncontrolledProviderScope(
              container: container,
              child: const MaterialApp(
                home: Scaffold(
                  appBar: PreferredSize(
                    preferredSize: Size.fromHeight(56),
                    child: Row(children: [NotificationBadgeButton()]),
                  ),
                ),
              ),
            ),
          );
          await tester.pump(const Duration(milliseconds: 100));

          expect(find.byType(NotificationBadgeButton), findsOneWidget);
          expect(find.text('1'), findsOneWidget);
        },
      );

      testWidgets(
        'NotificationsScreen renders permission banner when permission is denied',
        (WidgetTester tester) async {
          final container = ProviderContainer();
          final service =
              container.read(notificationServiceProvider)
                  as HttpNotificationService;
          service.setPermissionStatusForTesting(
            NotificationPermissionStatus.denied,
          );

          await tester.pumpWidget(
            UncontrolledProviderScope(
              container: container,
              child: const MaterialApp(home: NotificationsScreen()),
            ),
          );
          await tester.pump();

          expect(find.text('Push Notifications Disabled'), findsOneWidget);
          expect(find.text('Enable Notifications →'), findsOneWidget);
        },
      );

      testWidgets(
        'NotificationsScreen renders empty state when no notifications exist',
        (WidgetTester tester) async {
          final container = ProviderContainer();

          await tester.pumpWidget(
            UncontrolledProviderScope(
              container: container,
              child: const MaterialApp(home: NotificationsScreen()),
            ),
          );
          await tester.pump();

          expect(find.text('No Notifications Yet'), findsOneWidget);
        },
      );

      testWidgets(
        'NotificationsScreen renders notification card with Join Class button',
        (WidgetTester tester) async {
          final container = ProviderContainer();
          container.read(notificationsProvider.notifier);
          final service =
              container.read(notificationServiceProvider)
                  as HttpNotificationService;

          service.simulateIncomingPush(
            PushNotificationPayload(
              title: 'Muay Thai Live Class',
              body: 'Class is active now.',
              type: 'class_reminder',
              meetingUrl: 'https://meet.google.com/test-meet',
              createdAt: DateTime.now(),
            ),
          );

          await tester.pumpWidget(
            UncontrolledProviderScope(
              container: container,
              child: const MaterialApp(home: NotificationsScreen()),
            ),
          );
          await tester.pump(const Duration(milliseconds: 100));

          expect(find.text('Muay Thai Live Class'), findsOneWidget);
          expect(find.text('Class is active now.'), findsOneWidget);
          expect(find.text('Join Class'), findsOneWidget);
        },
      );
    },
  );

  group('Module 6: DeepLinkNavigator Built-In Route Navigation Widget Tests', () {
    setUp(() {
      DeepLinkNavigator.navigatorKey = GlobalKey<NavigatorState>();
    });

    testWidgets(
      'Navigates to NotificationsScreen without callbacks when selffits://notifications is triggered',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          ProviderScope(
            child: MaterialApp(
              navigatorKey: DeepLinkNavigator.navigatorKey,
              home: const Scaffold(body: Text('Base Screen')),
            ),
          ),
        );
        await tester.pump();
        expect(find.text('Base Screen'), findsOneWidget);

        final navigated = await DeepLinkNavigator.navigate(
          deepLink: 'selffits://notifications',
        );
        expect(navigated, true);

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(NotificationsScreen), findsOneWidget);

        DeepLinkNavigator.navigatorKey.currentState?.pop();
        await tester.pumpWidget(const SizedBox());
        await tester.pump(const Duration(milliseconds: 500));
      },
    );

    testWidgets(
      'Navigates to StudentHomeScreen without callbacks when selffits://dashboard/student is triggered',
      (WidgetTester tester) async {
        final mockClient = TestClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'isEnrolled': false,
                'enrollment': null,
                'notifications': [],
                'unreadCount': 0,
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(
                ApiClient(httpClient: mockClient),
              ),
              secureStorageProvider.overrideWithValue(
                InMemorySecureStorageService(),
              ),
              authProvider.overrideWith((ref) {
                final repo = ref.watch(authRepositoryProvider);
                final notifier = AuthNotifier(repo);
                notifier.state = AuthState.authenticated(
                  user: const AuthUser(
                    id: 'student-1',
                    email: 'student@selffits.com',
                    name: 'Karate Kid',
                    role: 'STUDENT',
                  ),
                  accessToken: 'valid-test-access-token',
                );
                return notifier;
              }),
            ],
            child: MaterialApp(
              navigatorKey: DeepLinkNavigator.navigatorKey,
              home: const Scaffold(body: Text('Base Screen')),
            ),
          ),
        );
        await tester.pump();

        final navigated = await DeepLinkNavigator.navigate(
          deepLink: 'selffits://dashboard/student',
        );
        expect(navigated, true);

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(StudentHomeScreen), findsOneWidget);

        DeepLinkNavigator.navigatorKey.currentState?.pop();
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
      },
    );

    testWidgets(
      'Navigates to CoachHomeScreen without callbacks when selffits://dashboard/coach is triggered',
      (WidgetTester tester) async {
        final mockClient = TestClient((request) async {
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'batches': [],
                'metrics': {},
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        });

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              apiClientProvider.overrideWithValue(
                ApiClient(httpClient: mockClient),
              ),
              secureStorageProvider.overrideWithValue(
                InMemorySecureStorageService(),
              ),
              authProvider.overrideWith((ref) {
                final repo = ref.watch(authRepositoryProvider);
                final notifier = AuthNotifier(repo);
                notifier.state = AuthState.authenticated(
                  user: const AuthUser(
                    id: 'coach-1',
                    email: 'coach@selffits.com',
                    name: 'Sensei Tanaka',
                    role: 'COACH',
                  ),
                  accessToken: 'valid-coach-access-token',
                );
                return notifier;
              }),
            ],
            child: MaterialApp(
              navigatorKey: DeepLinkNavigator.navigatorKey,
              home: const Scaffold(body: Text('Base Screen')),
            ),
          ),
        );
        await tester.pump();

        final navigated = await DeepLinkNavigator.navigate(
          deepLink: 'selffits://dashboard/coach',
        );
        expect(navigated, true);

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(CoachHomeScreen), findsOneWidget);

        DeepLinkNavigator.navigatorKey.currentState?.pop();
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
      },
    );

    testWidgets(
      'Safely rejects unknown or malformed deep links without navigating or throwing',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          ProviderScope(
            child: MaterialApp(
              navigatorKey: DeepLinkNavigator.navigatorKey,
              home: const Scaffold(body: Text('Base Screen')),
            ),
          ),
        );
        await tester.pump();

        final result1 = await DeepLinkNavigator.navigate(deepLink: '');
        expect(result1, false);

        final result2 = await DeepLinkNavigator.navigate(
          deepLink: 'invalid://malformed/link',
        );
        expect(result2, false);

        final result3 = await DeepLinkNavigator.navigate(
          deepLink: 'selffits://nonexistent',
        );
        expect(result3, false);

        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.text('Base Screen'), findsOneWidget);
      },
    );
  });
}
