import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/notification_item.dart';
import '../services/notification_service.dart';

/// Notification Service provider
final notificationServiceProvider = Provider<INotificationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final service = HttpNotificationService(
    apiClient: apiClient,
  );
  ref.onDispose(() => service.dispose());
  return service;
});

/// Immutable State for Notifications
class NotificationsState {
  final bool isLoading;
  final List<NotificationItem> notifications;
  final int unreadCount;
  final NotificationPermissionStatus permissionStatus;
  final String? registeredToken;
  final String? errorMessage;
  final PushNotificationPayload? latestIncomingPush;

  const NotificationsState({
    required this.isLoading,
    required this.notifications,
    required this.unreadCount,
    required this.permissionStatus,
    this.registeredToken,
    this.errorMessage,
    this.latestIncomingPush,
  });

  factory NotificationsState.initial() {
    return const NotificationsState(
      isLoading: false,
      notifications: [],
      unreadCount: 0,
      permissionStatus: NotificationPermissionStatus.notDetermined,
      registeredToken: null,
      errorMessage: null,
      latestIncomingPush: null,
    );
  }

  NotificationsState copyWith({
    bool? isLoading,
    List<NotificationItem>? notifications,
    int? unreadCount,
    NotificationPermissionStatus? permissionStatus,
    String? registeredToken,
    String? errorMessage,
    PushNotificationPayload? latestIncomingPush,
  }) {
    return NotificationsState(
      isLoading: isLoading ?? this.isLoading,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      permissionStatus: permissionStatus ?? this.permissionStatus,
      registeredToken: registeredToken ?? this.registeredToken,
      errorMessage: errorMessage,
      latestIncomingPush: latestIncomingPush ?? this.latestIncomingPush,
    );
  }
}

/// StateNotifier managing notification feeds, permissions, and device token sync.
class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final INotificationService service;
  final Ref ref;
  StreamSubscription<PushNotificationPayload>? _incomingSub;
  StreamSubscription<PushNotificationPayload>? _openedSub;
  StreamSubscription<String>? _tokenRefreshSub;
  int _pushCounter = 0;

  NotificationsNotifier({required this.service, required this.ref})
    : super(NotificationsState.initial()) {
    _initListeners();
  }

  void _initListeners() {
    _incomingSub = service.onMessageReceived.listen((payload) {
      final newItem = NotificationItem(
        id: 'push-${DateTime.now().millisecondsSinceEpoch}-${_pushCounter++}',
        title: payload.title,
        message: payload.body,
        isRead: false,
        createdAt: payload.createdAt,
        type: payload.type,
        deepLink: payload.deepLink,
        meetingUrl: payload.meetingUrl,
        batchId: payload.batchId,
      );

      final updatedList = [newItem, ...state.notifications];
      state = state.copyWith(
        notifications: updatedList,
        unreadCount: state.unreadCount + 1,
        latestIncomingPush: payload,
      );
    });

    if (service is HttpNotificationService) {
      _tokenRefreshSub =
          (service as HttpNotificationService).onTokenRefresh.listen((newToken) async {
            final authState = ref.read(authProvider);
            if (authState.accessToken != null) {
              await syncDeviceToken(overrideToken: newToken);
            }
          });
    }
  }

  /// Checks current notification permission status
  Future<void> checkPermission() async {
    final status = await service.checkPermission();
    state = state.copyWith(permissionStatus: status);
  }

  /// Requests notification permission from the user
  Future<NotificationPermissionStatus> requestPermission() async {
    final status = await service.requestPermission();
    state = state.copyWith(permissionStatus: status);

    // If permission granted and user is authenticated, sync device token
    if (status.isGranted) {
      await syncDeviceToken();
    }
    return status;
  }

  /// Fetches notification feed from backend
  Future<void> loadNotifications() async {
    final authState = ref.read(authProvider);
    final token = authState.accessToken;
    if (token == null) return;

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final items = await service.fetchNotifications(accessToken: token);
      final unread = items.where((n) => !n.isRead).length;

      state = state.copyWith(
        isLoading: false,
        notifications: items,
        unreadCount: unread,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to load notifications. Please check connection.',
      );
    }
  }

  /// Synchronizes device token with the backend for the current authenticated user
  Future<bool> syncDeviceToken({String? overrideToken}) async {
    final authState = ref.read(authProvider);
    final accessToken = authState.accessToken;
    if (accessToken == null) return false;

    try {
      final deviceToken = overrideToken ?? await service.getDeviceToken();
      if (deviceToken == null || deviceToken.isEmpty) return false;

      String platform = 'android';
      try {
        if (Platform.isIOS) platform = 'ios';
      } catch (_) {
        platform = 'android';
      }

      await service.registerDeviceToken(
        token: deviceToken,
        platform: platform,
        deviceId: 'device-${authState.user?.id ?? "unknown"}',
        accessToken: accessToken,
      );

      state = state.copyWith(registeredToken: deviceToken);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Unlinks device token from backend on user logout
  Future<void> unregisterOnLogout() async {
    final authState = ref.read(authProvider);
    final accessToken = authState.accessToken;
    final token = state.registeredToken;

    if (accessToken != null && token != null) {
      try {
        await service.unregisterDeviceToken(
          token: token,
          accessToken: accessToken,
        );
      } catch (_) {
        // Suppress failure during logout to ensure clean client state
      }
    }

    state = NotificationsState.initial();
  }

  /// Marks a specific notification as read
  Future<void> markAsRead(String id) async {
    final authState = ref.read(authProvider);
    final token = authState.accessToken;

    final updated = state.notifications.map((n) {
      if (n.id == id) {
        return n.copyWith(isRead: true);
      }
      return n;
    }).toList();

    final unread = updated.where((n) => !n.isRead).length;
    state = state.copyWith(notifications: updated, unreadCount: unread);

    if (token != null) {
      try {
        await service.markNotificationAsRead(
          notificationId: id,
          accessToken: token,
        );
      } catch (_) {
        // UI already updated optimistically
      }
    }
  }

  /// Marks all notifications as read
  Future<void> markAllAsRead() async {
    final authState = ref.read(authProvider);
    final token = authState.accessToken;

    final updated = state.notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();
    state = state.copyWith(notifications: updated, unreadCount: 0);

    if (token != null) {
      try {
        await service.markAllNotificationsAsRead(accessToken: token);
      } catch (_) {
        // UI already updated optimistically
      }
    }
  }

  @override
  void dispose() {
    _incomingSub?.cancel();
    _openedSub?.cancel();
    _tokenRefreshSub?.cancel();
    super.dispose();
  }
}

/// Global StateNotifierProvider for notifications
final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
      final service = ref.watch(notificationServiceProvider);
      return NotificationsNotifier(service: service, ref: ref);
    });
