import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../../core/utils/app_url_launcher.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../providers/coach_dashboard_provider.dart';

/// "Profile & Settings" Screen for the Coach / Sensei Portal.
/// Displays Sensei identity, highest rank, disciplines, teaching statistics,
/// hardware session status, support links, and secure logout.
class CoachProfileScreen extends ConsumerWidget {
  const CoachProfileScreen({super.key});

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
            'Are you sure you want to log out of your SELFFITS Sensei account on this device?',
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
    final dashboardState = ref.watch(coachDashboardProvider);
    final coach = dashboardState.data?.coach;

    final name = coach?.displayName ?? user?.name ?? 'Sensei';
    final initial = name.isNotEmpty ? name.trim()[0].toUpperCase() : 'S';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: SelffitsAppBar(
        automaticallyImplyLeading: true,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_rounded,
            color: AppColors.pureBlack,
          ),
          tooltip: 'Back to Coach Portal',
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Sensei Profile & Settings',
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
              await ref.read(coachDashboardProvider.notifier).refresh();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Sensei profile data refreshed.'),
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
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.brandRed,
          backgroundColor: AppColors.surface,
          onRefresh: () => ref.read(coachDashboardProvider.notifier).refresh(),
          child: ListView(
            padding: AppSpacing.screenPadding,
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
                        color: AppColors.brandBlueLight,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.brandBlue.withValues(alpha: 0.25),
                          width: 2.0,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          initial,
                          style: AppTypography.displayLarge.copyWith(
                            color: AppColors.brandBlue,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      name,
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.pureBlack,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      coach?.email ?? user?.email ?? '',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      coach?.highestRank ?? 'Certified Martial Arts Instructor',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: AppColors.brandBlue,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    const StatusBadge(
                      label: 'Sensei Verified',
                      variant: StatusBadgeVariant.live,
                      showLivePulse: true,
                    ),
                    if (coach?.disciplines != null &&
                        coach!.disciplines.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.md),
                      Wrap(
                        spacing: AppSpacing.xs,
                        runSpacing: AppSpacing.xs,
                        alignment: WrapAlignment.center,
                        children: coach.disciplines.map((d) {
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
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // 2. Account Information Section
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
                      value: user?.role ?? 'COACH',
                      highlight: true,
                    ),
                    const Divider(
                      height: AppSpacing.lg,
                      color: AppColors.borderSubtle,
                    ),
                    _buildInfoRow(
                      icon: Icons.fingerprint_rounded,
                      label: 'Sensei ID',
                      value: coach?.id.isNotEmpty ?? false
                          ? coach!.id
                          : (user?.id ?? '—'),
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

              // 3. Teaching Overview Section
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.xs),
                child: Text(
                  'TEACHING OVERVIEW',
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
                      icon: Icons.groups_outlined,
                      label: 'Assigned Batches',
                      value:
                          '${dashboardState.data?.totalBatchesCount ?? 0} Live Groups',
                    ),
                    const Divider(
                      height: AppSpacing.lg,
                      color: AppColors.borderSubtle,
                    ),
                    _buildInfoRow(
                      icon: Icons.people_outline_rounded,
                      label: 'Active Students',
                      value:
                          '${dashboardState.data?.totalStudentsCount ?? 0} Enrolled',
                    ),
                    const Divider(
                      height: AppSpacing.lg,
                      color: AppColors.borderSubtle,
                    ),
                    _buildInfoRow(
                      icon: Icons.military_tech_outlined,
                      label: 'Instructor Rank',
                      value: coach?.highestRank ?? 'Certified Sensei',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // 4. Hardware Security & Session Protection
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.xs),
                child: Text(
                  'SECURITY & HARDWARE SESSION',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              AppCard(
                backgroundColor: AppColors.surfaceSecondary,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceTertiary,
                        borderRadius: AppRadii.smBorderRadius,
                      ),
                      child: const Icon(
                        Icons.shield_outlined,
                        color: AppColors.pureBlack,
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
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.pureBlack,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xxs),
                          Text(
                            'Session isolated with platform hardware encryption. Authorized strictly for assigned batch rosters and live Dojo sessions.',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              height: 1.4,
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
                      subtitle: 'selffits.com/coach/dashboard',
                      onTap: () => _launchExternalUrl(
                        context,
                        'https://selffits.com/coach/dashboard',
                        'Visit selffits.com on your browser.',
                      ),
                    ),
                    const Divider(
                      height: AppSpacing.lg,
                      color: AppColors.borderSubtle,
                    ),
                    _buildActionRow(
                      icon: Icons.mail_outline_rounded,
                      title: 'Instructor Support & Dojo Admin',
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
                label: 'Log Out of Sensei Account',
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
        ),
      ),
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
