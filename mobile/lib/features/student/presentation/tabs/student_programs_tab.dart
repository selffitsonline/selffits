import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../../core/utils/app_url_launcher.dart';
import '../../../public/presentation/public_home_screen.dart';
import '../../models/student_dashboard_data.dart';
import '../../providers/student_dashboard_provider.dart';

/// "My Programs" Tab in the Student Portal.
/// Displays active and enrolled programs, membership details, class limits,
/// schedule info, and live class session access with automatic status refresh.
class StudentProgramsTab extends ConsumerStatefulWidget {
  const StudentProgramsTab({super.key});

  @override
  ConsumerState<StudentProgramsTab> createState() => _StudentProgramsTabState();
}

class _StudentProgramsTabState extends ConsumerState<StudentProgramsTab>
    with WidgetsBindingObserver {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Periodically refresh session status (e.g. coach activating class link)
    _refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (mounted) {
        ref.read(studentDashboardProvider.notifier).refresh();
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!ref.read(studentDashboardProvider).hasData) {
        ref.read(studentDashboardProvider.notifier).loadDashboard();
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted) {
      ref.read(studentDashboardProvider.notifier).refresh();
    }
  }

  Future<void> _openCatalogOnWeb(BuildContext context) async {
    await AppUrlLauncher.launch(
      context,
      'https://selffits.com/programs',
      fallbackMessage:
          'Could not open browser. Please visit selffits.com/programs.',
    );
  }

  Future<void> _handleJoinLiveMeeting(
    BuildContext context,
    String? meetingUrl,
  ) async {
    if (meetingUrl == null || meetingUrl.trim().isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Live classroom link is being set up by your Sensei.',
            ),
            backgroundColor: AppColors.textPrimary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: AppRadii.smBorderRadius,
            ),
          ),
        );
      }
      return;
    }

    final trimmed = meetingUrl.trim();
    final uri = Uri.tryParse(trimmed);

    if (uri == null ||
        (!trimmed.startsWith('https://') && !trimmed.startsWith('http://'))) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Invalid live class URL provided for this batch.',
            ),
            backgroundColor: AppColors.errorRose,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: AppRadii.smBorderRadius,
            ),
          ),
        );
      }
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
            content: const Text('Could not open the virtual classroom link.'),
            backgroundColor: AppColors.errorRose,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: AppRadii.smBorderRadius,
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error launching class: $e'),
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
    final dashboardState = ref.watch(studentDashboardProvider);
    final data = dashboardState.data;
    final enrollmentsList = (data?.enrollments.isNotEmpty == true)
        ? data!.enrollments
        : (data?.enrollment != null
              ? [data!.enrollment!]
              : <StudentEnrollmentSummary>[]);
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
            'MY PROGRAMS & MEMBERSHIPS',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text('Training Enrollments', style: AppTypography.displayMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(
            'Track your enrolled martial arts programs, membership validity, and training schedules.',
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
                        'Loading your program enrollments...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Active Enrollment Cards
          if (enrollmentsList.isNotEmpty) ...[
            for (final e in enrollmentsList) ...[
              _buildProgramEnrollmentCard(context, e, readiness),
              const SizedBox(height: AppSpacing.lg),
            ],
          ] else if (dashboardState.hasData &&
              !dashboardState.data!.isEnrolled) ...[
            AppCard(
              backgroundColor: AppColors.surfaceSecondary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const StatusBadge(
                    label: 'No Active Program',
                    variant: StatusBadgeVariant.neutral,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'No Active Martial Arts Program',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                  Text(
                    'You are registered as a SELFFITS student. To begin training in live dojo classes, enroll in a martial arts or fitness program.',
                    style: AppTypography.bodyMedium,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: 'BROWSE ACADEMY PROGRAMS',
                    variant: AppButtonVariant.primaryRed,
                    leadingIcon: const Icon(Icons.explore_outlined, size: 18),
                    onPressed: () => _openCatalogOnWeb(context),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Explore Additional Programs Card
          AppCard(
            backgroundColor: AppColors.surfaceSecondary,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.add_circle_outline_rounded,
                      color: AppColors.brandBlue,
                      size: 20,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      'Enroll in an Additional Discipline',
                      style: AppTypography.titleMedium.copyWith(fontSize: 15),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Select another course like Karate, Boxing, Muay Thai, or Yoga and customize your training schedule directly.',
                  style: AppTypography.bodySmall,
                ),
                const SizedBox(height: AppSpacing.md),
                AppButton(
                  label: 'OPEN SCHEDULE BUILDER',
                  variant: AppButtonVariant.primaryRed,
                  size: AppButtonSize.sm,
                  fullWidth: false,
                  leadingIcon: const Icon(
                    Icons.fitness_center_rounded,
                    size: 16,
                  ),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const PublicHomeScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildProgramEnrollmentCard(
    BuildContext context,
    StudentEnrollmentSummary enrollment,
    StudentClassReadiness? readiness,
  ) {
    final bool isExpired =
        enrollment.status == 'EXPIRED' ||
        enrollment.daysRemaining <= 0 ||
        enrollment.remainingClasses <= 0;
    final String? effectiveMeetingUrl =
        (enrollment.meetingUrl != null &&
            enrollment.meetingUrl!.trim().isNotEmpty)
        ? enrollment.meetingUrl
        : (readiness != null && readiness.hasValidMeetingUrl
              ? readiness.meetingUrl
              : null);
    final bool isClassReady =
        enrollment.isReady ||
        (readiness != null &&
            readiness.isReady &&
            enrollment.status == 'ACTIVE');
    final bool hasValidUrl =
        effectiveMeetingUrl != null &&
        (effectiveMeetingUrl.startsWith('http://') ||
            effectiveMeetingUrl.startsWith('https://'));
    final bool canJoin = !isExpired && isClassReady && hasValidUrl;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    StatusBadge(
                      label: enrollment.status,
                      variant: StatusBadgeVariant.live,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      enrollment.programTitle,
                      style: AppTypography.headlineLarge,
                    ),
                    if (enrollment.tierName != null) ...[
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        enrollment.tierName!,
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.brandBlueLight,
                  borderRadius: AppRadii.smBorderRadius,
                ),
                child: const Icon(
                  Icons.sports_martial_arts_rounded,
                  color: AppColors.brandBlue,
                  size: 24,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Discipline & Nutrition Badges
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.xs,
            children: [
              if (enrollment.martialArtsType != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSecondary,
                    borderRadius: AppRadii.smBorderRadius,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Text(
                    'Discipline: ${enrollment.martialArtsType}',
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              if (enrollment.includeDietNutrition)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.liveEmeraldLight,
                    borderRadius: AppRadii.smBorderRadius,
                    border: Border.all(
                      color: AppColors.liveEmerald.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.restaurant_menu_rounded,
                        size: 12,
                        color: AppColors.liveEmerald,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Diet & Nutrition Plan Included',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.liveEmerald,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Metrics Row: Remaining Classes & Expiry
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
                      Text('Classes Remaining', style: AppTypography.bodySmall),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        '${enrollment.remainingClasses} / ${enrollment.totalClasses}',
                        style: AppTypography.metricBold.copyWith(fontSize: 20),
                      ),
                      Text(
                        '${enrollment.completedClasses} completed (${enrollment.progressPercentage}%)',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w600,
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
                    color: AppColors.surfaceSecondary,
                    borderRadius: AppRadii.smBorderRadius,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Validity', style: AppTypography.bodySmall),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        '${enrollment.daysRemaining} Days',
                        style: AppTypography.metricBold.copyWith(
                          fontSize: 20,
                          color: AppColors.liveEmerald,
                        ),
                      ),
                      Text(
                        'Expires ${enrollment.expiryDate}',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.textTertiary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Schedule Details Bar
          if (readiness != null && readiness.hasBatch) ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: AppRadii.smBorderRadius,
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_month_outlined,
                        size: 16,
                        color: AppColors.brandBlue,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          readiness.dayCombination ??
                              readiness.nextSession.dayCombination,
                          style: AppTypography.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      const Icon(
                        Icons.access_time_rounded,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          readiness.clockTiming ??
                              readiness.nextSession.clockTiming,
                          style: AppTypography.bodySmall,
                        ),
                      ),
                    ],
                  ),
                  if (readiness.coachName != null) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        const Icon(
                          Icons.verified_user_outlined,
                          size: 16,
                          color: AppColors.liveEmerald,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            'Sensei ${readiness.coachName} (${readiness.coachRank ?? "Instructor"})',
                            style: AppTypography.bodySmall.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],

          // Live Class Section (Exact Website Live Class Functionality)
          if (!isExpired) ...[
            if (!canJoin) ...[
              // Preparation Information Panel (Exact Website Parity)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF1A1812),
                      Color(0xFF14161D),
                      Color(0xFF0F1117),
                    ],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: AppRadii.smBorderRadius,
                  border: Border.all(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x1AF59E0B),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.auto_awesome_rounded,
                          size: 15,
                          color: Color(0xFFF59E0B),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            'Your Class Is Being Prepared',
                            style: AppTypography.titleSmall.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Our team is currently organizing your training session. We\'ll get back to you soon once your batch and live class are ready.',
                      style: AppTypography.bodySmall.copyWith(
                        color: const Color(0xFFD1D5DB),
                        fontSize: 11.5,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'You\'ll be notified when your virtual classroom is ready to join.',
                      style: AppTypography.bodySmall.copyWith(
                        color: const Color(0xFFF59E0B),
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Disabled Meeting Button
              const AppButton(
                label: 'JOIN LIVE CLASS NOW (Not Ready)',
                variant: AppButtonVariant.outline,
                leadingIcon: Icon(
                  Icons.videocam_rounded,
                  size: 18,
                  color: AppColors.textTertiary,
                ),
                onPressed: null,
              ),
            ] else ...[
              // Active Meeting Button (When session is ready & link is active)
              AppButton(
                label: 'JOIN LIVE CLASS NOW',
                variant: AppButtonVariant.primaryEmerald,
                leadingIcon: const Icon(
                  Icons.videocam_rounded,
                  size: 18,
                  color: Colors.white,
                ),
                trailingIcon: const Icon(
                  Icons.open_in_new_rounded,
                  size: 16,
                  color: Colors.white,
                ),
                onPressed: () =>
                    _handleJoinLiveMeeting(context, effectiveMeetingUrl),
              ),
            ],
          ] else ...[
            // Course Expired State
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                vertical: AppSpacing.md,
                horizontal: AppSpacing.lg,
              ),
              decoration: BoxDecoration(
                color: AppColors.surfaceSecondary,
                borderRadius: AppRadii.smBorderRadius,
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Center(
                child: Text(
                  'Course Validity Expired',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textTertiary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
