import 'dart:async';
import 'dart:io' show Platform;
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../models/notification_item.dart';
import 'fcm_push_service.dart';

/// Abstract Notification Service contract.
/// Enables mockable push delivery in test harnesses and decoupled Firebase integration in production.
abstract class INotificationService {
  Future<NotificationPermissionStatus> requestPermission();
  Future<NotificationPermissionStatus> checkPermission();
  Future<String?> getDeviceToken();

  Future<void> registerDeviceToken({
    required String token,
    required String platform,
    String? deviceId,
    required String accessToken,
  });

  Future<void> unregisterDeviceToken({
    required String token,
    required String accessToken,
  });

  Future<List<NotificationItem>> fetchNotifications({
    required String accessToken,
  });

  Future<void> markNotificationAsRead({
    required String notificationId,
    required String accessToken,
  });

  Future<void> markAllNotificationsAsRead({required String accessToken});

  Stream<PushNotificationPayload> get onMessageReceived;
  Stream<PushNotificationPayload> get onNotificationOpenedApp;

  void dispose();
}

/// Production implementation of Notification Service using SELFFITS REST API and native FCM.
class HttpNotificationService implements INotificationService {
  final ApiClient apiClient;
  final FcmPushService fcmPushService;
  final bool enableFallbackDevToken;
  NotificationPermissionStatus _permissionStatus =
      NotificationPermissionStatus.notDetermined;
  String? _cachedDeviceToken;

  final _messageReceivedController =
      StreamController<PushNotificationPayload>.broadcast();
  final _notificationOpenedController =
      StreamController<PushNotificationPayload>.broadcast();

  StreamSubscription<PushNotificationPayload>? _fcmIncomingSub;
  StreamSubscription<PushNotificationPayload>? _fcmOpenedSub;

  HttpNotificationService({
    required this.apiClient,
    FcmPushService? fcmPushService,
    this.enableFallbackDevToken = true,
  }) : fcmPushService = fcmPushService ?? FcmPushService.instance {
    _initFcmForwarding();
  }

  void _initFcmForwarding() {
    _fcmIncomingSub = fcmPushService.onMessageReceived.listen((payload) {
      _messageReceivedController.add(payload);
    });
    _fcmOpenedSub = fcmPushService.onNotificationOpenedApp.listen((payload) {
      _notificationOpenedController.add(payload);
    });
  }

  Stream<String> get onTokenRefresh => fcmPushService.onTokenRefresh;

  @override
  Stream<PushNotificationPayload> get onMessageReceived =>
      _messageReceivedController.stream;

  @override
  Stream<PushNotificationPayload> get onNotificationOpenedApp =>
      _notificationOpenedController.stream;

  @override
  Future<NotificationPermissionStatus> checkPermission() async {
    if (fcmPushService.isFirebaseInitialized) {
      _permissionStatus = await fcmPushService.checkPermission();
      return _permissionStatus;
    }
    return _permissionStatus;
  }

  @override
  Future<NotificationPermissionStatus> requestPermission() async {
    if (fcmPushService.isFirebaseInitialized) {
      _permissionStatus = await fcmPushService.requestPermission();
      return _permissionStatus;
    }

    if (_permissionStatus == NotificationPermissionStatus.denied) {
      return _permissionStatus;
    }
    _permissionStatus = NotificationPermissionStatus.granted;
    return _permissionStatus;
  }

  /// Manually set permission for testing or permission change handlers
  void setPermissionStatusForTesting(NotificationPermissionStatus status) {
    _permissionStatus = status;
  }

  @override
  Future<String?> getDeviceToken() async {
    if (_cachedDeviceToken != null) return _cachedDeviceToken;

    // 1. Try real FCM token if Firebase is initialized
    if (fcmPushService.isFirebaseInitialized) {
      final realFcmToken = await fcmPushService.getFcmToken();
      if (realFcmToken != null && realFcmToken.isNotEmpty) {
        _cachedDeviceToken = realFcmToken;
        return _cachedDeviceToken;
      }
      // Firebase is initialized but token not yet ready; do not fabricate fake token in production
      return null;
    }

    // 2. In unit test mode or explicit fallback mode (Firebase uninitialized)
    if (enableFallbackDevToken) {
      String platformPrefix = 'dev';
      try {
        if (Platform.isAndroid) platformPrefix = 'fcm-android';
        if (Platform.isIOS) platformPrefix = 'apns-ios';
      } catch (_) {
        platformPrefix = 'test-device';
      }

      _cachedDeviceToken =
          '$platformPrefix-token-${DateTime.now().millisecondsSinceEpoch}';
      return _cachedDeviceToken;
    }

    return null;
  }

  /// Set device token explicitly (e.g. from FirebaseMessaging.instance.getToken() or in tests)
  void setDeviceToken(String token) {
    _cachedDeviceToken = token;
  }

  @override
  Future<void> registerDeviceToken({
    required String token,
    required String platform,
    String? deviceId,
    required String accessToken,
  }) async {
    await apiClient.post(
      ApiEndpoints.deviceToken,
      token: accessToken,
      body: {'token': token, 'platform': platform, 'deviceId': ?deviceId},
    );
    _cachedDeviceToken = token;
  }

  @override
  Future<void> unregisterDeviceToken({
    required String token,
    required String accessToken,
  }) async {
    await apiClient.delete(
      ApiEndpoints.deviceToken,
      token: accessToken,
      body: {'token': token},
    );
    if (_cachedDeviceToken == token) {
      _cachedDeviceToken = null;
    }
    // Delete native token on device so next user gets a fresh registration
    if (fcmPushService.isFirebaseInitialized) {
      await fcmPushService.deleteToken();
    }
  }

  @override
  Future<List<NotificationItem>> fetchNotifications({
    required String accessToken,
  }) async {
    final response = await apiClient.get(
      ApiEndpoints.notifications,
      token: accessToken,
    );

    if (response['notifications'] is List) {
      final list = response['notifications'] as List;
      return list
          .map(
            (item) => NotificationItem.fromJson(item as Map<String, dynamic>),
          )
          .toList();
    }
    return [];
  }

  @override
  Future<void> markNotificationAsRead({
    required String notificationId,
    required String accessToken,
  }) async {
    await apiClient.patch(
      ApiEndpoints.notifications,
      token: accessToken,
      body: {'notificationId': notificationId},
    );
  }

  @override
  Future<void> markAllNotificationsAsRead({required String accessToken}) async {
    await apiClient.patch(
      ApiEndpoints.notifications,
      token: accessToken,
      body: {'markAllRead': true},
    );
  }

  /// Simulates an incoming remote push message (used in automated tests and local verification)
  void simulateIncomingPush(PushNotificationPayload payload) {
    _messageReceivedController.add(payload);
  }

  /// Simulates tapping an incoming notification banner (used in automated tests and local verification)
  void simulateNotificationTap(PushNotificationPayload payload) {
    _notificationOpenedController.add(payload);
  }

  @override
  void dispose() {
    _fcmIncomingSub?.cancel();
    _fcmOpenedSub?.cancel();
    _messageReceivedController.close();
    _notificationOpenedController.close();
  }
}
