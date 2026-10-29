import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_exceptions.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/coach_dashboard_data.dart';
import '../repositories/coach_repository.dart';

/// State representation for the Coach Live Dashboard.
class CoachDashboardState {
  final bool isLoading;
  final CoachDashboardData? data;
  final String? errorMessage;
  final bool isUnauthorized;

  const CoachDashboardState({
    this.isLoading = false,
    this.data,
    this.errorMessage,
    this.isUnauthorized = false,
  });

  bool get hasData => data != null;

  factory CoachDashboardState.loading() =>
      const CoachDashboardState(isLoading: true);

  factory CoachDashboardState.loaded(CoachDashboardData data) =>
      CoachDashboardState(data: data);

  factory CoachDashboardState.error(
    String message, {
    bool isUnauthorized = false,
    CoachDashboardData? existingData,
  }) => CoachDashboardState(
    data: existingData,
    errorMessage: message,
    isUnauthorized: isUnauthorized,
  );
}

/// Provider for CoachRepository.
final coachRepositoryProvider = Provider<CoachRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return CoachRepository(apiClient: apiClient, secureStorage: secureStorage);
});

/// StateNotifier managing real-time coach dashboard updates.
class CoachDashboardNotifier extends StateNotifier<CoachDashboardState> {
  final CoachRepository _repository;
  final Ref? _ref;

  CoachDashboardNotifier(this._repository, [this._ref])
    : super(const CoachDashboardState(isLoading: true));

  /// Loads coach dashboard data from the backend.
  Future<void> loadDashboard() async {
    state = CoachDashboardState.loading();

    try {
      final token = _ref?.read(authProvider).accessToken;
      final data = await _repository.getDashboard(token: token);
      state = CoachDashboardState.loaded(data);
    } on TokenExpiredException {
      state = CoachDashboardState.error(
        'Your session has expired. Please sign in again.',
        isUnauthorized: true,
      );
      await _ref?.read(authProvider.notifier).logout();
    } on ApiException catch (e) {
      if (e.statusCode == 401 &&
          (e.code == 'TOKEN_EXPIRED' ||
              e.code == 'INVALID_TOKEN' ||
              e.code == 'UNAUTHORIZED')) {
        state = CoachDashboardState.error(e.message, isUnauthorized: true);
        await _ref?.read(authProvider.notifier).logout();
      } else {
        state = CoachDashboardState.error(e.message);
      }
    } catch (_) {
      state = CoachDashboardState.error(
        'Unable to load your training batches. Please pull to refresh.',
      );
    }
  }

  /// Refreshes dashboard data for pull-to-refresh interactions.
  Future<void> refresh() async {
    try {
      final token = _ref?.read(authProvider).accessToken;
      final data = await _repository.getDashboard(token: token);
      state = CoachDashboardState.loaded(data);
    } on TokenExpiredException {
      state = CoachDashboardState.error(
        'Your session has expired. Please sign in again.',
        isUnauthorized: true,
      );
      await _ref?.read(authProvider.notifier).logout();
    } on ApiException catch (e) {
      if (e.statusCode == 401 &&
          (e.code == 'TOKEN_EXPIRED' ||
              e.code == 'INVALID_TOKEN' ||
              e.code == 'UNAUTHORIZED')) {
        await _ref?.read(authProvider.notifier).logout();
      } else {
        state = CoachDashboardState.error(e.message, existingData: state.data);
      }
    } catch (_) {
      state = CoachDashboardState.error(
        'Unable to refresh training batches. Check your connection.',
        existingData: state.data,
      );
    }
  }

  /// Clears in-memory dashboard data upon user logout.
  void reset() {
    state = const CoachDashboardState();
  }
}

/// Global StateNotifierProvider for CoachDashboardState.
final coachDashboardProvider =
    StateNotifierProvider<CoachDashboardNotifier, CoachDashboardState>((ref) {
      final repository = ref.watch(coachRepositoryProvider);
      return CoachDashboardNotifier(repository, ref);
    });
