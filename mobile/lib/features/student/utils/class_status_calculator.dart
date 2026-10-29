import '../../../core/design_system/design_system.dart';
import '../models/student_dashboard_data.dart';

enum ClassLiveStatus {
  unassigned,
  cancelled,
  live,
  startingSoon,
  upcoming,
  completedToday,
}

class ClassStatusResult {
  final ClassLiveStatus status;
  final String badgeLabel;
  final StatusBadgeVariant badgeVariant;
  final bool showLivePulse;
  final String countdownText;
  final bool isJoinButtonActive;
  final String? buttonHint;

  const ClassStatusResult({
    required this.status,
    required this.badgeLabel,
    required this.badgeVariant,
    required this.showLivePulse,
    required this.countdownText,
    required this.isJoinButtonActive,
    this.buttonHint,
  });
}

/// Computes class status, live states, and time-accurate countdowns
/// based on verified backend schedule data.
class ClassStatusCalculator {
  /// Evaluates readiness and schedule against a reference time.
  static ClassStatusResult evaluate(
    StudentClassReadiness readiness, {
    DateTime? referenceTime,
  }) {
    final now = (referenceTime ?? DateTime.now()).toUtc();

    // 1. Unassigned Batch State
    if (!readiness.hasBatch) {
      return const ClassStatusResult(
        status: ClassLiveStatus.unassigned,
        badgeLabel: 'Batch Pending',
        badgeVariant: StatusBadgeVariant.neutral,
        showLivePulse: false,
        countdownText:
            'Academy Senseis are organizing your live training batch.',
        isJoinButtonActive: false,
        buttonHint: 'Awaiting Batch Assignment',
      );
    }

    // 2. Cancelled or Inactive Batch State
    final batchStatus = readiness.batchStatus?.toUpperCase();
    if (batchStatus == 'CANCELLED' || batchStatus == 'INACTIVE') {
      return const ClassStatusResult(
        status: ClassLiveStatus.cancelled,
        badgeLabel: 'Batch Inactive',
        badgeVariant: StatusBadgeVariant.alert,
        showLivePulse: false,
        countdownText: 'This training batch is currently paused or inactive.',
        isJoinButtonActive: false,
        buttonHint: 'Batch Inactive',
      );
    }

    final session = readiness.nextSession;
    // Rule: Button remains disabled unless backend confirms session is ready AND provides valid URL
    final canJoin = readiness.isReady && readiness.hasValidMeetingUrl;

    // 3. Class Scheduled for Today
    if (session.isToday) {
      final parsed = _parseTimingTodayUtc(session.clockTiming, now);
      if (parsed != null) {
        final startTime = parsed.startUtc;
        final endTime = parsed.endUtc;

        // Current time is within class hours
        if (now.isAfter(startTime) && now.isBefore(endTime)) {
          return ClassStatusResult(
            status: ClassLiveStatus.live,
            badgeLabel: 'Live Now',
            badgeVariant: StatusBadgeVariant.live,
            showLivePulse: true,
            countdownText:
                'Class in progress • Session ends at ${_formatUtcToLocal(endTime)}',
            isJoinButtonActive: canJoin,
            buttonHint: canJoin
                ? null
                : (readiness.hasValidMeetingUrl
                      ? 'Awaiting Sensei Activation'
                      : 'Sensei is preparing link'),
          );
        }

        // Current time is before class start
        if (now.isBefore(startTime)) {
          final diff = startTime.difference(now);
          if (diff.inMinutes <= 30) {
            final mins = diff.inMinutes.clamp(1, 30);
            return ClassStatusResult(
              status: ClassLiveStatus.startingSoon,
              badgeLabel: 'Live in $mins mins',
              badgeVariant: StatusBadgeVariant.live,
              showLivePulse: true,
              countdownText: 'Starts in $mins minute${mins > 1 ? 's' : ''}',
              isJoinButtonActive: canJoin,
              buttonHint: canJoin
                  ? null
                  : (readiness.hasValidMeetingUrl
                        ? 'Awaiting Sensei Activation'
                        : 'Sensei is activating link'),
            );
          } else {
            final hours = diff.inHours;
            final remainingMins = diff.inMinutes % 60;
            final timeStr = hours > 0
                ? '$hours hr ${remainingMins > 0 ? '$remainingMins min' : ''}'
                : '$remainingMins min';

            return ClassStatusResult(
              status: ClassLiveStatus.upcoming,
              badgeLabel: 'Today • ${_formatTimeSlot(session.clockTiming)}',
              badgeVariant: StatusBadgeVariant.batch,
              showLivePulse: false,
              countdownText: 'Starts today in $timeStr',
              isJoinButtonActive: canJoin,
              buttonHint: canJoin ? null : 'Awaiting Sensei Activation',
            );
          }
        }

        // Current time is after class end time
        if (now.isAfter(endTime)) {
          return const ClassStatusResult(
            status: ClassLiveStatus.completedToday,
            badgeLabel: 'Completed Today',
            badgeVariant: StatusBadgeVariant.neutral,
            showLivePulse: false,
            countdownText:
                "Today's live class has concluded. See you next session!",
            isJoinButtonActive: false,
            buttonHint: 'Session Concluded',
          );
        }
      }
    }

    // 4. Future Upcoming Scheduled Session
    return ClassStatusResult(
      status: ClassLiveStatus.upcoming,
      badgeLabel: '${session.relativeLabel} • ${session.nextClassDay}',
      badgeVariant: StatusBadgeVariant.batch,
      showLivePulse: false,
      countdownText: 'Scheduled for ${session.nextClassFullDate}',
      isJoinButtonActive: canJoin,
      buttonHint: canJoin ? null : 'Awaiting Sensei Activation',
    );
  }

  /// Parses timing string like "05:15 PM to 06:00 PM (GMT)" into UTC DateTimes for today.
  static ({DateTime startUtc, DateTime endUtc})? _parseTimingTodayUtc(
    String timingStr,
    DateTime referenceUtc,
  ) {
    try {
      // Regex matching e.g. "05:15 PM to 06:00 PM"
      final regExp = RegExp(
        r'(\d{1,2}):(\d{2})\s*(AM|PM)\s*to\s*(\d{1,2}):(\d{2})\s*(AM|PM)',
        caseSensitive: false,
      );
      final match = regExp.firstMatch(timingStr);
      if (match == null) return null;

      final startHour = _to24Hour(int.parse(match.group(1)!), match.group(3)!);
      final startMin = int.parse(match.group(2)!);

      final endHour = _to24Hour(int.parse(match.group(4)!), match.group(6)!);
      final endMin = int.parse(match.group(5)!);

      final startUtc = DateTime.utc(
        referenceUtc.year,
        referenceUtc.month,
        referenceUtc.day,
        startHour,
        startMin,
      );

      final endUtc = DateTime.utc(
        referenceUtc.year,
        referenceUtc.month,
        referenceUtc.day,
        endHour,
        endMin,
      );

      return (startUtc: startUtc, endUtc: endUtc);
    } catch (_) {
      return null;
    }
  }

  static int _to24Hour(int hour, String period) {
    final isPm = period.toUpperCase() == 'PM';
    if (isPm && hour < 12) return hour + 12;
    if (!isPm && hour == 12) return 0;
    return hour;
  }

  static String _formatTimeSlot(String timingStr) {
    if (timingStr.contains(' to ')) {
      return timingStr.split(' to ')[0].trim();
    }
    return timingStr;
  }

  static String _formatUtcToLocal(DateTime utcDate) {
    final local = utcDate.toLocal();
    final hour = local.hour % 12 == 0 ? 12 : local.hour % 12;
    final period = local.hour >= 12 ? 'PM' : 'AM';
    final minute = local.minute.toString().padLeft(2, '0');
    return '$hour:$minute $period';
  }

  /// Converts GMT timing string like "05:15 PM to 06:00 PM (GMT)" into user's local device timezone.
  static String? formatLocalTime(String timingStr, {DateTime? referenceDate}) {
    final ref = (referenceDate ?? DateTime.now()).toUtc();
    final parsed = _parseTimingTodayUtc(timingStr, ref);
    if (parsed == null) return null;
    return '${_formatUtcToLocal(parsed.startUtc)} to ${_formatUtcToLocal(parsed.endUtc)} (Your Local Time)';
  }
}
