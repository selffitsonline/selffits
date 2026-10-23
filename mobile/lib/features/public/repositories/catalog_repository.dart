import 'dart:convert';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/public_catalog.dart';

class CatalogResult {
  final PublicCatalogData? data;
  final bool isFromCache;
  final bool hasError;
  final String? errorMessage;

  const CatalogResult({
    this.data,
    this.isFromCache = false,
    this.hasError = false,
    this.errorMessage,
  });
}

class CatalogRepository {
  final ApiClient apiClient;
  final ISecureStorageService storage;

  CatalogRepository({required this.apiClient, required this.storage});

  /// Fetches authoritative catalog from the shared Next.js backend.
  /// Falls back safely to locally cached catalog if offline.
  Future<CatalogResult> getCatalog({bool forceRefresh = false}) async {
    try {
      final path = forceRefresh
          ? '${ApiEndpoints.publicCatalog}?t=${DateTime.now().millisecondsSinceEpoch}'
          : ApiEndpoints.publicCatalog;

      final extraHeaders = forceRefresh
          ? const {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            }
          : null;

      final responseData = await apiClient.get(
        path,
        extraHeaders: extraHeaders,
      );

      final catalog = PublicCatalogData.fromJson(responseData);

      // Cache successful response locally
      try {
        await storage.saveCachedCatalog(jsonEncode(responseData));
      } catch (_) {}

      return CatalogResult(data: catalog, isFromCache: false);
    } catch (e) {
      // Network or API failure: attempt cached fallback
      try {
        final cachedJson = await storage.getCachedCatalog();
        if (cachedJson != null && cachedJson.isNotEmpty) {
          final decoded = jsonDecode(cachedJson) as Map<String, dynamic>;
          final cachedData = PublicCatalogData.fromJson(decoded);
          return CatalogResult(
            data: cachedData,
            isFromCache: true,
            errorMessage: 'Displaying cached pricing • Pull down to refresh',
          );
        }
      } catch (_) {}

      // No cache available
      final String msg;
      if (e is NetworkConnectionException) {
        msg = e.message;
      } else if (e is ApiException) {
        if (e.statusCode == 404) {
          msg = 'Academy catalog service is currently updating on the server. Please check back shortly.';
        } else if (e.statusCode != null && e.statusCode! >= 500) {
          msg = 'The server encountered an error loading catalog data. Please try again later.';
        } else {
          msg = e.message;
        }
      } else {
        msg = 'Unable to load program pricing. Please check your connection.';
      }
      return CatalogResult(data: null, hasError: true, errorMessage: msg);
    }
  }
}
