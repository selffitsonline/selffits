import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/design_system.dart';
import '../../models/coach_dashboard_data.dart';
import '../../providers/coach_dashboard_provider.dart';

/// "Students" Tab in the Coach Portal.
/// Displays student rosters strictly isolated to the authenticated coach's batches.
class CoachStudentsTab extends ConsumerWidget {
  const CoachStudentsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(coachDashboardProvider);
    final data = dashboardState.data;
    final batches = data?.batches ?? const [];
    final totalStudents = data?.totalStudentsCount ?? 0;

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
            'ENROLLED STUDENTS',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text('Student Rosters', style: AppTypography.displayMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(
            'View martial arts students enrolled in your assigned live training batches.',
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
                        'Loading enrolled students...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Quick Overview Metrics
          if (dashboardState.hasData) ...[
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadii.mdBorderRadius,
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: AppColors.shadowCard,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Total Students',
                          style: AppTypography.bodySmall.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '$totalStudents',
                          style: AppTypography.metricBold.copyWith(
                            color: AppColors.liveEmerald,
                          ),
                        ),
                        Text(
                          'Across all batches',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadii.mdBorderRadius,
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: AppColors.shadowCard,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Active Batches',
                          style: AppTypography.bodySmall.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '${batches.length}',
                          style: AppTypography.metricBold.copyWith(
                            color: AppColors.brandBlue,
                          ),
                        ),
                        Text(
                          'Assigned groups',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Empty State
          if (dashboardState.hasData && totalStudents == 0) ...[
            AppCard(
              backgroundColor: AppColors.surfaceSecondary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const StatusBadge(
                        label: 'No Students',
                        variant: StatusBadgeVariant.neutral,
                      ),
                      const Icon(
                        Icons.people_outline_rounded,
                        color: AppColors.textTertiary,
                        size: 20,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No Enrolled Students Yet',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                  Text(
                    'Students enrolled by Administration into your batches will appear here automatically with their training details.',
                    style: AppTypography.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],

          // Batch Rosters
          if (dashboardState.hasData && totalStudents > 0) ...[
            ...batches
                .where((b) => b.students.isNotEmpty)
                .map((batch) => _buildBatchRosterSection(batch)),
            const SizedBox(height: AppSpacing.xl),
          ],
        ],
      ),
    );
  }

  Widget _buildBatchRosterSection(CoachBatchSummary batch) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '${batch.programTitle} — ${batch.name}',
                  style: AppTypography.headlineMedium.copyWith(fontSize: 16),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              StatusBadge(
                label: '${batch.students.length} Students',
                variant: StatusBadgeVariant.batch,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            child: Column(
              children: [
                ...batch.students.asMap().entries.map((entry) {
                  final index = entry.key;
                  final student = entry.value;
                  final isLast = index == batch.students.length - 1;

                  return Column(
                    children: [
                      _buildStudentRow(student),
                      if (!isLast) const Divider(height: AppSpacing.lg),
                    ],
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentRow(CoachStudentSummary student) {
    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: AppColors.brandBlueLight,
          child: Text(
            student.name.isNotEmpty ? student.name[0].toUpperCase() : 'S',
            style: AppTypography.titleMedium.copyWith(
              fontSize: 14,
              color: AppColors.brandBlue,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                student.name,
                style: AppTypography.titleMedium,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                student.email,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textTertiary,
                  fontSize: 12,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        if (student.martialArtsType != null &&
            student.martialArtsType!.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.surfaceSecondary,
              borderRadius: AppRadii.smBorderRadius,
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Text(
              student.martialArtsType!,
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.brandBlue,
                fontSize: 11,
              ),
            ),
          ),
      ],
    );
  }
}
