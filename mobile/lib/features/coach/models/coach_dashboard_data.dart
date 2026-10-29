import '../../student/models/student_dashboard_data.dart';

/// Complete domain model for the Coach Dashboard response.
class CoachDashboardData {
  final CoachProfileData coach;
  final int totalBatchesCount;
  final int totalStudentsCount;
  final CoachBatchSummary? upcomingClass;
  final List<CoachBatchSummary> batches;

  const CoachDashboardData({
    required this.coach,
    required this.totalBatchesCount,
    required this.totalStudentsCount,
    this.upcomingClass,
    this.batches = const [],
  });

  bool get hasBatches => batches.isNotEmpty;
  bool get hasUpcomingClass => upcomingClass != null;

  factory CoachDashboardData.fromJson(Map<String, dynamic> json) {
    return CoachDashboardData(
      coach: CoachProfileData.fromJson(
        json['coach'] as Map<String, dynamic>? ?? {},
      ),
      totalBatchesCount: json['totalBatchesCount'] as int? ?? 0,
      totalStudentsCount: json['totalStudentsCount'] as int? ?? 0,
      upcomingClass: json['upcomingClass'] != null
          ? CoachBatchSummary.fromJson(
              json['upcomingClass'] as Map<String, dynamic>,
            )
          : null,
      batches:
          (json['batches'] as List<dynamic>?)
              ?.map(
                (item) =>
                    CoachBatchSummary.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );
  }
}

/// Coach profile information.
class CoachProfileData {
  final String id;
  final String fullName;
  final String email;
  final String highestRank;
  final List<String> disciplines;
  final String? profilePhotoUrl;

  const CoachProfileData({
    required this.id,
    required this.fullName,
    required this.email,
    required this.highestRank,
    this.disciplines = const [],
    this.profilePhotoUrl,
  });

  String get displayName => fullName.isNotEmpty ? fullName : 'Sensei';

  factory CoachProfileData.fromJson(Map<String, dynamic> json) {
    final rawDisciplines = json['disciplines'];
    List<String> parsedDisciplines = [];
    if (rawDisciplines is List) {
      parsedDisciplines = rawDisciplines.map((e) => e.toString()).toList();
    } else if (rawDisciplines is String && rawDisciplines.isNotEmpty) {
      parsedDisciplines = [rawDisciplines];
    }

    return CoachProfileData(
      id: json['id'] as String? ?? '',
      fullName:
          json['fullName'] as String? ??
          json['name'] as String? ??
          json['displayName'] as String? ??
          'Sensei',
      email: json['email'] as String? ?? '',
      highestRank: json['highestRank'] as String? ?? 'Certified Instructor',
      disciplines: parsedDisciplines,
      profilePhotoUrl: json['profilePhotoUrl'] as String?,
    );
  }
}

/// Summary of a training batch assigned to the coach.
class CoachBatchSummary {
  final String id;
  final String batchId;
  final String name;
  final String programTitle;
  final String? beltLevel;
  final String dayCombination;
  final String timeSlot;
  final String clockTiming;
  final String? meetingUrl;
  final bool isMeetingActive;
  final String status;
  final int maxCapacity;
  final int studentsCount;
  final List<CoachStudentSummary> students;
  final StudentScheduleSession nextSession;

  const CoachBatchSummary({
    required this.id,
    required this.batchId,
    required this.name,
    required this.programTitle,
    this.beltLevel,
    required this.dayCombination,
    required this.timeSlot,
    required this.clockTiming,
    this.meetingUrl,
    required this.isMeetingActive,
    required this.status,
    required this.maxCapacity,
    required this.studentsCount,
    this.students = const [],
    required this.nextSession,
  });

  bool get hasValidMeetingUrl {
    if (meetingUrl == null) return false;
    final trimmed = meetingUrl!.trim().toLowerCase();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://');
  }

  bool get isFull => studentsCount >= maxCapacity;
  bool get isActive => status.toUpperCase() == 'ACTIVE';

  factory CoachBatchSummary.fromJson(Map<String, dynamic> json) {
    return CoachBatchSummary(
      id: json['id'] as String? ?? '',
      batchId: json['batchId'] as String? ?? '',
      name: json['name'] as String? ?? 'Training Batch',
      programTitle: json['programTitle'] as String? ?? 'Martial Arts Program',
      beltLevel: json['beltLevel'] as String?,
      dayCombination: json['dayCombination'] as String? ?? 'Weekly Schedule',
      timeSlot: json['timeSlot'] as String? ?? 'Regular',
      clockTiming: json['clockTiming'] as String? ?? '',
      meetingUrl: json['meetingUrl'] as String?,
      isMeetingActive: json['isMeetingActive'] as bool? ?? false,
      status: json['status'] as String? ?? 'ACTIVE',
      maxCapacity: json['maxCapacity'] as int? ?? 20,
      studentsCount: json['studentsCount'] as int? ?? 0,
      students:
          (json['students'] as List<dynamic>?)
              ?.map(
                (item) =>
                    CoachStudentSummary.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          const [],
      nextSession: StudentScheduleSession.fromJson(
        json['nextSession'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}

/// Student assigned to a coach's batch.
class CoachStudentSummary {
  final String id;
  final String name;
  final String email;
  final String? image;
  final String assignedAt;
  final String? martialArtsType;

  const CoachStudentSummary({
    required this.id,
    required this.name,
    required this.email,
    this.image,
    required this.assignedAt,
    this.martialArtsType,
  });

  factory CoachStudentSummary.fromJson(Map<String, dynamic> json) {
    return CoachStudentSummary(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Student',
      email: json['email'] as String? ?? '',
      image: json['image'] as String?,
      assignedAt: json['assignedAt'] as String? ?? '',
      martialArtsType: json['martialArtsType'] as String?,
    );
  }
}
