import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/design_system/design_system.dart';
import '../../auth/presentation/student_login_screen.dart';
import '../../auth/providers/auth_provider.dart';
import '../../coach/presentation/coach_home_screen.dart';
import '../../student/presentation/student_home_screen.dart';

/// Account Screen for the two-tab navigation shell.
/// - When logged out: Embeds the existing StudentLoginScreen for Student/Coach authentication.
/// - When authenticated: Displays active account profile summary, role badge, dashboard shortcut, and sign-out.
class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (!authState.isAuthenticated) {
      // Guest state: Render the established StudentLoginScreen with all validation & demo pills intact
      return const StudentLoginScreen();
    }

    if (authState.isStudent) {
      return const StudentHomeScreen(initialIndex: 4);
    }

    // Authenticated state: Account summary and dashboard launch options
    final user = authState.user;
    final isStudent = authState.isStudent;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const SelffitsAppBar(
        actions: [
          Padding(
            padding: EdgeInsets.only(right: AppSpacing.lg),
            child: StatusBadge(
              label: 'Account Active',
              variant: StatusBadgeVariant.live,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.md,
            AppSpacing.lg,
            120,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.md),

              // Profile Card
              AppCard(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: isStudent
                          ? AppColors.brandBlueLight
                          : AppColors.brandRedLight,
                      child: Icon(
                        isStudent
                            ? Icons.school_rounded
                            : Icons.sports_martial_arts_rounded,
                        size: 38,
                        color: isStudent
                            ? AppColors.brandBlue
                            : AppColors.brandRed,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      user?.name ?? (isStudent ? 'Student' : 'Coach'),
                      style: AppTypography.displayMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      user?.email ?? '',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    StatusBadge(
                      label: isStudent
                          ? 'Verified Student'
                          : 'Certified Coach / Sensei',
                      variant: isStudent
                          ? StatusBadgeVariant.live
                          : StatusBadgeVariant.batch,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Live Training Access Card
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Live Training Portal',
                      style: AppTypography.headlineLarge,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      isStudent
                          ? 'Access your assigned batch, next class countdown timer, and Google Meet live video classroom.'
                          : 'Manage your assigned training batches, student rosters, and upcoming live class sessions.',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    AppButton(
                      label: isStudent
                          ? 'Open Student Live Dashboard'
                          : 'Open Coach Portal Dashboard',
                      variant: AppButtonVariant.primaryRed,
                      leadingIcon: const Icon(
                        Icons.play_circle_fill_rounded,
                        size: 20,
                        color: Colors.white,
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => isStudent
                                ? const StudentHomeScreen()
                                : const CoachHomeScreen(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Sign Out Action
              AppButton(
                label: 'Sign Out of Account',
                variant: AppButtonVariant.outline,
                leadingIcon: const Icon(
                  Icons.logout_rounded,
                  size: 18,
                  color: AppColors.textPrimary,
                ),
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                },
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}
