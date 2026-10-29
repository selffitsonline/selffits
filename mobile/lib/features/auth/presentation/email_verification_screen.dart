import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

/// Screen displayed immediately following student registration.
/// Strictly enforces:
/// 1. Student remains unauthenticated until verified.
/// 2. Clear notice that email verification is compulsory.
/// 3. Clear 24-hour expiration notice.
/// 4. User-friendly display of any upstream email delivery warnings.
class EmailVerificationScreen extends StatelessWidget {
  final String email;
  final String? emailDeliveryWarning;
  final VoidCallback? onGoToLogin;

  const EmailVerificationScreen({
    super.key,
    required this.email,
    this.emailDeliveryWarning,
    this.onGoToLogin,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.screenPadding,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: AppSpacing.lg),

                  // Brand Logo
                  const Center(
                    child: SelffitsLogo(
                      height: 42,
                      showText: false,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Verification Card
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Center(
                          child: Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: AppColors.liveEmeraldLight,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.liveEmerald.withValues(
                                  alpha: 0.35,
                                ),
                                width: 2.0,
                              ),
                            ),
                            child: const Icon(
                              Icons.mark_email_read_outlined,
                              color: AppColors.liveEmerald,
                              size: 34,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),

                        Text(
                          'VERIFY YOUR EMAIL ADDRESS',
                          style: AppTypography.displayMedium.copyWith(
                            fontSize: 20,
                            letterSpacing: 0.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.sm),

                        Text.rich(
                          TextSpan(
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                              height: 1.5,
                            ),
                            children: [
                              const TextSpan(
                                text:
                                    'We have dispatched a verification link to:\n',
                              ),
                              TextSpan(
                                text: email,
                                style: const TextStyle(
                                  color: AppColors.brandBlue,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.lg),

                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            borderRadius: AppRadii.smBorderRadius,
                            border: Border.all(
                              color: AppColors.borderSubtle,
                              width: 1.0,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Compulsory Account Activation',
                                style: AppTypography.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.xxs),
                              Text(
                                'Email verification is required before you can access the student portal and view your class schedule.',
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.sm),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.access_time_rounded,
                                    size: 15,
                                    color: AppColors.warningAmber,
                                  ),
                                  const SizedBox(width: AppSpacing.xxs),
                                  Expanded(
                                    child: Text(
                                      'This verification link expires in 24 hours.',
                                      style: AppTypography.bodySmall.copyWith(
                                        color: AppColors.warningAmber,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // Optional upstream delivery warning
                        if (emailDeliveryWarning != null &&
                            emailDeliveryWarning!.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.md),
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            decoration: BoxDecoration(
                              color: AppColors.warningAmberLight,
                              borderRadius: AppRadii.smBorderRadius,
                              border: Border.all(
                                color: AppColors.warningAmber.withValues(
                                  alpha: 0.3,
                                ),
                                width: 1.0,
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(
                                  Icons.info_outline_rounded,
                                  size: 16,
                                  color: AppColors.warningAmber,
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: Text(
                                    emailDeliveryWarning!,
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.warningAmber,
                                      height: 1.35,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: AppSpacing.xl),

                        AppButton(
                          label: 'Go to Sign In',
                          variant: AppButtonVariant.primaryRed,
                          onPressed: () {
                            if (onGoToLogin != null) {
                              onGoToLogin!();
                            } else {
                              Navigator.of(
                                context,
                              ).popUntil((route) => route.isFirst);
                            }
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
