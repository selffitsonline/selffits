import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../providers/student_dashboard_provider.dart';
import '../screens/student_profile_screen.dart';

/// Navigation Drawer for the Student Portal.
/// Gives quick access to all 5 Student Portal sections:
/// 1. Dashboard
/// 2. My Programs
/// 3. My Progress
/// 4. My Certificates
/// 5. Profile & Settings
class StudentDrawer extends ConsumerWidget {
  final int selectedIndex;
  final ValueChanged<int> onSectionSelected;

  const StudentDrawer({
    super.key,
    required this.selectedIndex,
    required this.onSectionSelected,
  });

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
    final initial = (user?.name.isNotEmpty ?? false)
        ? user!.name.trim()[0].toUpperCase()
        : 'S';

    return Drawer(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header with User Profile
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.borderLight, width: 1.0),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.brandRedLight,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.brandRed.withValues(alpha: 0.25),
                        width: 1.5,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        initial,
                        style: AppTypography.headlineMedium.copyWith(
                          color: AppColors.brandRed,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'Student',
                          style: AppTypography.titleMedium,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? '',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        StatusBadge(
                          label: (dashboardState.data?.isEnrolled ?? false)
                              ? 'Active Member'
                              : 'Student',
                          variant: (dashboardState.data?.isEnrolled ?? false)
                              ? StatusBadgeVariant.live
                              : StatusBadgeVariant.batch,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.md,
                ),
                children: [
                  _buildNavItem(
                    context: context,
                    icon: Icons.dashboard_outlined,
                    activeIcon: Icons.dashboard_rounded,
                    title: 'Dashboard',
                    isSelected: selectedIndex == 0,
                    onTap: () {
                      Navigator.of(context).pop();
                      onSectionSelected(0);
                    },
                  ),
                  _buildNavItem(
                    context: context,
                    icon: Icons.sports_martial_arts_outlined,
                    activeIcon: Icons.sports_martial_arts_rounded,
                    title: 'My Programs',
                    isSelected: selectedIndex == 1,
                    onTap: () {
                      Navigator.of(context).pop();
                      onSectionSelected(1);
                    },
                  ),
                  _buildNavItem(
                    context: context,
                    icon: Icons.trending_up_rounded,
                    activeIcon: Icons.trending_up_rounded,
                    title: 'My Progress',
                    isSelected: selectedIndex == 2,
                    onTap: () {
                      Navigator.of(context).pop();
                      onSectionSelected(2);
                    },
                  ),
                  _buildNavItem(
                    context: context,
                    icon: Icons.workspace_premium_outlined,
                    activeIcon: Icons.workspace_premium_rounded,
                    title: 'My Certificates',
                    isSelected: selectedIndex == 3,
                    onTap: () {
                      Navigator.of(context).pop();
                      onSectionSelected(3);
                    },
                  ),
                  const Divider(height: AppSpacing.xl),
                  _buildNavItem(
                    context: context,
                    icon: Icons.person_outline_rounded,
                    activeIcon: Icons.person_rounded,
                    title: 'Profile & Settings',
                    isSelected: false,
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const StudentProfileScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Drawer Footer: Logout & Session status
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: AppColors.borderLight, width: 1.0),
                ),
              ),
              child: Column(
                children: [
                  InkWell(
                    onTap: () {
                      Navigator.of(context).pop();
                      _showLogoutDialog(context, ref);
                    },
                    borderRadius: AppRadii.smBorderRadius,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.sm,
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.logout_rounded,
                            color: AppColors.brandRed,
                            size: 20,
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Text(
                            'Log Out',
                            style: AppTypography.titleMedium.copyWith(
                              color: AppColors.brandRed,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'SELFFITS Student Academy',
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 11,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required IconData icon,
    required IconData activeIcon,
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Material(
        color: isSelected ? AppColors.brandRedLight : Colors.transparent,
        borderRadius: AppRadii.smBorderRadius,
        child: ListTile(
          leading: Icon(
            isSelected ? activeIcon : icon,
            color: isSelected ? AppColors.brandRed : AppColors.pureBlack,
            size: 22,
          ),
          title: Text(
            title,
            style: isSelected
                ? AppTypography.titleMedium.copyWith(
                    color: AppColors.brandRed,
                    fontWeight: FontWeight.w700,
                  )
                : AppTypography.bodyLarge.copyWith(
                    color: AppColors.pureBlack,
                    fontWeight: FontWeight.w500,
                  ),
          ),
          shape: RoundedRectangleBorder(borderRadius: AppRadii.smBorderRadius),
          dense: true,
          onTap: onTap,
        ),
      ),
    );
  }
}
