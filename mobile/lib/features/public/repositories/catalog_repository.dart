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

  // In-memory catalog cache to eliminate disk KeyStore reads and network waits on repeat visits
  PublicCatalogData? _memoryCache;
  DateTime? _memoryCacheTime;
  static const Duration _memoryTtl = Duration(minutes: 5);

  // In-flight request deduplication to prevent duplicate concurrent network calls
  Future<CatalogResult>? _inFlightRequest;

  CatalogRepository({required this.apiClient, required this.storage});

  /// Synchronously returns current in-memory cached catalog data if available.
  PublicCatalogData? get memoryCachedData => _memoryCache;

  /// Returns true if valid, unexpired in-memory catalog data is available.
  bool get isMemoryCacheValid {
    if (_memoryCache == null || _memoryCacheTime == null) return false;
    return DateTime.now().difference(_memoryCacheTime!) < _memoryTtl;
  }

  /// Clears in-memory catalog cache (e.g. for testing, account switch, or forced reset).
  void clearMemoryCache() {
    _memoryCache = null;
    _memoryCacheTime = null;
    _inFlightRequest = null;
  }

  /// Retrieves immediately available cached catalog data.
  /// Checks valid in-memory cache first (0ms) to avoid blocking on secure-storage KeyStore I/O.
  Future<PublicCatalogData?> getCachedData() async {
    // 1. Instant check: return in-memory cache immediately if present
    if (_memoryCache != null) {
      return _memoryCache;
    }

    // 2. Fallback to disk cache only when in-memory cache is empty
    try {
      final cachedJson = await storage.getCachedCatalog();
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final decoded = jsonDecode(cachedJson) as Map<String, dynamic>;
        final data = PublicCatalogData.fromJson(decoded);
        _memoryCache = data;
        _memoryCacheTime = DateTime.now();
        return data;
      }
    } catch (_) {}
    return null;
  }

  /// Fetches authoritative catalog from the shared Next.js backend.
  /// - Returns fresh in-memory data immediately when valid and not force-refreshing.
  /// - Deduplicates concurrent calls to share a single in-flight request.
  /// - Falls back safely to in-memory or locally cached catalog if offline.
  Future<CatalogResult> getCatalog({bool forceRefresh = false}) async {
    // 1. Return fresh in-memory cache immediately if valid and not forcing refresh
    if (!forceRefresh && isMemoryCacheValid && _memoryCache != null) {
      return CatalogResult(data: _memoryCache, isFromCache: false);
    }

    // 2. Deduplicate concurrent requests: reuse existing in-flight future
    if (!forceRefresh && _inFlightRequest != null) {
      return _inFlightRequest!;
    }

    final future = _executeFetchCatalog(forceRefresh: forceRefresh);
    if (!forceRefresh) {
      _inFlightRequest = future;
    }

    try {
      return await future;
    } finally {
      if (!forceRefresh) {
        _inFlightRequest = null;
      }
    }
  }

  Future<CatalogResult> _executeFetchCatalog({required bool forceRefresh}) async {
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

      // Populate in-memory cache immediately
      _memoryCache = catalog;
      _memoryCacheTime = DateTime.now();

      // Persist successful response locally in background
      try {
        await storage.saveCachedCatalog(jsonEncode(responseData));
      } catch (_) {}

      return CatalogResult(data: catalog, isFromCache: false);
    } catch (e) {
      // Network or API failure: attempt in-memory fallback first, then disk fallback
      if (_memoryCache != null) {
        return CatalogResult(
          data: _memoryCache,
          isFromCache: true,
          errorMessage: 'Displaying cached pricing • Pull down to refresh',
        );
      }

      try {
        final cachedJson = await storage.getCachedCatalog();
        if (cachedJson != null && cachedJson.isNotEmpty) {
          final decoded = jsonDecode(cachedJson) as Map<String, dynamic>;
          final cachedData = PublicCatalogData.fromJson(decoded);
          _memoryCache = cachedData;
          _memoryCacheTime = DateTime.now();
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
          msg =
              'Academy catalog service is currently updating on the server. Please check back shortly.';
        } else if (e.statusCode != null && e.statusCode! >= 500) {
          msg =
              'The server encountered an error loading catalog data. Please try again later.';
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
