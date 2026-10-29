import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:selffits_mobile/features/coach/presentation/coach_home_screen.dart';
import 'package:selffits_mobile/features/notifications/presentation/notifications_screen.dart';
import 'package:selffits_mobile/features/student/presentation/student_home_screen.dart';
import 'package:url_launcher/url_launcher.dart';

/// Deep Link Action types supported by SELFFITS Mobile
enum DeepLinkAction {
  joinLiveClass,
  studentDashboard,
  coachDashboard,
  notificationsFeed,
  externalWeb,
  unknown,
}

/// Parsed deep link result
class ParsedDeepLink {
  final DeepLinkAction action;
  final String? batchId;
  final String? meetingUrl;
  final String originalUri;

  const ParsedDeepLink({
    required this.action,
    required this.originalUri,
    this.batchId,
    this.meetingUrl,
  });
}

/// Safe Deep Link Navigator & Dispatcher for SELFFITS Mobile.
/// Handles custom app schemes (`selffits://...`) and external meeting links.
class DeepLinkNavigator {
  /// Global navigator key attached to MaterialApp for headless/background/notification routing.
  static GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  /// Parses a deep link string into a structured ParsedDeepLink.
  static ParsedDeepLink parse(String urlString) {
    final clean = urlString.trim();
    if (clean.isEmpty) {
      return const ParsedDeepLink(action: DeepLinkAction.unknown, originalUri: '');
    }

    final uri = Uri.tryParse(clean);

    if (uri == null) {
      return ParsedDeepLink(action: DeepLinkAction.unknown, originalUri: clean);
    }

    // Direct Google Meet or HTTPS web links
    if (uri.scheme == 'https' || uri.scheme == 'http') {
      return ParsedDeepLink(
        action: DeepLinkAction.externalWeb,
        originalUri: clean,
        meetingUrl: clean,
      );
    }

    if (uri.scheme == 'selffits') {
      final host = uri.host;
      final path = uri.path;

      // selffits://class/live?batchId=...&meetingUrl=...
      if (host == 'class' &&
          (path == '/live' || path == 'live' || path.isEmpty)) {
        return ParsedDeepLink(
          action: DeepLinkAction.joinLiveClass,
          originalUri: clean,
          batchId: uri.queryParameters['batchId'],
          meetingUrl: uri.queryParameters['meetingUrl'],
        );
      }

      // selffits://dashboard/student or selffits://student/dashboard
      if ((host == 'dashboard' && (path == '/student' || path == 'student')) ||
          (host == 'student' && (path == '/dashboard' || path == 'dashboard')) ||
          path == '/dashboard/student') {
        return ParsedDeepLink(
          action: DeepLinkAction.studentDashboard,
          originalUri: clean,
        );
      }

      // selffits://dashboard/coach or selffits://coach/dashboard
      if ((host == 'dashboard' && (path == '/coach' || path == 'coach')) ||
          (host == 'coach' && (path == '/dashboard' || path == 'dashboard')) ||
          path == '/dashboard/coach') {
        return ParsedDeepLink(
          action: DeepLinkAction.coachDashboard,
          originalUri: clean,
        );
      }

      // selffits://notifications
      if (host == 'notifications' ||
          path == '/notifications' ||
          path == 'notifications') {
        return ParsedDeepLink(
          action: DeepLinkAction.notificationsFeed,
          originalUri: clean,
        );
      }
    }

    return ParsedDeepLink(action: DeepLinkAction.unknown, originalUri: clean);
  }

  /// Safely executes deep link navigation.
  static Future<bool> navigate({
    required String deepLink,
    BuildContext? context,
    void Function(String meetingUrl)? onOpenMeeting,
    void Function()? onOpenNotifications,
    void Function()? onOpenStudentDashboard,
    void Function()? onOpenCoachDashboard,
  }) async {
    final parsed = parse(deepLink);

    switch (parsed.action) {
      case DeepLinkAction.joinLiveClass:
      case DeepLinkAction.externalWeb:
        final urlToLaunch = parsed.meetingUrl ?? parsed.originalUri;
        if (onOpenMeeting != null) {
          onOpenMeeting(urlToLaunch);
          return true;
        }

        final uri = Uri.tryParse(urlToLaunch);
        if (uri != null &&
            (urlToLaunch.startsWith('https://') ||
                urlToLaunch.startsWith('http://'))) {
          try {
            return await launchUrl(uri, mode: LaunchMode.externalApplication);
          } catch (_) {
            return false;
          }
        }

        // If joinLiveClass has no meetingUrl or invalid url, fallback to student dashboard
        if (parsed.action == DeepLinkAction.joinLiveClass) {
          if (onOpenStudentDashboard != null) {
            onOpenStudentDashboard();
            return true;
          }
          return _openStudentDashboard(context: context);
        }
        return false;

      case DeepLinkAction.notificationsFeed:
        if (onOpenNotifications != null) {
          onOpenNotifications();
          return true;
        }
        return _openNotifications(context: context);

      case DeepLinkAction.studentDashboard:
        if (onOpenStudentDashboard != null) {
          onOpenStudentDashboard();
          return true;
        }
        return _openStudentDashboard(context: context);

      case DeepLinkAction.coachDashboard:
        if (onOpenCoachDashboard != null) {
          onOpenCoachDashboard();
          return true;
        }
        return _openCoachDashboard(context: context);

      case DeepLinkAction.unknown:
        return false;
    }
  }

  /// Resolves the current NavigatorState from context or global navigatorKey.
  static NavigatorState? _resolveNavigator(BuildContext? context) {
    if (context != null && context.mounted) {
      final nav = Navigator.maybeOf(context);
      if (nav != null) return nav;
    }
    return navigatorKey.currentState;
  }

  /// Waits for Navigator to be ready if called during app boot or route build transitions.
  static Future<NavigatorState?> _waitForNavigator(BuildContext? context) async {
    NavigatorState? nav = _resolveNavigator(context);
    if (nav != null) return nav;

    final completer = Completer<NavigatorState?>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      completer.complete(_resolveNavigator(context));
    });
    return completer.future.timeout(
      const Duration(seconds: 1),
      onTimeout: () => navigatorKey.currentState,
    );
  }

  /// Navigates to NotificationsScreen
  static Future<bool> _openNotifications({BuildContext? context}) async {
    final nav = await _waitForNavigator(context);
    if (nav == null || !nav.mounted) return false;

    try {
      unawaited(
        nav.push(
          MaterialPageRoute(
            builder: (_) => const NotificationsScreen(),
            settings: const RouteSettings(name: '/notifications'),
          ),
        ),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Navigates to StudentHomeScreen (Dashboard tab)
  static Future<bool> _openStudentDashboard({BuildContext? context}) async {
    final nav = await _waitForNavigator(context);
    if (nav == null || !nav.mounted) return false;

    try {
      if (nav.context.mounted) {
        try {
          final container = ProviderScope.containerOf(nav.context, listen: false);
          container.read(studentAccountSectionProvider.notifier).state = 0;
        } catch (_) {}
      }

      if (!nav.mounted) return false;

      unawaited(
        nav.push(
          MaterialPageRoute(
            builder: (_) => const StudentHomeScreen(initialIndex: 0),
            settings: const RouteSettings(name: '/dashboard/student'),
          ),
        ),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Navigates to CoachHomeScreen
  static Future<bool> _openCoachDashboard({BuildContext? context}) async {
    final nav = await _waitForNavigator(context);
    if (nav == null || !nav.mounted) return false;

    try {
      unawaited(
        nav.push(
          MaterialPageRoute(
            builder: (_) => const CoachHomeScreen(),
            settings: const RouteSettings(name: '/dashboard/coach'),
          ),
        ),
      );
      return true;
    } catch (_) {
      return false;
    }
  }
}
