import 'auth_user.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated }

/// Represents the global authentication state of the SELFFITS mobile app.
class AuthState {
  final AuthStatus status;
  final AuthUser? user;
  final String? accessToken;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.accessToken,
    this.errorMessage,
  });

  bool get isAuthenticated =>
      status == AuthStatus.authenticated && user != null && accessToken != null;
  bool get isLoading => status == AuthStatus.loading;
  bool get isStudent => user?.isStudent ?? false;
  bool get isCoach => user?.isCoach ?? false;
  bool get isAdmin => user?.isAdmin ?? false;

  factory AuthState.initial() => const AuthState(status: AuthStatus.initial);

  factory AuthState.loading() => const AuthState(status: AuthStatus.loading);

  factory AuthState.authenticated({
    required AuthUser user,
    required String accessToken,
  }) => AuthState(
    status: AuthStatus.authenticated,
    user: user,
    accessToken: accessToken,
  );

  factory AuthState.unauthenticated({String? errorMessage}) =>
      AuthState(status: AuthStatus.unauthenticated, errorMessage: errorMessage);

  AuthState copyWith({
    AuthStatus? status,
    AuthUser? user,
    String? accessToken,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}
