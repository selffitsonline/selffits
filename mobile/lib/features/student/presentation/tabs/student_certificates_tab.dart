import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../../core/utils/app_url_launcher.dart';
import '../../providers/student_dashboard_provider.dart';

/// "My Certificates" Tab in the Student Portal.
/// Displays official certification status and authentic empty state.
/// Notes: The website download endpoint (/api/certificates/download/[id]) requires
/// NextAuth cookie-session authentication; mobile downloads are safely documented
/// and deferred to the website portal until a secure mobile Bearer endpoint is available.
class StudentCertificatesTab extends ConsumerWidget {
  const StudentCertificatesTab({super.key});

  Future<void> _openCertificatesOnWeb(BuildContext context) async {
    await AppUrlLauncher.launch(
      context,
      'https://selffits.com/dashboard/certificates',
      fallbackMessage:
          'Could not open browser. Please visit selffits.com/dashboard/certificates.',
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
            'MY OFFICIAL CREDENTIALS',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandBlue,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text('Official Certificates', style: AppTypography.displayMedium),
          const SizedBox(height: AppSpacing.xxs),
          Text(
            'View and verify your official SELFFITS Academy belt graduation and program credentials.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Primary Empty State Card
          AppCard(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                vertical: AppSpacing.lg,
                horizontal: AppSpacing.sm,
              ),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7), // Warm amber background
                      borderRadius: AppRadii.lgBorderRadius,
                      border: Border.all(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                      ),
                    ),
                    child: const Icon(
                      Icons.workspace_premium_rounded,
                      color: Color(0xFFD97706),
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'No Certificates Issued Yet',
                    style: AppTypography.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'Official belt graduation and program completion certificates appear here automatically once issued by your head coach following your live batch examination evaluation.',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.45,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSecondary,
                      borderRadius: AppRadii.mdBorderRadius,
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.verified_outlined,
                          size: 18,
                          color: AppColors.liveEmerald,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            'Certificates are tamper-proof and include unique verifiable IDs registered with SELFFITS Academy.',
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Certificate Requirements Info Card
          AppCard(
            backgroundColor: AppColors.surfaceSecondary,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CERTIFICATION MILESTONES',
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _buildMilestoneRow(
                  Icons.check_circle_outline_rounded,
                  '1. Regular Dojo Attendance',
                  'Maintain at least 80% attendance in your live batch training sessions.',
                ),
                const Divider(height: AppSpacing.xl),
                _buildMilestoneRow(
                  Icons.sports_martial_arts_rounded,
                  '2. Technical Demonstration',
                  'Demonstrate form, technique, and stamina during training classes.',
                ),
                const Divider(height: AppSpacing.xl),
                _buildMilestoneRow(
                  Icons.military_tech_outlined,
                  '3. Live Batch Examination',
                  'Pass the formal belt evaluation conducted by your assigned Sensei.',
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Portal Security Notice Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.shield_outlined,
                      size: 20,
                      color: AppColors.brandBlue,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      'Web Portal Verification',
                      style: AppTypography.titleMedium.copyWith(fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Direct in-app PDF downloads require website-session authentication. You can view, verify, and print your issued certificates securely on selffits.com.',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                AppButton(
                  label: 'OPEN SELFFITS.COM PORTAL',
                  variant: AppButtonVariant.outline,
                  size: AppButtonSize.sm,
                  fullWidth: false,
                  trailingIcon: const Icon(Icons.open_in_new_rounded, size: 14),
                  onPressed: () => _openCertificatesOnWeb(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildMilestoneRow(IconData icon, String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.brandBlue),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.titleMedium.copyWith(fontSize: 13),
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
