import '../../auth/models/auth_user.dart';

/// Complete domain model for the Student Dashboard response.
class StudentDashboardData {
  final AuthUser user;
  final bool isEnrolled;
  final StudentEnrollmentSummary? enrollment;
  final List<StudentEnrollmentSummary> enrollments;
  final StudentClassReadiness classReadiness;
  final int unreadNotificationsCount;

  const StudentDashboardData({
    required this.user,
    required this.isEnrolled,
    required this.enrollment,
    this.enrollments = const [],
    required this.classReadiness,
    this.unreadNotificationsCount = 0,
  });

  factory StudentDashboardData.fromJson(Map<String, dynamic> json) {
    final singleEnrollment = json['enrollment'] != null
        ? StudentEnrollmentSummary.fromJson(
            json['enrollment'] as Map<String, dynamic>,
          )
        : null;

    final rawList = json['enrollments'] as List<dynamic>?;
    final List<StudentEnrollmentSummary> list = rawList != null
        ? rawList
              .map(
                (e) => StudentEnrollmentSummary.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList()
        : (singleEnrollment != null ? [singleEnrollment] : const []);

    return StudentDashboardData(
      user: AuthUser.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
      isEnrolled: json['isEnrolled'] as bool? ?? false,
      enrollment: singleEnrollment,
      enrollments: list,
      classReadiness: StudentClassReadiness.fromJson(
        json['classReadiness'] as Map<String, dynamic>? ?? {},
      ),
      unreadNotificationsCount: json['unreadNotificationsCount'] as int? ?? 0,
    );
  }
}

/// Active enrollment details for the student.
class StudentEnrollmentSummary {
  final String id;
  final String programTitle;
  final String? tierName;
  final int remainingClasses;
  final int totalClasses;
  final String expiryDate;
  final int daysRemaining;
  final String? martialArtsType;
  final bool includeDietNutrition;
  final String status;
  final bool isReady;
  final String? meetingUrl;

  const StudentEnrollmentSummary({
    required this.id,
    required this.programTitle,
    this.tierName,
    required this.remainingClasses,
    required this.totalClasses,
    required this.expiryDate,
    required this.daysRemaining,
    this.martialArtsType,
    this.includeDietNutrition = false,
    required this.status,
    this.isReady = false,
    this.meetingUrl,
  });

  int get completedClasses =>
      (totalClasses - remainingClasses).clamp(0, totalClasses);
  double get progressFraction => totalClasses > 0
      ? (completedClasses / totalClasses).clamp(0.0, 1.0)
      : 0.0;
  int get progressPercentage => (progressFraction * 100).round();

  factory StudentEnrollmentSummary.fromJson(Map<String, dynamic> json) {
    return StudentEnrollmentSummary(
      id: json['id'] as String? ?? '',
      programTitle: json['programTitle'] as String? ?? 'Martial Arts Academy',
      tierName: json['tierName'] as String?,
      remainingClasses: json['remainingClasses'] as int? ?? 0,
      totalClasses: json['totalClasses'] as int? ?? 0,
      expiryDate: json['expiryDate'] as String? ?? '',
      daysRemaining: json['daysRemaining'] as int? ?? 0,
      martialArtsType: json['martialArtsType'] as String?,
      includeDietNutrition: json['includeDietNutrition'] as bool? ?? false,
      status: json['status'] as String? ?? 'ACTIVE',
      isReady: json['isReady'] as bool? ?? false,
      meetingUrl: json['meetingUrl'] as String?,
    );
  }
}

/// Centralized class readiness and Google Meet launcher data.
class StudentClassReadiness {
  final bool hasBatch;
  final bool isReady;
  final String? batchId;
  final String? batchCode;
  final String? batchName;
  final String? programTitle;
  final String? levelName;
  final String? coachName;
  final String? coachRank;
  final String? dayCombination;
  final String? timeSlot;
  final String? clockTiming;
  final String? meetingUrl;
  final String? capacityLabel;
  final String? batchStatus;
  final StudentScheduleSession nextSession;

  const StudentClassReadiness({
    required this.hasBatch,
    required this.isReady,
    this.batchId,
    this.batchCode,
    this.batchName,
    this.programTitle,
    this.levelName,
    this.coachName,
    this.coachRank,
    this.dayCombination,
    this.timeSlot,
    this.clockTiming,
    this.meetingUrl,
    this.capacityLabel,
    this.batchStatus,
    required this.nextSession,
  });

  bool get hasValidMeetingUrl {
    if (meetingUrl == null) return false;
    final trimmed = meetingUrl!.trim().toLowerCase();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://');
  }

  factory StudentClassReadiness.fromJson(Map<String, dynamic> json) {
    return StudentClassReadiness(
      hasBatch: json['hasBatch'] as bool? ?? false,
      isReady: json['isReady'] as bool? ?? false,
      batchId: json['batchId'] as String?,
      batchCode: json['batchCode'] as String?,
      batchName: json['batchName'] as String?,
      programTitle: json['programTitle'] as String?,
      levelName: json['levelName'] as String?,
      coachName: json['coachName'] as String?,
      coachRank: json['coachRank'] as String?,
      dayCombination: json['dayCombination'] as String?,
      timeSlot: json['timeSlot'] as String?,
      clockTiming: json['clockTiming'] as String?,
      meetingUrl: json['meetingUrl'] as String?,
      capacityLabel: json['capacityLabel'] as String?,
      batchStatus: json['batchStatus'] as String?,
      nextSession: StudentScheduleSession.fromJson(
        json['nextSession'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}

/// Next scheduled class session details.
class StudentScheduleSession {
  final String nextClassDay;
  final String nextClassDate;
  final String nextClassFullDate;
  final String relativeLabel;
  final bool isToday;
  final String clockTiming;
  final String timeSlot;
  final String dayCombination;

  const StudentScheduleSession({
    required this.nextClassDay,
    required this.nextClassDate,
    required this.nextClassFullDate,
    required this.relativeLabel,
    required this.isToday,
    required this.clockTiming,
    required this.timeSlot,
    required this.dayCombination,
  });

  factory StudentScheduleSession.fromJson(Map<String, dynamic> json) {
    return StudentScheduleSession(
      nextClassDay: json['nextClassDay'] as String? ?? 'Upcoming',
      nextClassDate: json['nextClassDate'] as String? ?? '',
      nextClassFullDate:
          json['nextClassFullDate'] as String? ?? 'Upcoming Class',
      relativeLabel: json['relativeLabel'] as String? ?? 'Upcoming',
      isToday: json['isToday'] as bool? ?? false,
      clockTiming:
          json['clockTiming'] as String? ?? '05:00 PM to 06:00 PM (GMT)',
      timeSlot: json['timeSlot'] as String? ?? 'Evening',
      dayCombination: json['dayCombination'] as String? ?? 'Weekly Schedule',
    );
  }
}
