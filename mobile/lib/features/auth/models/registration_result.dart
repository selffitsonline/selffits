/// Represents the result returned by the backend after successful student registration.
class RegistrationResult {
  final String userId;
  final String email;
  final String fullName;
  final String registeredProgram;
  final bool emailVerificationRequired;
  final String message;
  final String? emailDeliveryWarning;

  const RegistrationResult({
    required this.userId,
    required this.email,
    required this.fullName,
    required this.registeredProgram,
    required this.emailVerificationRequired,
    required this.message,
    this.emailDeliveryWarning,
  });

  factory RegistrationResult.fromJson(Map<String, dynamic> json) {
    return RegistrationResult(
      userId: json['userId'] as String? ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      registeredProgram: json['registeredProgram'] as String? ?? 'MARTIAL_ARTS',
      emailVerificationRequired:
          json['emailVerificationRequired'] as bool? ?? true,
      message:
          json['message'] as String? ??
          'Registration successful! Please check your email to verify your account.',
      emailDeliveryWarning: json['emailDeliveryWarning'] as String?,
    );
  }
}
