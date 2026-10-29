import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/design_system/design_system.dart';
import '../../auth/models/auth_user.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/presentation/notification_badge_button.dart';
import '../../student/utils/class_status_calculator.dart';
import '../models/coach_dashboard_data.dart';
import '../providers/coach_dashboard_provider.dart';
import 'screens/coach_profile_screen.dart';
import 'tabs/coach_batches_tab.dart';
import 'tabs/coach_schedule_tab.dart';
import 'tabs/coach_students_tab.dart';
import 'widgets/coach_drawer.dart';

/// Authenticated Coach / Sensei Dashboard Screen.
/// Built with the approved Luxury White Design System.
/// Enforces:
/// - Real backend coach data, assigned batches, and student rosters.
/// - Role isolation and hardware-backed session protection.
/// - Google Meet launch for live classes.
/// - Pull-to-refresh, loading skeletons, and connection retry states.
/// - Strict white/light canvas with zero dark-mode backgrounds.
class CoachHomeScreen extends ConsumerStatefulWidget {
  const CoachHomeScreen({super.key});

  @override
  ConsumerState<CoachHomeScreen> createState() => _CoachHomeScreenState();
}

class _CoachHomeScreenState extends ConsumerState<CoachHomeScreen> {
  int _currentIndex = 0;
  // Set of batch IDs that are expanded to show student rosters
  final Set<String> _expandedBatchIds = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(coachDashboardProvider.notifier).loadDashboard();
    });
  }

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

  Widget _buildAppBarTitle() {
    switch (_currentIndex) {
      case 1:
        return Text(
          'My Batches',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      case 2:
        return Text(
          'Teaching Schedule',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      case 3:
        return Text(
          'Enrolled Students',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      default:
        return const SelffitsLogo(
          height: 23,
          showText: false,
          fit: BoxFit.contain,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(coachDashboardProvider);
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: SelffitsAppBar(
        automaticallyImplyLeading: true,
        title: _buildAppBarTitle(),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline_rounded),
            tooltip: 'Sensei Profile & Settings',
            color: AppColors.pureBlack,
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const CoachProfileScreen(),
                ),
              );
            },
          ),
          const Padding(
            padding: EdgeInsets.only(right: 8),
            child: NotificationBadgeButton(),
          ),
        ],
      ),
      drawer: CoachDrawer(
        selectedIndex: _currentIndex,
        onSectionSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _currentIndex,
          children: [
            _buildDashboardTab(dashboardState, user),
            const CoachBatchesTab(),
            const CoachScheduleTab(),
            const CoachStudentsTab(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(
            top: BorderSide(color: AppColors.borderLight, width: 1.0),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.brandRed,
          unselectedItemColor: AppColors.pureBlack,
          selectedLabelStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 11,
            color: AppColors.brandRed,
          ),
          unselectedLabelStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w500,
            fontSize: 11,
            color: AppColors.pureBlack,
          ),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined, size: 22),
              activeIcon: Icon(Icons.dashboard_rounded, size: 22),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.groups_outlined, size: 22),
              activeIcon: Icon(Icons.groups_rounded, size: 22),
              label: 'Batches',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_month_outlined, size: 22),
              activeIcon: Icon(Icons.calendar_month_rounded, size: 22),
              label: 'Schedule',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_outline_rounded, size: 22),
              activeIcon: Icon(Icons.people_rounded, size: 22),
              label: 'Students',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardTab(
    CoachDashboardState dashboardState,
    AuthUser? user,
  ) {
    return RefreshIndicator(
      color: AppColors.brandRed,
      backgroundColor: AppColors.surface,
      onRefresh: () => ref.read(coachDashboardProvider.notifier).refresh(),
      child: ListView(
        padding: AppSpacing.screenPadding,
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          // 1. Coach Greeting & Profile Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Sensei Portal,', style: AppTypography.bodyLarge),
                    Text(
                      dashboardState.data?.coach.displayName ??
                          user?.name ??
                          'Sensei',
                      style: AppTypography.displayMedium,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      dashboardState.data?.coach.highestRank ??
                          'Certified Martial Arts Instructor',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.brandBlue,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const StatusBadge(
                label: 'Sensei Verified',
                variant: StatusBadgeVariant.live,
                showLivePulse: true,
              ),
            ],
          ),

          // Disciplines Tags
          if (dashboardState.data?.coach.disciplines != null &&
              dashboardState.data!.coach.disciplines.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: dashboardState.data!.coach.disciplines.map((d) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSecondary,
                    borderRadius: AppRadii.smBorderRadius,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Text(
                    d,
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),

          // Hardware-Backed Session Card
          AppCard(
            backgroundColor: AppColors.surfaceSecondary,
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.brandBlueLight,
                    borderRadius: AppRadii.smBorderRadius,
                  ),
                  child: const Icon(
                    Icons.shield_outlined,
                    color: AppColors.brandBlue,
                    size: 22,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Sensei Hardware Session Active',
                        style: AppTypography.titleMedium.copyWith(fontSize: 14),
                      ),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        'Session isolated with platform hardware encryption. Authorized for live batch instruction.',
                        style: AppTypography.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // 2. Error State Notice
          if (dashboardState.errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.errorRoseLight,
                borderRadius: AppRadii.mdBorderRadius,
                border: Border.all(
                  color: AppColors.errorRose.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.error_outline_rounded,
                        size: 20,
                        color: AppColors.errorRose,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          'Connection Issue',
                          style: AppTypography.titleMedium.copyWith(
                            color: AppColors.errorRose,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    dashboardState.errorMessage!,
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  AppButton(
                    label: 'Retry Connection',
                    variant: AppButtonVariant.outline,
                    size: AppButtonSize.sm,
                    fullWidth: false,
                    onPressed: () {
                      ref.read(coachDashboardProvider.notifier).loadDashboard();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // 3. Loading Skeleton State
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
                        'Loading your coaching schedule & batches...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // 4. Data Content
          if (dashboardState.hasData) ...[
            // Metrics Overview Card
            _buildMetricsOverview(dashboardState.data!),
            const SizedBox(height: AppSpacing.xxl),

            // Primary Upcoming Live Dojo Session
            if (dashboardState.data!.upcomingClass != null) ...[
              _buildUpcomingClassHero(dashboardState.data!.upcomingClass!),
              const SizedBox(height: AppSpacing.xxl),
            ],

            // Assigned Batches Section
            _buildBatchesSection(dashboardState.data!.batches),
            const SizedBox(height: AppSpacing.xxl),

            // Sensei Guidelines
            _buildSenseiGuidelines(),
            const SizedBox(height: AppSpacing.xxxl),
          ],
        ],
      ),
    );
  }

  /// Builds the high-level coach metrics overview.
  Widget _buildMetricsOverview(CoachDashboardData data) {
    return Row(
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
                  'Assigned Batches',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  '${data.totalBatchesCount}',
                  style: AppTypography.metricBold.copyWith(
                    color: AppColors.brandBlue,
                  ),
                ),
                Text(
                  'Live Class Groups',
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
                  'Active Students',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  '${data.totalStudentsCount}',
                  style: AppTypography.metricBold.copyWith(
                    color: AppColors.liveEmerald,
                  ),
                ),
                Text(
                  'Enrolled in Dojo',
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
    );
  }

  /// Builds the Hero Upcoming Session to Conduct.
  Widget _buildUpcomingClassHero(CoachBatchSummary batch) {
    final localTime = ClassStatusCalculator.formatLocalTime(batch.clockTiming);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'YOUR NEXT CLASS TO CONDUCT',
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

              // Roster Summary Banner
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

              // Launch Google Meet CTA
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
                    ? () => _handleStartMeeting(batch.meetingUrl)
                    : null,
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Builds the list of all assigned batches with student rosters.
  Widget _buildBatchesSection(List<CoachBatchSummary> batches) {
    if (batches.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'YOUR TRAINING BATCHES',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
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
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'YOUR TRAINING BATCHES',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.brandBlue,
              ),
            ),
            Text(
              '${batches.length} Assigned',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textTertiary,
                fontSize: 11,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        ...batches.map((batch) => _buildBatchCard(batch)),
      ],
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

  /// Builds the academy live class etiquette guidelines for instructors.
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
