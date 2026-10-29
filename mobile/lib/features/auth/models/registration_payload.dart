/// Encapsulates the registration questionnaire and credential payload for SELFFITS.
/// Supports both Martial Arts and Weight Management & Fitness pathways.
class RegistrationPayload {
  final String
  registeredProgram; // "MARTIAL_ARTS" | "WEIGHT_MANAGEMENT_FITNESS"
  final String fullName;
  final String email;
  final String phone;
  final String country;
  final String password;
  final String confirmPassword;

  // Martial Arts specific fields
  final String? studentType; // "Child (under 18)" | "Adult (18+)"
  final String? martialArtsLevel; // "Beginner — I'm just starting" | etc.
  final String? trainingGoal;
  final double? currentWeightKg;

  // Weight Management & Fitness specific fields
  final String? ageGroup; // "Child (under 18)" | "Adult (18+)"
  final double? targetWeightKg;
  final String? fitnessGoal;
  final String? fitnessLevel; // "Beginner" | "Intermediate" | "Advanced"
  final String? workoutFrequency;

  const RegistrationPayload({
    required this.registeredProgram,
    required this.fullName,
    required this.email,
    required this.phone,
    this.country = 'India',
    required this.password,
    required this.confirmPassword,
    this.studentType,
    this.martialArtsLevel,
    this.trainingGoal,
    this.currentWeightKg,
    this.ageGroup,
    this.targetWeightKg,
    this.fitnessGoal,
    this.fitnessLevel,
    this.workoutFrequency,
  });

  bool get isMartialArts => registeredProgram == 'MARTIAL_ARTS';
  bool get isFitness => registeredProgram == 'WEIGHT_MANAGEMENT_FITNESS';

  Map<String, dynamic> toJson() {
    final cleanEmail = email.trim().toLowerCase();
    final cleanName = fullName.trim();
    final cleanPhone = phone.trim();

    if (isFitness) {
      return {
        'registeredProgram': 'WEIGHT_MANAGEMENT_FITNESS',
        'fullName': cleanName,
        'email': cleanEmail,
        'phone': cleanPhone,
        'country': country,
        'ageGroup': ageGroup ?? 'Adult (18+)',
        'currentWeightKg': currentWeightKg,
        if (targetWeightKg != null) 'targetWeightKg': targetWeightKg,
        'fitnessGoal': fitnessGoal ?? 'Weight management',
        'fitnessLevel': fitnessLevel ?? 'Beginner',
        'workoutFrequency': workoutFrequency ?? '3 days per week',
        'password': password,
        'confirmPassword': confirmPassword,
      };
    }

    // Default to MARTIAL_ARTS
    return {
      'registeredProgram': 'MARTIAL_ARTS',
      'fullName': cleanName,
      'email': cleanEmail,
      'phone': cleanPhone,
      'country': country,
      'studentType': studentType ?? 'Adult (18+)',
      'martialArtsLevel': martialArtsLevel ?? "Beginner — I'm just starting",
      'trainingGoal': trainingGoal ?? 'Self-defence',
      if (currentWeightKg != null) 'currentWeightKg': currentWeightKg,
      'password': password,
      'confirmPassword': confirmPassword,
    };
  }
}
