/// Base exception for all Mobile API interactions.
class ApiException implements Exception {
  final String message;
  final String code;
  final int? statusCode;

  const ApiException({
    required this.message,
    this.code = 'UNKNOWN_ERROR',
    this.statusCode,
  });

  @override
  String toString() => message;
}

/// Thrown when credentials fail authentication (HTTP 401).
class InvalidCredentialsException extends ApiException {
  const InvalidCredentialsException({
    super.message = 'Invalid email or password. Please try again.',
    super.code = 'INVALID_CREDENTIALS',
    super.statusCode = 401,
  });
}

/// Thrown when the mobile token has expired or is invalid (HTTP 401).
class TokenExpiredException extends ApiException {
  const TokenExpiredException({
    super.message = 'Your session has expired. Please sign in again.',
    super.code = 'TOKEN_EXPIRED',
    super.statusCode = 401,
  });
}

/// Thrown when an account has been suspended by an administrator (HTTP 403).
class AccountBlockedException extends ApiException {
  const AccountBlockedException({
    super.message =
        'Your account has been suspended. Please contact academy support.',
    super.code = 'ACCOUNT_BLOCKED',
    super.statusCode = 403,
  });
}

/// Thrown when a user with an unauthorized role attempts to access the student portal.
class ForbiddenRoleException extends ApiException {
  final String actualRole;

  const ForbiddenRoleException({
    required this.actualRole,
    super.message = 'Access denied. This portal is for students only.',
    super.code = 'FORBIDDEN_ROLE',
    super.statusCode = 403,
  });
}

/// Thrown when request input fails server validation (HTTP 400).
class ValidationException extends ApiException {
  final Map<String, List<String>> fieldErrors;

  const ValidationException({
    super.message = 'Invalid input provided.',
    super.code = 'VALIDATION_FAILED',
    super.statusCode = 400,
    this.fieldErrors = const {},
  });
}

/// Thrown when a socket, timeout, or network reachability issue occurs.
class NetworkConnectionException extends ApiException {
  const NetworkConnectionException({
    super.message =
        'Unable to connect to SELFFITS server. Please check your internet connection.',
    super.code = 'NETWORK_ERROR',
  });
}

/// Thrown when the backend encounters an unexpected internal error (HTTP 500).
class ServerException extends ApiException {
  const ServerException({
    super.message =
        'An unexpected server error occurred. Please try again later.',
    super.code = 'INTERNAL_SERVER_ERROR',
    super.statusCode = 500,
  });
}

/// Thrown when an account with the specified email already exists (HTTP 409).
class DuplicateEmailException extends ApiException {
  final Map<String, List<String>> fieldErrors;

  const DuplicateEmailException({
    super.message =
        'An account with this email address already exists. Please log in or reset your password.',
    super.code = 'DUPLICATE_EMAIL',
    super.statusCode = 409,
    this.fieldErrors = const {},
  });
}

/// Thrown when a client request rate limit is exceeded (HTTP 429).
class RateLimitException extends ApiException {
  final int? retryAfterSeconds;

  const RateLimitException({
    super.message = 'Too many attempts. Please try again later.',
    super.code = 'TOO_MANY_ATTEMPTS',
    super.statusCode = 429,
    this.retryAfterSeconds,
  });
}
