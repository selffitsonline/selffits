import 'dart:async';
import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/notification_item.dart';

/// Top-level background message handler required by Firebase Messaging.
/// Must be an entry point so it can be invoked when the app process is terminated or backgrounded.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If needed in the future, background processing can be added here.
  // When 'notification' is present in payload, Android OS handles system tray presentation automatically.
}

/// Native Firebase Cloud Messaging (FCM) & Local Notification Service.
/// Manages FCM token lifecycle, Android notification channels, foreground display,
/// and tap-to-navigate event streams.
class FcmPushService {
  static final FcmPushService instance = FcmPushService._internal();

  FcmPushService._internal();

  /// Factory constructor for test dependency injection
  factory FcmPushService.forTesting() => FcmPushService._internal();

  bool _isFirebaseInitialized = false;
  bool get isFirebaseInitialized => _isFirebaseInitialized;

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const String channelId = 'selffits_high_importance_channel';
  static const String channelName = 'SELFFITS Class & Academy Alerts';
  static const String channelDescription =
      'High importance notifications for live class reminders, schedule updates, and academy announcements.';

  final StreamController<PushNotificationPayload> _messageReceivedController =
      StreamController<PushNotificationPayload>.broadcast();
  final StreamController<PushNotificationPayload> _notificationOpenedController =
      StreamController<PushNotificationPayload>.broadcast();
  final StreamController<String> _tokenRefreshController =
      StreamController<String>.broadcast();

  Stream<PushNotificationPayload> get onMessageReceived =>
      _messageReceivedController.stream;
  Stream<PushNotificationPayload> get onNotificationOpenedApp =>
      _notificationOpenedController.stream;
  Stream<String> get onTokenRefresh => _tokenRefreshController.stream;

  /// Initializes Firebase and local notification channels.
  /// Fails gracefully if google-services.json or Firebase credentials are not present.
  Future<bool> initialize() async {
    try {
      await Firebase.initializeApp();
      _isFirebaseInitialized = true;
    } catch (e) {
      _isFirebaseInitialized = false;
      debugPrint('Firebase initialization skipped or failed: $e');
      return false;
    }

    try {
      // 1. Register background message handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 2. Setup Android notification channel and local notification plugin
      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
      const initSettings = InitializationSettings(android: androidInit);

      await _localNotifications.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          final payloadStr = response.payload;
          if (payloadStr != null && payloadStr.isNotEmpty) {
            try {
              final Map<String, dynamic> data = jsonDecode(payloadStr);
              final payload = PushNotificationPayload.fromData(data);
              _notificationOpenedController.add(payload);
            } catch (e) {
              debugPrint('Failed to decode local notification payload: $e');
            }
          }
        },
      );

      final androidPlugin = _localNotifications
          .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin
          >();

      if (androidPlugin != null) {
        const channel = AndroidNotificationChannel(
          channelId,
          channelName,
          description: channelDescription,
          importance: Importance.max,
          playSound: true,
          enableVibration: true,
        );
        await androidPlugin.createNotificationChannel(channel);
      }

      // 3. Configure foreground presentation options
      await FirebaseMessaging.instance
          .setForegroundNotificationPresentationOptions(
            alert: true,
            badge: true,
            sound: true,
          );

      // 4. Attach remote message streams
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        final payload = _payloadFromRemoteMessage(message);
        _messageReceivedController.add(payload);

        // Display local heads-up notification banner in foreground
        _showForegroundNotification(payload);
      });

      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        final payload = _payloadFromRemoteMessage(message);
        _notificationOpenedController.add(payload);
      });

      FirebaseMessaging.instance.onRegistered.listen((String newToken) {
        _tokenRefreshController.add(newToken);
      });

      return true;
    } catch (e) {
      debugPrint('Error setting up Firebase Messaging listeners: $e');
      return false;
    }
  }

  /// Requests notification permission on Android (including Android 13+ POST_NOTIFICATIONS) and iOS.
  Future<NotificationPermissionStatus> requestPermission() async {
    if (!_isFirebaseInitialized) {
      return NotificationPermissionStatus.notDetermined;
    }

    try {
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      switch (settings.authorizationStatus) {
        case AuthorizationStatus.authorized:
          return NotificationPermissionStatus.granted;
        case AuthorizationStatus.provisional:
          return NotificationPermissionStatus.granted;
        case AuthorizationStatus.denied:
          return NotificationPermissionStatus.denied;
        case AuthorizationStatus.notDetermined:
        default:
          return NotificationPermissionStatus.notDetermined;
      }
    } catch (e) {
      debugPrint('Error requesting notification permission: $e');
      return NotificationPermissionStatus.notDetermined;
    }
  }

  /// Checks current notification permission without prompting.
  Future<NotificationPermissionStatus> checkPermission() async {
    if (!_isFirebaseInitialized) {
      return NotificationPermissionStatus.notDetermined;
    }

    try {
      final settings =
          await FirebaseMessaging.instance.getNotificationSettings();
      switch (settings.authorizationStatus) {
        case AuthorizationStatus.authorized:
        case AuthorizationStatus.provisional:
          return NotificationPermissionStatus.granted;
        case AuthorizationStatus.denied:
          return NotificationPermissionStatus.denied;
        case AuthorizationStatus.notDetermined:
        default:
          return NotificationPermissionStatus.notDetermined;
      }
    } catch (e) {
      return NotificationPermissionStatus.notDetermined;
    }
  }

  /// Retrieves the actual FCM token for this device registration.
  Future<String?> getFcmToken() async {
    if (!_isFirebaseInitialized) {
      return null;
    }

    try {
      // ignore: deprecated_member_use
      final token = await FirebaseMessaging.instance.getToken();
      return token;
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
      return null;
    }
  }

  /// Deletes the FCM token from the device on logout.
  /// This ensures user A's notifications are not delivered to user B on a shared device.
  Future<void> deleteToken() async {
    if (!_isFirebaseInitialized) return;

    try {
      await FirebaseMessaging.instance.unregister();
      // ignore: deprecated_member_use
      await FirebaseMessaging.instance.deleteToken();
    } catch (e) {
      debugPrint('Error unregistering FCM token on logout: $e');
    }
  }

  /// Checks if the app was launched by tapping a notification from a terminated state.
  Future<PushNotificationPayload?> getInitialPayload() async {
    if (!_isFirebaseInitialized) return null;

    try {
      final message = await FirebaseMessaging.instance.getInitialMessage();
      if (message != null) {
        return _payloadFromRemoteMessage(message);
      }
    } catch (e) {
      debugPrint('Error getting initial FCM message: $e');
    }
    return null;
  }

  /// Displays a local heads-up notification in the Android system tray when a message arrives while in foreground.
  Future<void> _showForegroundNotification(
    PushNotificationPayload payload,
  ) async {
    try {
      final androidDetails = AndroidNotificationDetails(
        channelId,
        channelName,
        channelDescription: channelDescription,
        importance: Importance.max,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      );
      final details = NotificationDetails(android: androidDetails);

      await _localNotifications.show(
        id: payload.hashCode,
        title: payload.title,
        body: payload.body,
        notificationDetails: details,
        payload: jsonEncode(payload.toData()),
      );
    } catch (e) {
      debugPrint('Error presenting local foreground notification: $e');
    }
  }

  /// Converts a Firebase RemoteMessage into the SELFFITS PushNotificationPayload model.
  static PushNotificationPayload _payloadFromRemoteMessage(
    RemoteMessage message,
  ) {
    final notification = message.notification;
    final data = Map<String, dynamic>.from(message.data);

    final title =
        notification?.title ??
        (data['title'] as String?) ??
        'SELFFITS Academy';
    final body = notification?.body ?? (data['body'] as String?) ?? '';
    final type = (data['type'] as String?) ?? 'general';
    final deepLink =
        (data['deepLink'] as String?) ?? (data['click_action'] as String?);
    final meetingUrl = data['meetingUrl'] as String?;
    final batchId = data['batchId'] as String?;

    return PushNotificationPayload(
      title: title,
      body: body,
      type: type,
      deepLink: deepLink,
      meetingUrl: meetingUrl,
      batchId: batchId,
      createdAt: DateTime.now(),
    );
  }

  void dispose() {
    _messageReceivedController.close();
    _notificationOpenedController.close();
    _tokenRefreshController.close();
  }
}
