import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../../core/utils/app_url_launcher.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../providers/student_dashboard_provider.dart';

/// "Profile & Settings" Screen in the Student Portal.
/// Displays student identity, enrollment status, hardware-backed session info,
/// academy contact support, and secure logout.
class StudentProfileScreen extends ConsumerWidget {
  final bool showAppBar;

  const StudentProfileScreen({super.key, this.showAppBar = true});

  Future<void> _launchExternalUrl(
    BuildContext context,
    String urlString,
    String fallbackMessage,
  ) async {
    await AppUrlLauncher.launch(
      context,
      urlString,
      fallbackMessage: fallbackMessage,
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: AppRadii.lgBorderRadius),
          title: Text('Confirm Logout', style: AppTypography.headlineMedium),
          content: Text(
            'Are you sure you want to log out of your SELFFITS Student account on this device?',
            style: AppTypography.bodyMedium,
          ),
          actionsPadding: const EdgeInsets.only(
            right: AppSpacing.lg,
            bottom: AppSpacing.lg,
            left: AppSpacing.lg,
          ),
          actions: [
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Cancel',
                    variant: AppButtonVariant.ghost,
                    size: AppButtonSize.sm,
                    onPressed: () => Navigator.of(dialogContext).pop(),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: AppButton(
                    label: 'Log Out',
                    variant: AppButtonVariant.primaryRed,
                    size: AppButtonSize.sm,
                    onPressed: () async {
                      Navigator.of(dialogContext).pop();
                      await ref.read(authProvider.notifier).logout();
                    },
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final dashboardState = ref.watch(studentDashboardProvider);
    final enrollment = dashboardState.data?.enrollment;
    final readiness = dashboardState.data?.classReadiness;

    final initial = (user?.name.isNotEmpty ?? false)
        ? user!.name.trim()[0].toUpperCase()
        : 'S';

    final content = RefreshIndicator(
      color: AppColors.brandRed,
      backgroundColor: AppColors.surface,
      onRefresh: () => ref.read(studentDashboardProvider.notifier).refresh(),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.md,
          AppSpacing.lg,
          120,
        ),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          // 1. Profile Avatar & Identity Card
          AppCard(
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.brandRedLight,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.brandRed.withValues(alpha: 0.25),
                      width: 2.0,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      initial,
                      style: AppTypography.displayLarge.copyWith(
                        color: AppColors.brandRed,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  user?.name ?? 'SELFFITS Student',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.pureBlack,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xxs),
                Text(
                  user?.email ?? '',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                StatusBadge(
                  label: (dashboardState.data?.isEnrolled ?? false)
                      ? 'Active Member'
                      : 'Verified Student',
                  variant: (dashboardState.data?.isEnrolled ?? false)
                      ? StatusBadgeVariant.live
                      : StatusBadgeVariant.batch,
                  showLivePulse: dashboardState.data?.isEnrolled ?? false,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 2. Account Details Section
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.xs),
            child: Text(
              'ACCOUNT INFORMATION',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          AppCard(
            child: Column(
              children: [
                _buildInfoRow(
                  icon: Icons.badge_outlined,
                  label: 'Account Role',
                  value: user?.role ?? 'STUDENT',
                  highlight: true,
                ),
                const Divider(
                  height: AppSpacing.lg,
                  color: AppColors.borderSubtle,
                ),
                _buildInfoRow(
                  icon: Icons.fingerprint_rounded,
                  label: 'Account ID',
                  value: user?.id.isNotEmpty ?? false ? user!.id : '—',
                  isMonospace: true,
                ),
                const Divider(
                  height: AppSpacing.lg,
                  color: AppColors.borderSubtle,
                ),
                _buildInfoRow(
                  icon: Icons.check_circle_outline_rounded,
                  label: 'Account Status',
                  value: user?.isBlocked == true
                      ? 'Blocked'
                      : 'Active & Verified',
                  valueColor: user?.isBlocked == true
                      ? AppColors.errorRose
                      : AppColors.liveEmerald,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 3. Active Program & Membership Summary
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.xs),
            child: Text(
              'MEMBERSHIP DETAILS',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          AppCard(
            child: enrollment != null
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (enrollment.tierName != null &&
                          enrollment.tierName!.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: 3.5,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandRedLight,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: AppColors.brandRed.withValues(alpha: 0.2),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            enrollment.tierName!,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.brandRed,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                      ],
                      Text(
                        enrollment.programTitle,
                        style: GoogleFonts.poppins(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.pureBlack,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      const Divider(height: 1, color: AppColors.borderSubtle),
                      const SizedBox(height: AppSpacing.sm),
                      _buildInfoRow(
                        icon: Icons.sports_martial_arts_outlined,
                        label: 'Discipline',
                        value:
                            enrollment.martialArtsType ?? 'Mixed Martial Arts',
                      ),
                      const Divider(
                        height: AppSpacing.lg,
                        color: AppColors.borderSubtle,
                      ),
                      _buildInfoRow(
                        icon: Icons.fitness_center_outlined,
                        label: 'Class Balance',
                        value:
                            '${enrollment.remainingClasses} of ${enrollment.totalClasses} classes left',
                      ),
                      const Divider(
                        height: AppSpacing.lg,
                        color: AppColors.borderSubtle,
                      ),
                      _buildInfoRow(
                        icon: Icons.calendar_today_outlined,
                        label: 'Validity Expiry',
                        value: enrollment.expiryDate.isNotEmpty
                            ? '${enrollment.expiryDate} (${enrollment.daysRemaining} days left)'
                            : 'Active',
                      ),
                      if (readiness?.batchName != null &&
                          readiness!.batchName!.isNotEmpty) ...[
                        const Divider(
                          height: AppSpacing.lg,
                          color: AppColors.borderSubtle,
                        ),
                        _buildInfoRow(
                          icon: Icons.group_work_outlined,
                          label: 'Assigned Batch',
                          value: readiness.batchName!,
                        ),
                      ],
                      if (readiness?.coachName != null &&
                          readiness!.coachName!.isNotEmpty) ...[
                        const Divider(
                          height: AppSpacing.lg,
                          color: AppColors.borderSubtle,
                        ),
                        _buildInfoRow(
                          icon: Icons.person_outline_rounded,
                          label: 'Instructor (Sensei)',
                          value:
                              '${readiness.coachName!} ${readiness.coachRank != null ? "(${readiness.coachRank})" : ""}'
                                  .trim(),
                        ),
                      ],
                    ],
                  )
                : Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceSecondary,
                          borderRadius: AppRadii.smBorderRadius,
                        ),
                        child: const Icon(
                          Icons.lock_outline_rounded,
                          color: AppColors.pureBlack,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'No Active Program',
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.pureBlack,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xxs),
                            Text(
                              'Enroll via selffits.com to unlock live classes and belt training.',
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 5. Support & Academy Links
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.xs),
            child: Text(
              'SUPPORT & ACADEMY',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          AppCard(
            child: Column(
              children: [
                _buildActionRow(
                  icon: Icons.language_outlined,
                  title: 'Official SELFFITS Web Portal',
                  subtitle: 'selffits.com',
                  onTap: () => _launchExternalUrl(
                    context,
                    'https://selffits.com',
                    'Visit selffits.com on your browser.',
                  ),
                ),
                const Divider(
                  height: AppSpacing.lg,
                  color: AppColors.borderSubtle,
                ),
                _buildActionRow(
                  icon: Icons.mail_outline_rounded,
                  title: 'Admissions & Dojo Support',
                  subtitle: 'admissions@selffits.com',
                  onTap: () => _launchExternalUrl(
                    context,
                    'mailto:admissions@selffits.com',
                    'Email admissions@selffits.com for assistance.',
                  ),
                ),
                const Divider(
                  height: AppSpacing.lg,
                  color: AppColors.borderSubtle,
                ),
                _buildActionRow(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy Policy',
                  subtitle: 'selffits.com/privacy',
                  onTap: () => _launchExternalUrl(
                    context,
                    'https://selffits.com/privacy',
                    'Visit selffits.com/privacy.',
                  ),
                ),
                const Divider(
                  height: AppSpacing.lg,
                  color: AppColors.borderSubtle,
                ),
                _buildActionRow(
                  icon: Icons.description_outlined,
                  title: 'Terms & Conditions',
                  subtitle: 'selffits.com/terms',
                  onTap: () => _launchExternalUrl(
                    context,
                    'https://selffits.com/terms',
                    'Visit selffits.com/terms.',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // 6. Logout Button
          AppButton(
            label: 'Log Out of Account',
            variant: AppButtonVariant.outline,
            size: AppButtonSize.lg,
            leadingIcon: const Icon(
              Icons.logout_rounded,
              color: AppColors.brandRed,
              size: 20,
            ),
            onPressed: () => _showLogoutDialog(context, ref),
          ),
          const SizedBox(height: AppSpacing.md),

          // Version Tag
          Center(
            child: Text(
              'SELFFITS Mobile v1.0.0 • Connected to selffits.com',
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );

    if (!showAppBar) {
      return content;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: SelffitsAppBar(
        automaticallyImplyLeading: true,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_rounded,
            color: AppColors.pureBlack,
          ),
          tooltip: 'Back',
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Profile & Settings',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.pureBlack,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Profile',
            color: AppColors.pureBlack,
            onPressed: () async {
              await ref.read(studentDashboardProvider.notifier).refresh();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Profile data refreshed.'),
                    backgroundColor: AppColors.pureBlack,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadii.smBorderRadius,
                    ),
                    duration: const Duration(seconds: 2),
                  ),
                );
              }
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(child: content),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
    bool highlight = false,
    bool isMonospace = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: AppColors.pureBlack),
          const SizedBox(width: AppSpacing.md),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Align(
              alignment: Alignment.centerRight,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerRight,
                child: Text(
                  value,
                  maxLines: 1,
                  textAlign: TextAlign.end,
                  style: isMonospace
                      ? GoogleFonts.jetBrainsMono(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: -0.2,
                          color:
                              valueColor ??
                              (highlight
                                  ? AppColors.brandRed
                                  : AppColors.pureBlack),
                        )
                      : GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: highlight
                              ? FontWeight.w700
                              : FontWeight.w600,
                          color:
                              valueColor ??
                              (highlight
                                  ? AppColors.brandRed
                                  : AppColors.pureBlack),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadii.smBorderRadius,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.surfaceSecondary,
                borderRadius: AppRadii.smBorderRadius,
              ),
              child: Icon(icon, size: 18, color: AppColors.pureBlack),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.pureBlack,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.pureBlack,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
