import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../student/utils/class_status_calculator.dart';
import '../../models/coach_dashboard_data.dart';
import '../../providers/coach_dashboard_provider.dart';

/// "Batches" Tab in the Coach Portal.
/// Displays all training batches assigned to the authenticated coach,
/// with schedule details, capacity indicators, expandable student rosters,
/// and live Google Meet room launchers.
class CoachBatchesTab extends ConsumerStatefulWidget {
  const CoachBatchesTab({super.key});

  @override
  ConsumerState<CoachBatchesTab> createState() => _CoachBatchesTabState();
}

class _CoachBatchesTabState extends ConsumerState<CoachBatchesTab> {
  final Set<String> _expandedBatchIds = {};

  void _toggleBatchRoster(String batchId) {
    setState(() {
      if (_expandedBatchIds.contains(batchId)) {
        _expandedBatchIds.remove(batchId);
      } else {
        _expandedBatchIds.add(batchId);
      }
    });
  }

  Future<void> _handleStartMeeting(String? meetingUrl) async {
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
      if (!launched && mounted) {
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
      if (mounted) {
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
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(coachDashboardProvider);
    final data = dashboardState.data;
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
            'ASSIGNED TRAINING BATCHES',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text('My Dojo Batches', style: AppTypography.displayMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(
            'Manage live batch sessions, view enrolled martial arts students, and launch Dojo Google Meet rooms.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Loading Skeleton State
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
                        'Loading your assigned batches...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Empty State
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
                        label: 'No Batches Assigned',
                        variant: StatusBadgeVariant.neutral,
                      ),
                      const Icon(
                        Icons.fitness_center_outlined,
                        color: AppColors.textTertiary,
                        size: 20,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No Active Training Batches',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                  Text(
                    'You currently have no batches assigned by the Academy. New training batches will appear here once scheduled by Administration.',
                    style: AppTypography.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],

          // Batches List
          if (dashboardState.hasData && batches.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'ACTIVE BATCHES (${batches.length})',
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
                Text(
                  '${data?.totalStudentsCount ?? 0} Total Students',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.brandBlue,
                    fontWeight: FontWeight.w600,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            ...batches.map((batch) => _buildBatchCard(batch)),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ],
      ),
    );
  }

  Widget _buildBatchCard(CoachBatchSummary batch) {
    final isExpanded = _expandedBatchIds.contains(batch.id);
    final localTime = ClassStatusCalculator.formatLocalTime(batch.clockTiming);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: AppCard(
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
                  label: batch.status,
                  variant: batch.isActive
                      ? StatusBadgeVariant.live
                      : StatusBadgeVariant.alert,
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
            if (batch.beltLevel != null) ...[
              const SizedBox(height: AppSpacing.xxs),
              Text(
                'Target Level: ${batch.beltLevel}',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.brandBlue,
                ),
              ),
            ],
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

            // Capacity & Action Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${batch.studentsCount} / ${batch.maxCapacity} Students Enrolled',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w600,
                    color: batch.isFull
                        ? AppColors.brandRed
                        : AppColors.textSecondary,
                  ),
                ),
                GestureDetector(
                  onTap: () => _toggleBatchRoster(batch.id),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isExpanded ? 'Hide Students' : 'View Students',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        isExpanded
                            ? Icons.keyboard_arrow_up_rounded
                            : Icons.keyboard_arrow_down_rounded,
                        size: 18,
                        color: AppColors.brandBlue,
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Expandable Student Roster
            if (isExpanded) ...[
              const Divider(height: AppSpacing.xl),
              Text(
                'STUDENT ROSTER (${batch.students.length})',
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              if (batch.students.isEmpty) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                  child: Text(
                    'No students currently assigned to this batch.',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ),
              ] else ...[
                ...batch.students.map((student) => _buildStudentRow(student)),
              ],
            ],

            // Meet launch button if URL exists
            if (batch.hasValidMeetingUrl) ...[
              const SizedBox(height: AppSpacing.md),
              AppButton(
                label: 'Join Batch Dojo Room',
                variant: AppButtonVariant.outline,
                size: AppButtonSize.sm,
                leadingIcon: const Icon(
                  Icons.videocam_outlined,
                  size: 16,
                  color: AppColors.brandBlue,
                ),
                onPressed: () => _handleStartMeeting(batch.meetingUrl),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStudentRow(CoachStudentSummary student) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surfaceSecondary,
        borderRadius: AppRadii.smBorderRadius,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.brandBlueLight,
            child: Text(
              student.name.isNotEmpty ? student.name[0].toUpperCase() : 'S',
              style: AppTypography.titleMedium.copyWith(
                fontSize: 13,
                color: AppColors.brandBlue,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  student.name,
                  style: AppTypography.titleMedium.copyWith(fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  student.email,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textTertiary,
                    fontSize: 11,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (student.martialArtsType != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: AppRadii.smBorderRadius,
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Text(
                student.martialArtsType!,
                style: AppTypography.bodySmall.copyWith(
                  fontSize: 10,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
