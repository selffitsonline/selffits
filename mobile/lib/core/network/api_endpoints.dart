import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

/// Centralized API endpoint routes and base URL configuration for the SELFFITS Mobile App.
abstract class ApiEndpoints {
  /// Default base URL pointing to the Next.js backend.
  /// Can be overridden via --dart-define=API_BASE_URL=...
  /// In debug mode, defaults to http://10.0.2.2:3000 to match local website.
  /// In release mode, defaults to https://selffits.com.
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');
  static String? customBaseUrl;

  static String get baseUrl {
    if (customBaseUrl != null && customBaseUrl!.isNotEmpty) {
      return customBaseUrl!;
    }
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;

    // In debug mode, point to local Next.js development server
    // (10.0.2.2:3000 for Android emulator, localhost:3000 for iOS/desktop)
    if (kDebugMode && !_isTestEnvironment) {
      try {
        if (Platform.isAndroid) {
          return 'http://10.0.2.2:3000';
        }
        return 'http://localhost:3000';
      } catch (_) {
        return 'http://10.0.2.2:3000';
      }
    }

    // Default to authoritative production domain for release builds
    return 'https://selffits.com';
  }

  static bool get _isTestEnvironment {
    try {
      return Platform.environment.containsKey('FLUTTER_TEST');
    } catch (_) {
      return false;
    }
  }

  // API v1 Namespace
  static const String apiV1 = '/api/v1';

  // Authentication Endpoints
  static const String login = '$apiV1/auth/login';
  static const String authMe = '$apiV1/auth/me';
  static const String register = '$apiV1/auth/register';
  static const String forgotPassword = '$apiV1/auth/forgot-password';

  // Student Endpoints
  static const String studentDashboard = '$apiV1/student/dashboard';
  static const String studentEnroll = '$apiV1/student/enroll';
  static const String validateCoupon = '$apiV1/coupons/validate';
  static const String createPaymentOrder = '$apiV1/payments/create-order';
  static const String testPaymentCheckout = '$apiV1/payments/test-checkout';

  // Coach Endpoints (Reserved for future modules)
  static const String coachDashboard = '$apiV1/coach/dashboard';

  // Notification Endpoints
  static const String deviceToken = '$apiV1/notifications/device-token';
  static const String notifications = '$apiV1/notifications';

  // Public Endpoints
  static const String publicCatalog = '$apiV1/public/catalog';

  /// Helper to build full URL from path
  static Uri uri(String path) {
    final cleanBase = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$cleanBase$cleanPath');
  }
}
