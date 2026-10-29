import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_exceptions.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/student_dashboard_data.dart';
import '../repositories/student_repository.dart';

/// State representation for the Student Live Class Dashboard.
class StudentDashboardState {
  final bool isLoading;
  final StudentDashboardData? data;
  final String? errorMessage;
  final bool isUnauthorized;

  const StudentDashboardState({
    this.isLoading = false,
    this.data,
    this.errorMessage,
    this.isUnauthorized = false,
  });

  bool get hasData => data != null;

  factory StudentDashboardState.loading() =>
      const StudentDashboardState(isLoading: true);

  factory StudentDashboardState.loaded(StudentDashboardData data) =>
      StudentDashboardState(data: data);

  factory StudentDashboardState.error(
    String message, {
    bool isUnauthorized = false,
    StudentDashboardData? existingData,
  }) => StudentDashboardState(
    data: existingData,
    errorMessage: message,
    isUnauthorized: isUnauthorized,
  );
}

/// Provider for StudentRepository.
final studentRepositoryProvider = Provider<StudentRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return StudentRepository(apiClient: apiClient, secureStorage: secureStorage);
});

/// StateNotifier managing real-time student dashboard updates.
class StudentDashboardNotifier extends StateNotifier<StudentDashboardState> {
  final StudentRepository _repository;
  final Ref _ref;

  StudentDashboardNotifier(this._repository, this._ref)
    : super(const StudentDashboardState(isLoading: true));

  /// Loads the student dashboard data from the backend.
  Future<void> loadDashboard() async {
    state = StudentDashboardState.loading();

    try {
      final inMemoryToken = _ref.read(authProvider).accessToken;
      final data = await _repository.getDashboard(token: inMemoryToken);
      state = StudentDashboardState.loaded(data);
    } on TokenExpiredException {
      state = StudentDashboardState.error(
        'Your session has expired. Please sign in again.',
        isUnauthorized: true,
      );
      // Auto-logout server-verified expired session only
      await _ref.read(authProvider.notifier).logout();
    } on ApiException catch (e) {
      if (e.statusCode == 401 &&
          (e.code == 'TOKEN_EXPIRED' ||
              e.code == 'INVALID_TOKEN' ||
              e.code == 'UNAUTHORIZED')) {
        state = StudentDashboardState.error(e.message, isUnauthorized: true);
        await _ref.read(authProvider.notifier).logout();
      } else {
        state = StudentDashboardState.error(e.message);
      }
    } catch (_) {
      state = StudentDashboardState.error(
        'Unable to load your live class schedule. Please pull to refresh.',
      );
    }
  }

  /// Refreshes dashboard data for pull-to-refresh interactions.
  Future<void> refresh() async {
    try {
      final inMemoryToken = _ref.read(authProvider).accessToken;
      final data = await _repository.getDashboard(token: inMemoryToken);
      state = StudentDashboardState.loaded(data);
    } on TokenExpiredException {
      state = StudentDashboardState.error(
        'Your session has expired. Please sign in again.',
        isUnauthorized: true,
      );
      await _ref.read(authProvider.notifier).logout();
    } on ApiException catch (e) {
      if (e.statusCode == 401 &&
          (e.code == 'TOKEN_EXPIRED' ||
              e.code == 'INVALID_TOKEN' ||
              e.code == 'UNAUTHORIZED')) {
        await _ref.read(authProvider.notifier).logout();
      } else {
        state = StudentDashboardState.error(
          e.message,
          existingData: state.data,
        );
      }
    } catch (_) {
      state = StudentDashboardState.error(
        'Unable to refresh live class schedule. Check your connection.',
        existingData: state.data,
      );
    }
  }

  /// Clears in-memory dashboard data upon user logout.
  void reset() {
    _repository.clearDemoEnrollment();
    state = const StudentDashboardState();
  }
}

/// Global StateNotifierProvider for StudentDashboardState.
final studentDashboardProvider =
    StateNotifierProvider<StudentDashboardNotifier, StudentDashboardState>((
      ref,
    ) {
      final repository = ref.watch(studentRepositoryProvider);
      return StudentDashboardNotifier(repository, ref);
    });
