import 'package:flutter/material.dart';
import '../core/design_system/design_system.dart';

/// Interactive Foundation Showcase Screen for Module 1.
/// Demonstrates the approved Luxury White Design System tokens, typography,
/// live class card, reusable buttons, inputs, and uncoloured brand logo.
class FoundationShowcaseScreen extends StatefulWidget {
  const FoundationShowcaseScreen({super.key});

  @override
  State<FoundationShowcaseScreen> createState() =>
      _FoundationShowcaseScreenState();
}

class _FoundationShowcaseScreenState extends State<FoundationShowcaseScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isPrimaryLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _simulateAction(String actionName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '$actionName triggered successfully',
          style: AppTypography.bodyMedium.copyWith(
            color: AppColors.textOnPrimary,
          ),
        ),
        backgroundColor: AppColors.textPrimary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: AppRadii.smBorderRadius),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const SelffitsLogo(
          height: 24,
          showText: false,
          fit: BoxFit.contain,
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: AppSpacing.lg),
            child: StatusBadge(
              label: 'Luxury White v1.0',
              variant: StatusBadgeVariant.batch,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: AppSpacing.screenPadding,
          children: [
            // Welcome & Subtitle
            Text('Design System Foundation', style: AppTypography.displayLarge),
            const SizedBox(height: AppSpacing.xxs),
            Text(
              'Module 1: Isolated Flutter Shell & Luxury White Theme',
              style: AppTypography.bodyLarge,
            ),
            const SizedBox(height: AppSpacing.xl),

            // 1. Upcoming Live Class Hero Card (Section 5.1 of specification)
            Text(
              'HERO COMPONENT',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.brandRed,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges Row
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      StatusBadge(
                        label: 'Live in 15 Mins',
                        variant: StatusBadgeVariant.live,
                        showLivePulse: true,
                      ),
                      StatusBadge(
                        label: 'SF-B1-2026',
                        variant: StatusBadgeVariant.batch,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Class Name & Time
                  Text(
                    'Adults Karate — 1st Batch',
                    style: AppTypography.headlineLarge,
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_month_outlined,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'Today • 05:15 PM to 06:00 PM (GMT)',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Assigned Coach
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
                          size: 16,
                          color: AppColors.brandBlue,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            'Sensei Sujith John (Black Belt 4th Dan)',
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

                  // Join Live Class CTA Button
                  AppButton(
                    label: 'JOIN LIVE CLASS (GOOGLE MEET)',
                    variant: AppButtonVariant.primaryRed,
                    leadingIcon: const Icon(
                      Icons.play_circle_fill_rounded,
                      size: 20,
                      color: AppColors.textOnPrimary,
                    ),
                    trailingIcon: const Icon(
                      Icons.open_in_new_rounded,
                      size: 16,
                      color: AppColors.textOnPrimary,
                    ),
                    onPressed: () => _simulateAction('Join Live Class'),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Card Footer Details
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Sun & Wed Schedule',
                        style: AppTypography.bodySmall,
                      ),
                      Text(
                        '6 / 8 Attending',
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
            const SizedBox(height: AppSpacing.xxl),

            // 2. Form Inputs Showcase
            Text(
              'FORM CONTROLS',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.brandBlue,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            AppCard(
              backgroundColor: AppColors.surfaceSecondary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppTextField(
                    label: 'Email Address',
                    hintText: 'student@example.com',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: const Icon(
                      Icons.email_outlined,
                      size: 18,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    label: 'Password',
                    hintText: '••••••••••••',
                    controller: _passwordController,
                    obscureText: true,
                    prefixIcon: const Icon(
                      Icons.lock_outline,
                      size: 18,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: _isPrimaryLoading
                        ? 'Authenticating...'
                        : 'Sign In to Portal',
                    variant: AppButtonVariant.secondaryBlue,
                    isLoading: _isPrimaryLoading,
                    onPressed: () async {
                      setState(() => _isPrimaryLoading = true);
                      await Future.delayed(const Duration(milliseconds: 1000));
                      if (mounted) {
                        setState(() => _isPrimaryLoading = false);
                        _simulateAction('Sign In');
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),

            // 3. Status Badges & Chips
            Text(
              'STATUS & BADGES',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            const Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: [
                StatusBadge(
                  label: 'Live Class',
                  variant: StatusBadgeVariant.live,
                  showLivePulse: true,
                ),
                StatusBadge(
                  label: 'Assigned Batch',
                  variant: StatusBadgeVariant.batch,
                ),
                StatusBadge(
                  label: 'Exam Notice',
                  variant: StatusBadgeVariant.alert,
                  icon: Icons.info_outline,
                ),
                StatusBadge(
                  label: 'Payment Pending',
                  variant: StatusBadgeVariant.error,
                ),
                StatusBadge(
                  label: 'Archived',
                  variant: StatusBadgeVariant.neutral,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xxl),

            // 4. Button Variants Showcase
            Text(
              'BUTTON SYSTEM',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Column(
              children: [
                AppButton(
                  label: 'Primary Red Button',
                  variant: AppButtonVariant.primaryRed,
                  onPressed: () => _simulateAction('Primary Red'),
                ),
                const SizedBox(height: AppSpacing.sm),
                AppButton(
                  label: 'Secondary Blue Button',
                  variant: AppButtonVariant.secondaryBlue,
                  onPressed: () => _simulateAction('Secondary Blue'),
                ),
                const SizedBox(height: AppSpacing.sm),
                AppButton(
                  label: 'Outline Button',
                  variant: AppButtonVariant.outline,
                  onPressed: () => _simulateAction('Outline'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xxxl),
          ],
        ),
      ),
    );
  }
}
