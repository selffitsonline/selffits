import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/design_system.dart';
import '../../providers/student_dashboard_provider.dart';

/// "My Progress" Tab in the Student Portal.
/// Displays attendance metrics, completed classes, and current training rank
/// by reusing authoritative data from [studentDashboardProvider].
class StudentProgressTab extends ConsumerWidget {
  const StudentProgressTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final data = dashboardState.data;
    final enrollment = data?.enrollment;
    final readiness = data?.classReadiness;

    return RefreshIndicator(
      color: AppColors.brandRed,
      backgroundColor: AppColors.surface,
      onRefresh: () => ref.read(studentDashboardProvider.notifier).refresh(),
      child: ListView(
        padding: AppSpacing.screenPadding,
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          // Section Header
          Text(
            'MY TRAINING PROGRESS',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text('Attendance & Rank', style: AppTypography.displayMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(
            'Track your live class attendance rate, completed training milestones, and belt status.',
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
                        'Loading your training progress...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // 1. Attendance & Completion Overview Card
          if (enrollment != null) ...[
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'COURSE ATTENDANCE',
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.brandBlue,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.liveEmeraldLight,
                          borderRadius: AppRadii.pillBorderRadius,
                        ),
                        child: Text(
                          '${enrollment.progressPercentage}% Completed',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.liveEmerald,
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Big Progress Percentage
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${enrollment.progressPercentage}%',
                        style: AppTypography.metricBold.copyWith(
                          fontSize: 36,
                          color: AppColors.brandBlue,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'Overall Completion',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Progress Bar
                  ClipRRect(
                    borderRadius: AppRadii.pillBorderRadius,
                    child: Container(
                      height: 10,
                      width: double.infinity,
                      color: AppColors.borderLight,
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: enrollment.progressFraction,
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                AppColors.brandBlue,
                                AppColors.liveEmerald,
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Three-Metric Grid
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            borderRadius: AppRadii.smBorderRadius,
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Completed', style: AppTypography.bodySmall),
                              const SizedBox(height: AppSpacing.xxs),
                              Text(
                                '${enrollment.completedClasses}',
                                style: AppTypography.metricBold.copyWith(
                                  fontSize: 22,
                                  color: AppColors.liveEmerald,
                                ),
                              ),
                              Text(
                                'Sessions',
                                style: AppTypography.bodySmall.copyWith(
                                  fontSize: 11,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            borderRadius: AppRadii.smBorderRadius,
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Remaining', style: AppTypography.bodySmall),
                              const SizedBox(height: AppSpacing.xxs),
                              Text(
                                '${enrollment.remainingClasses}',
                                style: AppTypography.metricBold.copyWith(
                                  fontSize: 22,
                                  color: AppColors.brandBlue,
                                ),
                              ),
                              Text(
                                'Sessions',
                                style: AppTypography.bodySmall.copyWith(
                                  fontSize: 11,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            borderRadius: AppRadii.smBorderRadius,
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Total Plan',
                                style: AppTypography.bodySmall,
                              ),
                              const SizedBox(height: AppSpacing.xxs),
                              Text(
                                '${enrollment.totalClasses}',
                                style: AppTypography.metricBold.copyWith(
                                  fontSize: 22,
                                ),
                              ),
                              Text(
                                'Classes',
                                style: AppTypography.bodySmall.copyWith(
                                  fontSize: 11,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // 2. Belt Level & Training Batch Card
          AppCard(
            backgroundColor: AppColors.surfaceSecondary,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'CURRENT BELT & TRAINING RANK',
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColors.brandRed,
                      ),
                    ),
                    const StatusBadge(
                      label: 'Verified Belt',
                      variant: StatusBadgeVariant.live,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                // Belt Level Display
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: AppRadii.mdBorderRadius,
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: const Center(
                        child: Text('🥋', style: TextStyle(fontSize: 26)),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            readiness?.levelName ??
                                enrollment?.tierName ??
                                'Student Belt Level',
                            style: AppTypography.headlineMedium,
                          ),
                          const SizedBox(height: AppSpacing.xxs),
                          Text(
                            readiness?.programTitle ??
                                enrollment?.programTitle ??
                                'Martial Arts Academy',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                // Batch Details
                if (readiness != null && readiness.hasBatch) ...[
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadii.smBorderRadius,
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Assigned Batch:',
                              style: AppTypography.bodySmall,
                            ),
                            Text(
                              readiness.batchName ??
                                  readiness.batchCode ??
                                  'Active Batch',
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: AppSpacing.md),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Training Days:',
                              style: AppTypography.bodySmall,
                            ),
                            Text(
                              readiness.dayCombination ??
                                  readiness.nextSession.dayCombination,
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        if (readiness.coachName != null) ...[
                          const Divider(height: AppSpacing.md),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Assigned Sensei:',
                                style: AppTypography.bodySmall,
                              ),
                              Text(
                                'Sensei ${readiness.coachName}',
                                style: AppTypography.bodySmall.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.brandBlue,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // 3. Belt Examination Policy Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.military_tech_outlined,
                      color: AppColors.brandBlue,
                      size: 20,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      'Belt Advancement & Examinations',
                      style: AppTypography.titleMedium.copyWith(fontSize: 15),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Examinations are scheduled periodically by academy Senseis. Students who meet attendance requirements and demonstrate technical proficiency during live class evaluations advance to their next colored belt.',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSecondary,
                    borderRadius: AppRadii.smBorderRadius,
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.info_outline,
                        size: 16,
                        color: AppColors.brandBlue,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          'Evaluations are recorded in your official graduation certificates.',
                          style: AppTypography.bodySmall.copyWith(fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }
}
