import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../design_system/design_system.dart';

/// Function signature for raw URL launching, facilitating unit testing without native platform channels.
typedef RawUrlLauncher = Future<bool> Function(Uri uri, LaunchMode mode);

/// Centralized URL Navigation Helper for SELFFITS Mobile.
///
/// Ensures:
/// - Informational, legal, and portal web pages open inside an in-app browser view
///   (Android Custom Tabs / iOS SFSafariViewController), preserving Flutter navigation state and scroll positions.
/// - System schemes (`mailto:`, `tel:`, `sms:`) open in native system applications.
/// - Virtual classroom video conferences (Google Meet, Zoom, Microsoft Teams) open in native/external applications
///   to ensure full hardware camera, microphone, WebRTC, and picture-in-picture support.
/// - Graceful fallback from in-app browser view to external application if the platform tab fails.
/// - Consistent luxury-white error snackbars on launch failures.
class AppUrlLauncher {
  AppUrlLauncher._();

  /// Checks if the given URI points to a known live classroom or video conferencing service.
  static bool isLiveClassMeetingUrl(Uri uri) {
    final host = uri.host.toLowerCase();
    return host == 'meet.google.com' ||
        host.endsWith('.meet.google.com') ||
        host == 'zoom.us' ||
        host.endsWith('.zoom.us') ||
        host == 'teams.microsoft.com' ||
        host.endsWith('.teams.microsoft.com') ||
        host == 'teams.live.com';
  }

  /// Checks if the given URI is a direct native system scheme.
  static bool isSystemScheme(Uri uri) {
    final scheme = uri.scheme.toLowerCase();
    return scheme == 'mailto' || scheme == 'tel' || scheme == 'sms';
  }

  /// Checks if the given URI is a general HTTP/HTTPS web URL (excluding live video classrooms).
  static bool isWebUrl(Uri uri) {
    final scheme = uri.scheme.toLowerCase();
    return (scheme == 'http' || scheme == 'https') && !isLiveClassMeetingUrl(uri);
  }

  /// Resolves the recommended [LaunchMode] for a given [Uri].
  static LaunchMode resolveLaunchMode(Uri uri) {
    if (isSystemScheme(uri)) {
      return LaunchMode.externalApplication;
    }
    if (isLiveClassMeetingUrl(uri)) {
      return LaunchMode.externalApplication;
    }
    if (isWebUrl(uri)) {
      return LaunchMode.inAppBrowserView;
    }
    return LaunchMode.externalApplication;
  }

  /// Convenience method to resolve [LaunchMode] from a URL string.
  static LaunchMode resolveLaunchModeForUrl(String urlString) {
    final trimmed = urlString.trim();
    final uri = Uri.tryParse(trimmed);
    if (uri == null) return LaunchMode.externalApplication;
    return resolveLaunchMode(uri);
  }

  /// Launches a URL with automated classification, in-app browser view for web pages,
  /// safe fallback to external browser on platform failure, and user-facing error snackbar.
  ///
  /// [launcher] can be injected in tests to mock native platform launch responses.
  static Future<bool> launch(
    BuildContext? context,
    String urlString, {
    String? fallbackMessage,
    LaunchMode? overrideMode,
    RawUrlLauncher? launcher,
  }) async {
    final trimmed = urlString.trim();
    if (trimmed.isEmpty) {
      _showError(context, fallbackMessage ?? 'Invalid URL.');
      return false;
    }

    final uri = Uri.tryParse(trimmed);
    if (uri == null || (!uri.hasScheme && !trimmed.startsWith('/'))) {
      _showError(context, fallbackMessage ?? 'Invalid URL.');
      return false;
    }

    final rawLaunch = launcher ??
        (u, mode) => launchUrl(u, mode: mode);

    final targetMode = overrideMode ?? resolveLaunchMode(uri);

    try {
      if (targetMode == LaunchMode.inAppBrowserView) {
        // 1. Attempt in-app browser view (Chrome Custom Tabs / SFSafariViewController)
        bool launched = false;
        try {
          launched = await rawLaunch(uri, LaunchMode.inAppBrowserView);
        } catch (_) {
          launched = false;
        }

        if (launched) {
          return true;
        }

        // 2. Fall back safely to external application if in-app browser view fails or throws
        try {
          final fallbackLaunched = await rawLaunch(
            uri,
            LaunchMode.externalApplication,
          );
          if (fallbackLaunched) {
            return true;
          }
        } catch (_) {}

        if (context != null && context.mounted) {
          _showError(context, fallbackMessage ?? 'Failed to open link.');
        }
        return false;
      } else {
        // 3. Launch directly with designated external mode (Meet, mailto, tel, etc.)
        final launched = await rawLaunch(uri, targetMode);
        if (!launched) {
          if (context != null && context.mounted) {
            _showError(context, fallbackMessage ?? 'Failed to open link.');
          }
          return false;
        }
        return true;
      }
    } catch (_) {
      if (context != null && context.mounted) {
        _showError(context, fallbackMessage ?? 'Failed to open link.');
      }
      return false;
    }
  }

  static void _showError(BuildContext? context, String message) {
    if (context != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.errorRose,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadii.smBorderRadius,
          ),
        ),
      );
    }
  }
}
