import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/coach_dashboard_data.dart';

/// Repository responsible for loading coach dashboard, assigned batches, and student rosters.
class CoachRepository {
  final ApiClient apiClient;
  final ISecureStorageService secureStorage;

  CoachRepository({required this.apiClient, required this.secureStorage});

  /// Fetches real-time coach dashboard data from GET /api/v1/coach/dashboard.
  Future<CoachDashboardData> getDashboard({String? token}) async {
    final effectiveToken = token ?? await secureStorage.getAccessToken();
    if (effectiveToken == null || effectiveToken.isEmpty) {
      throw const TokenExpiredException();
    }

    final responseData = await apiClient.get(
      ApiEndpoints.coachDashboard,
      token: effectiveToken,
    );

    return CoachDashboardData.fromJson(responseData);
  }
}
