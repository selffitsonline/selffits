import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/design_system/design_system.dart';
import '../../auth/models/auth_user.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/presentation/notification_badge_button.dart';
import '../models/student_dashboard_data.dart';
import '../providers/student_dashboard_provider.dart';
import '../utils/class_status_calculator.dart';
import 'screens/student_profile_screen.dart';
import 'tabs/student_certificates_tab.dart';
import 'tabs/student_programs_tab.dart';
import 'tabs/student_progress_tab.dart';

/// Riverpod StateProvider tracking the active student sub-section inside Account:
/// - 0: Dashboard (existing student dashboard content only)
/// - 1: Programs (existing student programs/membership content)
/// - 2: Progress (existing student progress and attendance content)
/// - 3: Certificates (existing certificates content)
/// - 4: Account Information (default student profile and account details)
final studentAccountSectionProvider = StateProvider<int>((ref) => 4);

/// Authenticated Student Live Class Dashboard Screen.
/// Built with the approved Luxury White Design System.
/// Enforces:
/// - Top curved navigation pill with 4 destinations (Dashboard, Programs, Progress, Certificates).
/// - Initial Account landing upon login.
/// - Integrated Account profile information with zero duplicate controls.
/// - Real backend class readiness & Google Meet launcher.
/// - Time-accurate countdowns and live class states.
/// - Pull-to-refresh and network error recovery.
/// - Strict white/light canvas with zero dark-mode backgrounds.
class StudentHomeScreen extends ConsumerStatefulWidget {
  final int initialIndex;

  const StudentHomeScreen({super.key, this.initialIndex = 0});

  @override
  ConsumerState<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends ConsumerState<StudentHomeScreen>
    with WidgetsBindingObserver {
  late int _currentIndex;
  Timer? _statusRefreshTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentIndex = widget.initialIndex;
    Future.microtask(() {
      if (mounted) {
        ref.read(studentAccountSectionProvider.notifier).state =
            widget.initialIndex;
      }
    });
    // Load dashboard on initial mount
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(studentDashboardProvider.notifier).loadDashboard();
    });
    // Automatic periodic refresh (every 15s) to reflect real-time live class readiness transitions
    _statusRefreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (mounted) {
        ref.read(studentDashboardProvider.notifier).refresh();
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _statusRefreshTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted) {
      ref.read(studentDashboardProvider.notifier).refresh();
    }
  }

  @override
  void didUpdateWidget(covariant StudentHomeScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialIndex != widget.initialIndex) {
      _currentIndex = widget.initialIndex;
    }
  }

  Future<void> _handleJoinMeeting(String? meetingUrl) async {
    if (meetingUrl == null || meetingUrl.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(
            'Google Meet link will be activated by your Sensei before class.',
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
      case 0:
        return Text(
          'Student Dashboard',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      case 1:
        return Text(
          'My Programs',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      case 2:
        return Text(
          'My Progress',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      case 3:
        return Text(
          'My Certificates',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        );
      case 4:
      default:
        return const SelffitsLogo(
          height: 23,
          showText: false,
          fit: BoxFit.contain,
        );
    }
  }

  Widget _buildTopNavigationBar() {
    final items = [
      (
        icon: Icons.dashboard_outlined,
        activeIcon: Icons.dashboard_rounded,
        label: 'Dashboard',
        index: 0,
      ),
      (
        icon: Icons.sports_martial_arts_outlined,
        activeIcon: Icons.sports_martial_arts_rounded,
        label: 'Programs',
        index: 1,
      ),
      (
        icon: Icons.trending_up_rounded,
        activeIcon: Icons.trending_up_rounded,
        label: 'Progress',
        index: 2,
      ),
      (
        icon: Icons.workspace_premium_outlined,
        activeIcon: Icons.workspace_premium_rounded,
        label: 'Certificates',
        index: 3,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.xs,
      ),
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
          boxShadow: const [
            BoxShadow(
              color: Color(0x180F172A),
              blurRadius: 18,
              offset: Offset(0, 6),
            ),
            BoxShadow(
              color: Color(0x0C0F172A),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: Row(
            children: items.map((item) {
              final isSelected = _currentIndex == item.index;
              return Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      final newIndex = _currentIndex == item.index
                          ? 4
                          : item.index;
                      setState(() {
                        _currentIndex = newIndex;
                      });
                      ref.read(studentAccountSectionProvider.notifier).state =
                          newIndex;
                    },
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isSelected ? item.activeIcon : item.icon,
                            size: 20,
                            color: isSelected
                                ? AppColors.brandRed
                                : AppColors.pureBlack,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: isSelected
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: isSelected
                                  ? AppColors.brandRed
                                  : AppColors.pureBlack,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<int>(studentAccountSectionProvider, (previous, next) {
      if (next != _currentIndex && mounted) {
        setState(() {
          _currentIndex = next;
        });
      }
    });

    final dashboardState = ref.watch(studentDashboardProvider);
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: SelffitsAppBar(
        automaticallyImplyLeading: false,
        leading: _currentIndex != 4
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                tooltip: 'Back to Account',
                color: AppColors.pureBlack,
                onPressed: () {
                  setState(() {
                    _currentIndex = 4;
                  });
                  ref.read(studentAccountSectionProvider.notifier).state = 4;
                },
              )
            : null,
        title: _buildAppBarTitle(),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 8),
            child: NotificationBadgeButton(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildTopNavigationBar(),
            Expanded(
              child: IndexedStack(
                index: _currentIndex,
                children: [
                  _buildDashboardTab(dashboardState, user),
                  const StudentProgramsTab(),
                  const StudentProgressTab(),
                  const StudentCertificatesTab(),
                  const StudentProfileScreen(showAppBar: false),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardTab(
    StudentDashboardState dashboardState,
    AuthUser? user,
  ) {
    return RefreshIndicator(
      color: AppColors.brandRed,
      backgroundColor: AppColors.surface,
      onRefresh: () => ref.read(studentDashboardProvider.notifier).refresh(),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          120,
        ),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          // 1. Student Greeting & Profile Summary
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Welcome back,', style: AppTypography.bodyLarge),
                    Text(
                      user?.name ?? 'Student',
                      style: AppTypography.displayMedium,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      user?.email ?? '',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  StatusBadge(
                    label: (dashboardState.data?.isEnrolled ?? false)
                        ? 'Active Member'
                        : (user?.isStudent ?? false)
                        ? 'Verified Student'
                        : 'Student Portal',
                    variant: (dashboardState.data?.isEnrolled ?? false)
                        ? StatusBadgeVariant.live
                        : StatusBadgeVariant.batch,
                    showLivePulse: dashboardState.data?.isEnrolled ?? false,
                  ),
                  if (dashboardState.data?.unreadNotificationsCount != null &&
                      dashboardState.data!.unreadNotificationsCount > 0) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.brandBlueLight,
                        borderRadius: AppRadii.smBorderRadius,
                        border: Border.all(
                          color: AppColors.brandBlue.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.notifications_active_outlined,
                            size: 12,
                            color: AppColors.brandBlue,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${dashboardState.data!.unreadNotificationsCount} update${dashboardState.data!.unreadNotificationsCount > 1 ? 's' : ''}',
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 11,
                              color: AppColors.brandBlue,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),

          // 2. Error State Notice (if error occurred)
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
                      ref
                          .read(studentDashboardProvider.notifier)
                          .loadDashboard();
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
                        'Loading your live class schedule...',
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // 4. Hero Live Class Readiness Section or Unenrolled State
          if (dashboardState.hasData) ...[
            if (!dashboardState.data!.isEnrolled) ...[
              _buildUnenrolledSection(),
              const SizedBox(height: AppSpacing.xxl),
            ] else ...[
              _buildHeroClassSection(
                dashboardState.data!.classReadiness,
                enrollment: dashboardState.data!.enrollment,
              ),
              const SizedBox(height: AppSpacing.xxl),
            ],

            // 6. Academy Live Dojo Guidelines
            _buildAcademyGuidelines(),
            const SizedBox(height: AppSpacing.xxxl),
          ],
        ],
      ),
    );
  }

  /// Exact Website Parity: Preparation Information Panel
  Widget _buildClassPreparationPanel() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A1812), Color(0xFF14161D), Color(0xFF0F1117)],
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
    );
  }

  /// Builds the primary Hero Upcoming Class Card based on verified backend readiness.
  Widget _buildHeroClassSection(
    StudentClassReadiness readiness, {
    StudentEnrollmentSummary? enrollment,
  }) {
    final statusResult = ClassStatusCalculator.evaluate(readiness);
    final isMeetingActive = readiness.hasValidMeetingUrl && readiness.isReady;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'YOUR UPCOMING CLASS',
          style: AppTypography.labelSmall.copyWith(color: AppColors.brandRed),
        ),
        const SizedBox(height: AppSpacing.xs),

        // Unassigned Batch State
        if (!readiness.hasBatch) ...[
          AppCard(
            backgroundColor: AppColors.surfaceSecondary,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    StatusBadge(
                      label: statusResult.badgeLabel,
                      variant: statusResult.badgeVariant,
                    ),
                    const Icon(
                      Icons.schedule_rounded,
                      size: 20,
                      color: AppColors.brandBlue,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  readiness.programTitle ?? 'Batch Assignment in Progress',
                  style: AppTypography.headlineLarge,
                ),
                const SizedBox(height: AppSpacing.xxs),
                if (readiness.programTitle != null) ...[
                  Text(
                    'Batch Assignment in Progress',
                    style: AppTypography.titleSmall.copyWith(
                      color: AppColors.brandBlue,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                ],
                Text(
                  'Your enrollment is active! Academy Senseis are organizing your training session and assigning your live class batch.',
                  style: AppTypography.bodyMedium,
                ),
                const SizedBox(height: AppSpacing.lg),
                _buildClassPreparationPanel(),
                const SizedBox(height: AppSpacing.md),
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
              ],
            ),
          ),
        ] else ...[
          // Active Assigned Batch Hero Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badges Row
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.xs,
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    StatusBadge(
                      label: statusResult.badgeLabel,
                      variant: statusResult.badgeVariant,
                      showLivePulse: statusResult.showLivePulse,
                    ),
                    if (readiness.batchCode != null)
                      StatusBadge(
                        label: readiness.batchCode!,
                        variant: StatusBadgeVariant.batch,
                      ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                // Batch Name / Program Title
                Text(
                  readiness.batchName ??
                      readiness.programTitle ??
                      'Martial Arts Live Batch',
                  style: AppTypography.headlineLarge,
                ),
                const SizedBox(height: AppSpacing.xxs),

                // Schedule Clock Timing & Full Date
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
                        '${readiness.nextSession.nextClassFullDate} • ${readiness.nextSession.clockTiming}',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                Builder(
                  builder: (context) {
                    final localTime = ClassStatusCalculator.formatLocalTime(
                      readiness.clockTiming ??
                          readiness.nextSession.clockTiming,
                    );
                    if (localTime == null) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.xxs),
                      child: Row(
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
                    );
                  },
                ),
                const SizedBox(height: AppSpacing.xs),

                // Live Countdown Banner
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: statusResult.status == ClassLiveStatus.live
                        ? AppColors.liveEmeraldLight
                        : AppColors.brandBlueLight,
                    borderRadius: AppRadii.smBorderRadius,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        statusResult.status == ClassLiveStatus.live
                            ? Icons.radio_button_checked_rounded
                            : Icons.timer_outlined,
                        size: 16,
                        color: statusResult.status == ClassLiveStatus.live
                            ? AppColors.liveEmerald
                            : AppColors.brandBlue,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          statusResult.countdownText,
                          style: AppTypography.bodySmall.copyWith(
                            color: statusResult.status == ClassLiveStatus.live
                                ? AppColors.liveEmerald
                                : AppColors.brandBlue,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),

                // Coach Information Banner
                if (readiness.coachName != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSecondary,
                      borderRadius: AppRadii.smBorderRadius,
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.verified_user_outlined,
                          size: 18,
                          color: AppColors.brandBlue,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            '${readiness.coachName!.toLowerCase().startsWith("sensei") ? "" : "Sensei "}${readiness.coachName} (${readiness.coachRank ?? "Instructor"})',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],

                // Attendance Progress Bar (Website Parity)
                if (enrollment != null) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'Course Attendance Progress',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '${enrollment.completedClasses} of ${enrollment.totalClasses} (${enrollment.progressPercentage}%)',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  ClipRRect(
                    borderRadius: AppRadii.pillBorderRadius,
                    child: Container(
                      height: 8,
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
                ],

                // Live Class Preparation & Activation Section (Exact Website Parity)
                if (!isMeetingActive) ...[
                  _buildClassPreparationPanel(),
                  const SizedBox(height: AppSpacing.md),
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
                  AppButton(
                    label: 'JOIN LIVE CLASS NOW',
                    variant: AppButtonVariant.primaryEmerald,
                    leadingIcon: const Icon(
                      Icons.videocam_rounded,
                      size: 20,
                      color: AppColors.pureBlack,
                    ),
                    trailingIcon: const Icon(
                      Icons.open_in_new_rounded,
                      size: 16,
                      color: AppColors.pureBlack,
                    ),
                    onPressed: () => _handleJoinMeeting(readiness.meetingUrl),
                  ),
                ],
                const SizedBox(height: AppSpacing.md),

                // Footer Metadata Details
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        readiness.dayCombination ??
                            readiness.nextSession.dayCombination,
                        style: AppTypography.bodySmall,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (readiness.capacityLabel != null)
                      Text(
                        '${readiness.capacityLabel} Students',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.liveEmerald,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  /// Builds a dedicated luxury enrollment summary card for a course.
  Widget _buildEnrollmentCard(StudentEnrollmentSummary enrollment) {
    return AppCard(
      backgroundColor: AppColors.surfaceSecondary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  enrollment.programTitle,
                  style: AppTypography.headlineMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              StatusBadge(
                label: enrollment.status,
                variant: StatusBadgeVariant.live,
              ),
            ],
          ),
          if (enrollment.tierName != null) ...[
            const SizedBox(height: AppSpacing.xxs),
            Text(
              enrollment.tierName!,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.brandBlue,
              ),
            ),
          ],
          if (enrollment.martialArtsType != null ||
              enrollment.includeDietNutrition) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.xs,
              children: [
                if (enrollment.martialArtsType != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
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
                      horizontal: 8,
                      vertical: 3,
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
                          'Diet Plan Included',
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
          ],
          const SizedBox(height: AppSpacing.lg),

          // Metrics Row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: AppRadii.smBorderRadius,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Remaining', style: AppTypography.bodySmall),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        '${enrollment.remainingClasses} / ${enrollment.totalClasses}',
                        style: AppTypography.metricBold.copyWith(fontSize: 22),
                      ),
                      Text(
                        'Classes Left',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textTertiary,
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
                    borderRadius: AppRadii.smBorderRadius,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Expires On', style: AppTypography.bodySmall),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        enrollment.expiryDate,
                        style: AppTypography.headlineMedium.copyWith(
                          fontSize: 16,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${enrollment.daysRemaining} days remaining',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.liveEmerald,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Attendance Progress Bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Course Attendance Progress',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '${enrollment.completedClasses} of ${enrollment.totalClasses} (${enrollment.progressPercentage}%)',
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 11,
                      color: AppColors.brandBlue,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              ClipRRect(
                borderRadius: AppRadii.pillBorderRadius,
                child: Container(
                  height: 8,
                  width: double.infinity,
                  color: AppColors.borderLight,
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: enrollment.progressFraction,
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.brandBlue, AppColors.liveEmerald],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds the un-enrolled / pending membership notice.
  Widget _buildUnenrolledSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'MEMBERSHIP STATUS',
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
                    label: 'No Active Membership',
                    variant: StatusBadgeVariant.neutral,
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadii.smBorderRadius,
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: const Icon(
                      Icons.lock_outline_rounded,
                      size: 18,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'No Active Martial Arts Enrollment',
                style: AppTypography.headlineMedium,
              ),
              const SizedBox(height: AppSpacing.xxs),
              Text(
                'Your profile is registered with Selffits Academy. To join live karate and fitness sessions with our Senseis, please enroll in a training program.',
                style: AppTypography.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.lg),
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: AppRadii.smBorderRadius,
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      size: 18,
                      color: AppColors.brandBlue,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Text(
                        'Visit selffits.com on web to view programs or contact admissions@selffits.com',
                        style: AppTypography.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Builds the academy live class etiquette guidelines.
  Widget _buildAcademyGuidelines() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'LIVE CLASS ETIQUETTE',
          style: AppTypography.labelSmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        AppCard(
          child: Column(
            children: [
              _buildGuidelineItem(
                Icons.check_circle_outline_rounded,
                'Join 5 Minutes Early',
                'Ensure your audio and video are configured before Sensei begins session.',
              ),
              const Divider(height: AppSpacing.xl),
              _buildGuidelineItem(
                Icons.videocam_outlined,
                'Full-Body Camera Angle',
                'Position your device horizontally with at least 2 meters of clear mat space.',
              ),
              const Divider(height: AppSpacing.xl),
              _buildGuidelineItem(
                Icons.fitness_center_rounded,
                'Proper Dojo Attire',
                'Wear your official Selffits karate gi or comfortable martial arts training uniform.',
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
