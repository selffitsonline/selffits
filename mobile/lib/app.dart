import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/design_system/design_system.dart';
import 'features/auth/models/auth_state.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/coach/presentation/coach_home_screen.dart';
import 'features/notifications/models/notification_item.dart';
import 'features/notifications/providers/notification_provider.dart';
import 'features/notifications/services/deep_link_navigator.dart';
import 'features/notifications/services/fcm_push_service.dart';
import 'features/onboarding/presentation/onboarding_screen.dart';
import 'features/public/presentation/enrollment_checkout_screen.dart';
import 'features/public/presentation/public_main_shell.dart';
import 'features/public/providers/catalog_provider.dart';

/// Global root NavigatorKey to enforce clean route clearing and prevent stale pushed screens
final GlobalKey<NavigatorState> rootNavigatorKey = DeepLinkNavigator.navigatorKey;

/// Root application widget for SELFFITS Mobile.
/// Configures Luxury White design system, hardware-backed session restoration,
/// and protected route resolution.
class SelffitsApp extends ConsumerStatefulWidget {
  const SelffitsApp({super.key});

  @override
  ConsumerState<SelffitsApp> createState() => _SelffitsAppState();
}

class _SelffitsAppState extends ConsumerState<SelffitsApp> {
  StreamSubscription<PushNotificationPayload>? _notificationOpenedSub;

  @override
  void initState() {
    super.initState();
    // Restore session and verify onboarding state on app boot immediately
    Future.microtask(() {
      if (mounted) {
        ref.read(authProvider.notifier).restoreSession();
        ref.read(onboardingProvider.notifier).checkOnboardingStatus();
        _setupNotificationRouting();
      }
    });
  }

  void _setupNotificationRouting() {
    void handlePayload(PushNotificationPayload payload) {
      final link = payload.deepLink ?? payload.meetingUrl;
      if (link != null && link.trim().isNotEmpty) {
        DeepLinkNavigator.navigate(
          deepLink: link.trim(),
          context: rootNavigatorKey.currentContext,
        );
      }
    }

    // 1. Listen for background & foreground notification tap routing
    _notificationOpenedSub = ref
        .read(notificationServiceProvider)
        .onNotificationOpenedApp
        .listen(handlePayload);

    // 2. Check if the app was launched by tapping a notification from a terminated state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FcmPushService.instance.getInitialPayload().then((payload) {
        if (!mounted) return;
        if (payload != null) {
          handlePayload(payload);
        }
      });
    });
  }

  @override
  void dispose() {
    _notificationOpenedSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: rootNavigatorKey,
      title: 'SELFFITS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.luxuryWhiteTheme,
      home: const AuthGatekeeper(),
    );
  }
}

/// Protected Route Gatekeeper:
/// - Loading -> Luxury white splash with authentic Selffits logo
/// - Authenticated & Pending Enrollment Checkout -> EnrollmentCheckoutScreen
/// - Authenticated as Student -> StudentHomeScreen
/// - Authenticated as Coach/Admin -> CoachHomeScreen
/// - Unauthenticated & First Launch -> OnboardingScreen (3 slides)
/// - Unauthenticated & Returning Guest -> PublicMainShell (Two tabs: Home & Account)
class AuthGatekeeper extends ConsumerWidget {
  const AuthGatekeeper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final hasOnboarded = ref.watch(onboardingProvider);
    final isPendingCheckout = ref.watch(pendingCheckoutProvider);

    switch (authState.status) {
      case AuthStatus.initial:
      case AuthStatus.loading:
        return const _AuthLoadingSplashScreen();

      case AuthStatus.authenticated:
        if (isPendingCheckout) {
          return const EnrollmentCheckoutScreen();
        }
        if (authState.isStudent) {
          return const PublicMainShell(initialIndex: 1);
        } else if (authState.isCoach || authState.isAdmin) {
          return const CoachHomeScreen();
        }
        return const PublicMainShell(initialIndex: 1);

      case AuthStatus.unauthenticated:
        if (hasOnboarded == null) {
          return const _AuthLoadingSplashScreen();
        }
        if (!hasOnboarded) {
          return const OnboardingScreen();
        }
        return const PublicMainShell(initialIndex: 0);
    }
  }
}

/// Luxury White Splash / Loading Screen during session restoration.
class _AuthLoadingSplashScreen extends StatelessWidget {
  const _AuthLoadingSplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SelffitsLogo(
              height: 48,
              showText: false,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: AppSpacing.xxl),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2.4,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.brandRed),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Securing Martial Arts Portal...',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
