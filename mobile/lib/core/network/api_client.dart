import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_endpoints.dart';
import 'api_exceptions.dart';

/// Secure, resilient HTTP Client for SELFFITS Mobile API communication.
/// Strictly enforces:
/// 1. Zero logging of passwords, tokens, or sensitive headers.
/// 2. Cryptographic Bearer token injection.
/// 3. Resilient timeout and socket failure mapping.
/// 4. Strict typed exception handling.
class ApiClient {
  final http.Client _httpClient;
  final Duration timeout;

  ApiClient({
    http.Client? httpClient,
    this.timeout = const Duration(seconds: 12),
  }) : _httpClient = httpClient ?? http.Client();

  /// Performs an authenticated or unauthenticated POST request.
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    String? token,
  }) async {
    final uri = ApiEndpoints.uri(path);
    final headers = _buildHeaders(token);

    try {
      final response = await _httpClient
          .post(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeout);

      return _processResponse(response);
    } on SocketException {
      throw const NetworkConnectionException();
    } on TimeoutException {
      throw const NetworkConnectionException(
        message: 'Request timed out. Please check your network connection.',
      );
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const NetworkConnectionException();
    }
  }

  /// Performs an authenticated GET request.
  Future<Map<String, dynamic>> get(
    String path, {
    String? token,
    Map<String, String>? extraHeaders,
  }) async {
    final uri = ApiEndpoints.uri(path);
    final headers = _buildHeaders(token, extraHeaders: extraHeaders);

    try {
      final response = await _httpClient
          .get(uri, headers: headers)
          .timeout(timeout);

      return _processResponse(response);
    } on SocketException {
      throw const NetworkConnectionException();
    } on TimeoutException {
      throw const NetworkConnectionException(
        message: 'Request timed out. Please check your network connection.',
      );
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const NetworkConnectionException();
    }
  }

  /// Performs an authenticated DELETE request.
  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, dynamic>? body,
    String? token,
  }) async {
    final uri = ApiEndpoints.uri(path);
    final headers = _buildHeaders(token);

    try {
      final response = await _httpClient
          .delete(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeout);

      return _processResponse(response);
    } on SocketException {
      throw const NetworkConnectionException();
    } on TimeoutException {
      throw const NetworkConnectionException(
        message: 'Request timed out. Please check your network connection.',
      );
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const NetworkConnectionException();
    }
  }

  /// Performs an authenticated PATCH request.
  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
    String? token,
  }) async {
    final uri = ApiEndpoints.uri(path);
    final headers = _buildHeaders(token);

    try {
      final response = await _httpClient
          .patch(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeout);

      return _processResponse(response);
    } on SocketException {
      throw const NetworkConnectionException();
    } on TimeoutException {
      throw const NetworkConnectionException(
        message: 'Request timed out. Please check your network connection.',
      );
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const NetworkConnectionException();
    }
  }

  /// Constructs request headers with strict JSON Content-Type and optional Bearer token.
  Map<String, String> _buildHeaders(
    String? token, {
    Map<String, String>? extraHeaders,
  }) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  /// Parses and validates the standard SELFFITS API envelope response.
  Map<String, dynamic> _processResponse(http.Response response) {
    Map<String, dynamic> json;
    try {
      json = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      if (response.statusCode >= 500) {
        throw const ServerException();
      }
      throw ApiException(
        message: 'Invalid response from server.',
        statusCode: response.statusCode,
      );
    }

    // Success Envelope: { "success": true, "data": ... }
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (json['success'] == true) {
        return json['data'] as Map<String, dynamic>;
      }
      throw ApiException(
        message: json['error']?['message'] ?? 'Unknown operation failure.',
        code: json['error']?['code'] ?? 'OPERATION_FAILED',
        statusCode: response.statusCode,
      );
    }

    // Error Handling: { "success": false, "error": { "code": ..., "message": ... } }
    final errorObj = json['error'] as Map<String, dynamic>?;
    final errorCode = errorObj?['code'] as String? ?? 'UNKNOWN_ERROR';
    final errorMessage =
        errorObj?['message'] as String? ?? 'An error occurred.';

    switch (response.statusCode) {
      case 400:
        final rawFieldErrors =
            errorObj?['fieldErrors'] as Map<String, dynamic>?;
        final fieldErrors = <String, List<String>>{};
        if (rawFieldErrors != null) {
          rawFieldErrors.forEach((key, val) {
            if (val is List) {
              fieldErrors[key] = val.map((e) => e.toString()).toList();
            }
          });
        }
        throw ValidationException(
          message: errorMessage,
          code: errorCode,
          fieldErrors: fieldErrors,
        );

      case 401:
        if (errorCode == 'TOKEN_EXPIRED') {
          throw const TokenExpiredException();
        }
        if (errorCode == 'INVALID_CREDENTIALS') {
          throw const InvalidCredentialsException();
        }
        throw ApiException(
          message: errorMessage,
          code: errorCode,
          statusCode: 401,
        );

      case 403:
        if (errorCode == 'ACCOUNT_BLOCKED') {
          throw const AccountBlockedException();
        }
        throw ApiException(
          message: errorMessage,
          code: errorCode,
          statusCode: 403,
        );

      case 500:
      default:
        throw ServerException(
          message: errorMessage,
          code: errorCode,
          statusCode: response.statusCode,
        );
    }
  }

  void dispose() {
    _httpClient.close();
  }
}
