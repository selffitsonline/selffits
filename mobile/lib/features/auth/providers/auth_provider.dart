import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../notifications/providers/notification_provider.dart';
import '../models/auth_state.dart';
import '../repositories/auth_repository.dart';
import '../../../app.dart';
import '../../coach/providers/coach_dashboard_provider.dart';
import '../../public/providers/catalog_provider.dart';
import '../../student/providers/student_dashboard_provider.dart';

/// Provider for the HTTP ApiClient.
final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient();
  ref.onDispose(() => client.dispose());
  return client;
});

/// Provider for hardware-backed secure storage.
/// In tests, this can be overridden with an InMemorySecureStorageService.
final secureStorageProvider = Provider<ISecureStorageService>((ref) {
  return FlutterSecureStorageService();
});

/// Provider for the AuthRepository.
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthRepository(apiClient: apiClient, secureStorage: secureStorage);
});

/// StateNotifier managing the authentication lifecycle.
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final Future<void> Function()? onLogin;
  final Future<void> Function()? onLogout;
  bool _isRestoring = false;

  AuthNotifier(this._repository, {this.onLogin, this.onLogout})
    : super(AuthState.initial());

  /// Restores session on app startup by validating the stored token against GET /api/v1/auth/me.
  /// Strictly guarded against racing with active login and never overwrites an authenticated state.
  Future<void> restoreSession() async {
    if (state.isAuthenticated || _isRestoring) {
      return;
    }
    _isRestoring = true;
    state = AuthState.loading();

    try {
      final session = await _repository.restoreSession().timeout(
        const Duration(seconds: 5),
      );

      // Guard: do not overwrite if user successfully logged in while restoration was in flight
      if (state.isAuthenticated) {
        return;
      }

      if (session != null) {
        state = AuthState.authenticated(
          user: session.user,
          accessToken: session.accessToken,
        );
        if (onLogin != null) {
          try {
            await onLogin!();
          } catch (_) {}
        }
      } else {
        state = AuthState.unauthenticated();
      }
    } on NetworkConnectionException catch (e) {
      if (!state.isAuthenticated) {
        state = AuthState.unauthenticated(errorMessage: e.message);
      }
    } catch (_) {
      if (!state.isAuthenticated) {
        state = AuthState.unauthenticated();
      }
    } finally {
      _isRestoring = false;
    }
  }

  /// Authenticates a student via POST /api/v1/auth/login.
  Future<bool> login({required String email, required String password}) async {
    state = AuthState.loading();

    try {
      final session = await _repository.login(email: email, password: password);

      state = AuthState.authenticated(
        user: session.user,
        accessToken: session.accessToken,
      );
      if (onLogin != null) {
        try {
          await onLogin!();
        } catch (_) {}
      }
      return true;
    } on ApiException catch (e) {
      state = AuthState.unauthenticated(errorMessage: e.message);
      return false;
    } catch (_) {
      state = AuthState.unauthenticated(
        errorMessage: 'An unexpected error occurred during login.',
      );
      return false;
    }
  }

  /// Authenticates a coach via POST /api/v1/auth/login.
  Future<bool> loginCoach({
    required String email,
    required String password,
  }) async {
    state = AuthState.loading();

    try {
      final session = await _repository.loginCoach(
        email: email,
        password: password,
      );

      state = AuthState.authenticated(
        user: session.user,
        accessToken: session.accessToken,
      );
      if (onLogin != null) {
        try {
          await onLogin!();
        } catch (_) {}
      }
      return true;
    } on ApiException catch (e) {
      state = AuthState.unauthenticated(errorMessage: e.message);
      return false;
    } catch (_) {
      state = AuthState.unauthenticated(
        errorMessage: 'An unexpected error occurred during coach login.',
      );
      return false;
    }
  }

  /// Logs out the user and clears all credentials.
  Future<void> logout() async {
    // Run onLogout before clearing credentials to ensure push token unregistration has the active token
    if (onLogout != null) {
      try {
        await onLogout!();
      } catch (_) {}
    }
    await _repository.logout();
    state = AuthState.unauthenticated();
  }

  /// Clears transient error messages.
  void clearError() {
    if (state.errorMessage != null) {
      state = state.copyWith(errorMessage: null);
    }
  }
}

/// Global StateNotifierProvider for AuthState.
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(
    repository,
    onLogin: () async {
      await ref.read(notificationsProvider.notifier).syncDeviceToken();
      await ref.read(onboardingProvider.notifier).completeOnboarding();
    },
    onLogout: () async {
      await ref.read(notificationsProvider.notifier).unregisterOnLogout();
      // Reset in-memory student, coach, and checkout states
      ref.read(studentDashboardProvider.notifier).reset();
      ref.read(coachDashboardProvider.notifier).reset();
      ref.read(pendingCheckoutProvider.notifier).state = false;
      await ref.read(onboardingProvider.notifier).completeOnboarding();
      // Cleanly pop all pushed routes / modals / sheets
      rootNavigatorKey.currentState?.popUntil((route) => route.isFirst);
    },
  );
});

/// StateNotifier managing whether the user has completed onboarding.
/// null = status check pending, false = show onboarding, true = onboarding completed.
class OnboardingNotifier extends StateNotifier<bool?> {
  final ISecureStorageService _storage;

  OnboardingNotifier(this._storage) : super(null) {
    checkOnboardingStatus();
  }

  Future<void> checkOnboardingStatus() async {
    try {
      final completed = await _storage.hasCompletedOnboarding();
      state = completed;
    } catch (_) {
      state = false;
    }
  }

  Future<void> completeOnboarding() async {
    try {
      await _storage.setCompletedOnboarding(true);
    } catch (_) {}
    state = true;
  }

  Future<void> resetOnboarding() async {
    try {
      await _storage.setCompletedOnboarding(false);
    } catch (_) {}
    state = false;
  }
}

/// Global StateNotifierProvider for onboarding completion status.
final onboardingProvider = StateNotifierProvider<OnboardingNotifier, bool?>((
  ref,
) {
  final storage = ref.watch(secureStorageProvider);
  return OnboardingNotifier(storage);
});
