import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../student/utils/class_status_calculator.dart';
import '../../models/coach_dashboard_data.dart';
import '../../providers/coach_dashboard_provider.dart';

/// "Schedule" Tab in the Coach Portal.
/// Displays upcoming sessions and teaching schedule across all assigned batches.
class CoachScheduleTab extends ConsumerWidget {
  const CoachScheduleTab({super.key});

  Future<void> _handleStartMeeting(
    BuildContext context,
    String? meetingUrl,
  ) async {
    if (meetingUrl == null || meetingUrl.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'No Google Meet link configured for this batch. Please contact Academy Admin.',
          ),
          backgroundColor: AppColors.textPrimary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: AppRadii.smBorderRadius),
        ),
      );
      return;
    }

    final trimmed = meetingUrl.trim();
    final uri = Uri.tryParse(trimmed);

    if (uri == null ||
        (!trimmed.startsWith('https://') && !trimmed.startsWith('http://'))) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'Invalid Google Meet URL provided for this batch.',
          ),
          backgroundColor: AppColors.errorRose,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: AppRadii.smBorderRadius),
        ),
      );
      return;
    }

    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Could not launch Google Meet. Please check your browser or app.',
            ),
            backgroundColor: AppColors.errorRose,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: AppRadii.smBorderRadius,
            ),
          ),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to open meeting URL.'),
            backgroundColor: AppColors.errorRose,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: AppRadii.smBorderRadius,
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(coachDashboardProvider);
    final data = dashboardState.data;
    final upcoming = data?.upcomingClass;
    final batches = data?.batches ?? const [];

    return RefreshIndicator(
      color: AppColors.brandRed,
      backgroundColor: AppColors.surface,
      onRefresh: () => ref.read(coachDashboardProvider.notifier).refresh(),
      child: ListView(
        padding: AppSpacing.screenPadding,
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          // Section Header
          Text(
            'UPCOMING DOJO SCHEDULE',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text('Teaching Schedule', style: AppTypography.displayMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(
            'View upcoming live karate and martial arts classes scheduled across all your active batches.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Loading Skeleton
          if (dashboardState.isLoading && !dashboardState.hasData) ...[
            AppCard(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl),
                  child: Column(
                    children: [
                      const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.6,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.brandRed,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        'Loading your teaching schedule...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Next Class Highlight Hero
          if (upcoming != null) ...[
            _buildUpcomingHero(context, upcoming),
            const SizedBox(height: AppSpacing.xxl),
          ],

          // Empty Schedule State
          if (dashboardState.hasData && batches.isEmpty) ...[
            AppCard(
              backgroundColor: AppColors.surfaceSecondary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const StatusBadge(
                        label: 'No Sessions',
                        variant: StatusBadgeVariant.neutral,
                      ),
                      const Icon(
                        Icons.calendar_today_outlined,
                        color: AppColors.textTertiary,
                        size: 20,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No Upcoming Sessions Scheduled',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                  Text(
                    'There are currently no training batches or upcoming live classes assigned to your profile. Check back once Administration schedules new sessions.',
                    style: AppTypography.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],

          // Batch Sessions List
          if (dashboardState.hasData && batches.isNotEmpty) ...[
            Text(
              'SCHEDULED SESSIONS BY BATCH',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.brandBlue,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            ...batches.map((batch) => _buildScheduleCard(context, batch)),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Sensei Protocols Card
          _buildSenseiGuidelines(),
          const SizedBox(height: AppSpacing.xxxl),
        ],
      ),
    );
  }

  Widget _buildUpcomingHero(BuildContext context, CoachBatchSummary batch) {
    final localTime = ClassStatusCalculator.formatLocalTime(batch.clockTiming);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'NEXT SESSION TO CONDUCT',
          style: AppTypography.labelSmall.copyWith(color: AppColors.brandRed),
        ),
        const SizedBox(height: AppSpacing.xs),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.xs,
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  StatusBadge(
                    label: batch.nextSession.isToday
                        ? 'Today Session'
                        : batch.nextSession.relativeLabel,
                    variant: batch.nextSession.isToday
                        ? StatusBadgeVariant.live
                        : StatusBadgeVariant.batch,
                    showLivePulse: batch.nextSession.isToday,
                  ),
                  StatusBadge(
                    label: batch.batchId,
                    variant: StatusBadgeVariant.neutral,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                '${batch.programTitle} — ${batch.name}',
                style: AppTypography.headlineLarge,
              ),
              if (batch.beltLevel != null) ...[
                const SizedBox(height: AppSpacing.xxs),
                Text(
                  'Target Level: ${batch.beltLevel}',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.brandBlue,
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.sm),

              // Timing Row
              Row(
                children: [
                  const Icon(
                    Icons.calendar_month_outlined,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Text(
                      '${batch.nextSession.nextClassFullDate} • ${batch.clockTiming}',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (localTime != null) ...[
                const SizedBox(height: AppSpacing.xxs),
                Row(
                  children: [
                    const Icon(
                      Icons.public_outlined,
                      size: 15,
                      color: AppColors.brandBlue,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Text(
                        localTime,
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: AppSpacing.md),

              // Student count badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSecondary,
                  borderRadius: AppRadii.smBorderRadius,
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.groups_outlined,
                      size: 18,
                      color: AppColors.brandBlue,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Text(
                        '${batch.studentsCount} of ${batch.maxCapacity} Students Enrolled',
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Launch CTA
              AppButton(
                label: batch.hasValidMeetingUrl
                    ? 'START LIVE DOJO (GOOGLE MEET)'
                    : 'AWAITING MEETING LINK',
                variant: batch.hasValidMeetingUrl
                    ? AppButtonVariant.primaryRed
                    : AppButtonVariant.outline,
                leadingIcon: Icon(
                  Icons.videocam_rounded,
                  size: 20,
                  color: batch.hasValidMeetingUrl
                      ? AppColors.textOnPrimary
                      : AppColors.textTertiary,
                ),
                trailingIcon: Icon(
                  Icons.open_in_new_rounded,
                  size: 16,
                  color: batch.hasValidMeetingUrl
                      ? AppColors.textOnPrimary
                      : AppColors.textTertiary,
                ),
                onPressed: batch.hasValidMeetingUrl
                    ? () => _handleStartMeeting(context, batch.meetingUrl)
                    : null,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildScheduleCard(BuildContext context, CoachBatchSummary batch) {
    final localTime = ClassStatusCalculator.formatLocalTime(batch.clockTiming);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                StatusBadge(
                  label: batch.nextSession.relativeLabel,
                  variant: batch.nextSession.isToday
                      ? StatusBadgeVariant.live
                      : StatusBadgeVariant.batch,
                  showLivePulse: batch.nextSession.isToday,
                ),
                StatusBadge(
                  label: batch.batchId,
                  variant: StatusBadgeVariant.neutral,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              '${batch.programTitle} — ${batch.name}',
              style: AppTypography.headlineMedium,
            ),
            const SizedBox(height: AppSpacing.xxs),
            Text(
              '${batch.dayCombination} • ${batch.clockTiming}',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            if (localTime != null) ...[
              const SizedBox(height: AppSpacing.xxs),
              Text(
                localTime,
                style: AppTypography.bodySmall.copyWith(
                  fontSize: 11,
                  color: AppColors.brandBlue,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.people_outline_rounded,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${batch.studentsCount} Students',
                      style: AppTypography.bodySmall.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                if (batch.hasValidMeetingUrl)
                  InkWell(
                    onTap: () => _handleStartMeeting(context, batch.meetingUrl),
                    borderRadius: AppRadii.smBorderRadius,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.videocam_outlined,
                            size: 16,
                            color: AppColors.brandBlue,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Launch Meet',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.brandBlue,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Text(
                    'Link Pending',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textTertiary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSenseiGuidelines() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SENSEI DOJO PROTOCOL',
          style: AppTypography.labelSmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        AppCard(
          child: Column(
            children: [
              _buildGuidelineItem(
                Icons.timer_outlined,
                'Start Room 5 Minutes Early',
                'Activate Google Meet link early so students can enter the waiting room.',
              ),
              const Divider(height: AppSpacing.xl),
              _buildGuidelineItem(
                Icons.camera_alt_outlined,
                'Clear Camera Framing',
                'Ensure mat and full body movements are visible under proper illumination.',
              ),
              const Divider(height: AppSpacing.xl),
              _buildGuidelineItem(
                Icons.checklist_rounded,
                'Verify Attendance',
                'Confirm all participating students match your assigned batch roster.',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGuidelineItem(IconData icon, String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppColors.brandBlue),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.titleMedium.copyWith(fontSize: 14),
              ),
              const SizedBox(height: AppSpacing.xxs),
              Text(subtitle, style: AppTypography.bodySmall),
            ],
          ),
        ),
      ],
    );
  }
}
