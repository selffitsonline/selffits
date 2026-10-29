import 'dart:io' show Platform;
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/auth_user.dart';
import '../models/registration_payload.dart';
import '../models/registration_result.dart';

/// Repository coordinating student authentication, session restoration,
/// and hardware-backed credential storage.
class AuthRepository {
  final ApiClient apiClient;
  final ISecureStorageService secureStorage;

  AuthRepository({required this.apiClient, required this.secureStorage});

  /// Registers a new student account via POST /api/v1/auth/register.
  /// Does NOT authenticate the student or save tokens; account requires email verification.
  Future<RegistrationResult> registerStudent(
    RegistrationPayload payload,
  ) async {
    final responseData = await apiClient.post(
      ApiEndpoints.register,
      body: payload.toJson(),
    );

    return RegistrationResult.fromJson(responseData);
  }

  /// Initiates password recovery via POST /api/v1/auth/forgot-password.
  /// Always returns a generic confirmation message regardless of account existence.
  Future<String> forgotPassword({required String email}) async {
    final cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.isEmpty) {
      throw const ValidationException(
        message: 'Please enter your email address.',
        fieldErrors: {
          'email': ['Email address is required.'],
        },
      );
    }

    final responseData = await apiClient.post(
      ApiEndpoints.forgotPassword,
      body: {'email': cleanEmail},
    );

    return responseData['message'] as String? ??
        'If an account exists with that email, a password reset link has been sent.';
  }

  /// Authenticates credentials against POST /api/v1/auth/login.
  /// Enforces:
  /// - Strict role verification on the server response.
  /// - Hardware-backed secure storage of bearer token on success.
  /// - Zero client-side caching of passwords or credentials.
  Future<({AuthUser user, String accessToken})> login({
    required String email,
    required String password,
    List<String> allowedRoles = const ['STUDENT'],
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanPassword = password.trim();

    if (cleanEmail.isEmpty) {
      throw const ValidationException(
        message: 'Please enter your email address.',
        fieldErrors: {
          'email': ['Email address is required.'],
        },
      );
    }

    if (cleanPassword.isEmpty) {
      throw const ValidationException(
        message: 'Please enter your password.',
        fieldErrors: {
          'password': ['Password is required.'],
        },
      );
    }

    String platform = 'unknown';
    try {
      if (Platform.isAndroid) platform = 'android';
      if (Platform.isIOS) platform = 'ios';
    } catch (_) {
      // Fallback for web/test environments
    }

    final responseData = await apiClient.post(
      ApiEndpoints.login,
      body: {
        'email': cleanEmail,
        'password': cleanPassword,
        'deviceInfo': {'platform': platform, 'appVersion': '1.0.0'},
      },
    );

    final token = responseData['accessToken'] as String?;
    final userJson = responseData['user'] as Map<String, dynamic>?;

    if (token == null || userJson == null) {
      throw const ApiException(
        message: 'Malformed response received from authentication server.',
      );
    }

    final authUser = AuthUser.fromJson(userJson);

    // Rule: Strict Role Authorization Check
    if (!allowedRoles.contains(authUser.role)) {
      throw ForbiddenRoleException(
        actualRole: authUser.role,
        message:
            'Access denied. Account is registered as ${authUser.role}. This app portal is reserved for students.',
      );
    }

    // Persist verified session securely
    await secureStorage.saveSession(
      token: token,
      userId: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
    );

    return (user: authUser, accessToken: token);
  }

  /// Authenticates coach credentials against POST /api/v1/auth/login.
  Future<({AuthUser user, String accessToken})> loginCoach({
    required String email,
    required String password,
  }) async {
    return login(
      email: email,
      password: password,
      allowedRoles: const ['COACH', 'ADMIN', 'SUPER_ADMIN'],
    );
  }

  /// Restores a previously authenticated session upon app restart.
  /// Server-side validation via GET /api/v1/auth/me is mandatory:
  /// Never trusts a locally stored token without verifying it against the server.
  Future<({AuthUser user, String accessToken})?> restoreSession() async {
    final token = await secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      return null;
    }

    try {
      final responseData = await apiClient.get(
        ApiEndpoints.authMe,
        token: token,
      );

      final authUser = AuthUser.fromJson(responseData);

      // Verify that user role is still authorized as STUDENT, COACH, or ADMIN
      final isAuthorizedRole =
          authUser.isStudent || authUser.isCoach || authUser.isAdmin;
      if (!isAuthorizedRole || authUser.isBlocked) {
        await secureStorage.clearSession();
        return null;
      }

      return (user: authUser, accessToken: token);
    } on TokenExpiredException {
      await secureStorage.clearSession();
      return null;
    } on AccountBlockedException {
      await secureStorage.clearSession();
      return null;
    } on ApiException catch (e) {
      if (e.statusCode == 401 || e.statusCode == 403) {
        await secureStorage.clearSession();
        return null;
      }
      rethrow;
    }
  }

  /// Logs the student out and deletes all hardware-stored session tokens.
  Future<void> logout() async {
    await secureStorage.clearSession();
  }

  /// Returns whether a token currently exists in secure storage.
  Future<bool> hasStoredToken() => secureStorage.hasToken();
}
