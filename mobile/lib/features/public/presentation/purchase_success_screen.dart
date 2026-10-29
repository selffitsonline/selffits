import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/design_system/design_system.dart';
import '../../student/providers/student_dashboard_provider.dart';
import '../../student/repositories/student_repository.dart';
import '../providers/catalog_provider.dart';
import 'public_main_shell.dart';

/// Dedicated Full-Screen Purchase Successful Screen.
/// Built with the approved SELFFITS Luxury White Design System.
/// Features:
/// - Polished scale & bounce checkmark animation with subtle celebration glow.
/// - Order receipt box displaying the purchased course name, tier, discipline, and schedule.
/// - Visual 10-second countdown indicator mirroring the website (/checkout/success).
/// - Instant "Go to Student Dashboard Now" button that refreshes student records.
class PurchaseSuccessScreen extends ConsumerStatefulWidget {
  final EnrollmentResult result;

  const PurchaseSuccessScreen({super.key, required this.result});

  @override
  ConsumerState<PurchaseSuccessScreen> createState() =>
      _PurchaseSuccessScreenState();
}

class _PurchaseSuccessScreenState extends ConsumerState<PurchaseSuccessScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _fadeAnimation;
  int _countdown = 10;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.elasticOut,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );

    _animController.forward();

    // 10-Second Auto-Redirect Countdown (mirrors the website's checkout success page)
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_countdown <= 1) {
        timer.cancel();
        _navigateToDashboard();
      } else {
        setState(() {
          _countdown--;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  void _navigateToDashboard() {
    _timer?.cancel();
    // Clear pending checkout state
    ref.read(pendingCheckoutProvider.notifier).state = false;
    // Refresh student dashboard data from authoritative backend
    ref.read(studentDashboardProvider.notifier).loadDashboard();
    // Navigate cleanly to student portal
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute<void>(
        builder: (_) => const PublicMainShell(initialIndex: 1),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final enrollment = widget.result;
    final programTitle =
        enrollment.programTitle ?? 'Live Virtual Training Academy';
    final tierName =
        enrollment.tierName ??
        '${enrollment.daysPerWeek ?? 3} Days / Week Plan';
    final paidAmount = enrollment.amountPaid != null
        ? '\$${enrollment.amountPaid!.toStringAsFixed(0)} ${enrollment.currency ?? 'USD'}'
        : 'Confirmed';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _navigateToDashboard();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: const SelffitsAppBar(
          automaticallyImplyLeading: false,
          actions: [],
        ),
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Animated Celebration Badge with Checkmark
                    Center(
                      child: ScaleTransition(
                        scale: _scaleAnimation,
                        child: Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFF10B981),
                              width: 3,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(
                                  0xFF10B981,
                                ).withValues(alpha: 0.25),
                                blurRadius: 24,
                                spreadRadius: 4,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.check_rounded,
                              size: 52,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Confirmation Badge Pill
                    Center(
                      child: FadeTransition(
                        opacity: _fadeAnimation,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: const Color(
                                0xFF10B981,
                              ).withValues(alpha: 0.35),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.auto_awesome_rounded,
                                size: 14,
                                color: Color(0xFF10B981),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Enrollment Confirmed!',
                                style: GoogleFonts.poppins(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF15803D),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Main Congratulations Heading
                    Text(
                      'Thank You for Your Enrollment! 🎉',
                      style: GoogleFonts.poppins(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),

                    // Subtitle message
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Thank you! Our team will contact you soon. Welcome to SELFFITS Academy! Your transaction was successful and your live virtual classroom access has been activated.',
                        style: GoogleFonts.poppins(
                          fontSize: 12.5,
                          height: 1.45,
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Order Receipt Card (matches web order receipt box)
                    AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.receipt_long_rounded,
                                size: 18,
                                color: AppColors.brandBlue,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'ENROLLMENT RECEIPT',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.brandBlue,
                                  letterSpacing: 0.6,
                                ),
                              ),
                              const Spacer(),
                              const StatusBadge(
                                label: 'ACTIVE',
                                variant: StatusBadgeVariant.live,
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          const Divider(
                            height: 1,
                            color: AppColors.borderLight,
                          ),
                          const SizedBox(height: 14),

                          // Enrolled Program
                          _buildReceiptRow(
                            'Enrolled Program',
                            programTitle,
                            isBold: true,
                          ),
                          const SizedBox(height: 8),

                          // Membership Tier
                          _buildReceiptRow('Membership Plan', tierName),
                          const SizedBox(height: 8),

                          // Martial Arts Discipline
                          if (enrollment.martialArtsType != null) ...[
                            _buildReceiptRow(
                              'Discipline',
                              enrollment.martialArtsType!,
                              valueColor: AppColors.brandRed,
                            ),
                            const SizedBox(height: 8),
                          ],

                          // Schedule Days
                          if (enrollment.selectedDays.isNotEmpty) ...[
                            _buildReceiptRow(
                              'Training Days',
                              enrollment.selectedDays.join(', '),
                            ),
                            const SizedBox(height: 8),
                          ],

                          // Batch Timing
                          if (enrollment.classTiming != null) ...[
                            _buildReceiptRow(
                              'Batch Timing',
                              enrollment.classTiming!,
                            ),
                            const SizedBox(height: 8),
                          ],

                          // Amount Paid
                          _buildReceiptRow(
                            'Amount Paid',
                            paidAmount,
                            valueColor: const Color(0xFF15803D),
                            isBold: true,
                          ),
                          const SizedBox(height: 8),

                          // Live Platform
                          _buildReceiptRow(
                            'Live Platform',
                            'Google Meet & Zoom',
                            valueColor: AppColors.brandBlue,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Auto-Redirect Banner
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(
                            0xFF10B981,
                          ).withValues(alpha: 0.35),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Redirecting to Student Dashboard in $_countdown seconds...',
                              style: GoogleFonts.poppins(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF15803D),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Primary Action Button
                    AppButton(
                      label: 'Go to Student Dashboard Now',
                      variant: AppButtonVariant.primaryRed,
                      size: AppButtonSize.lg,
                      trailingIcon: const Icon(
                        Icons.arrow_forward_rounded,
                        size: 18,
                        color: Colors.white,
                      ),
                      onPressed: _navigateToDashboard,
                    ),
                    const SizedBox(height: 14),

                    // Security Footer Note
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        const Icon(
                          Icons.verified_user_rounded,
                          size: 14,
                          color: Color(0xFF10B981),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Instant Access • Verified Certificate Track',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: AppColors.textTertiary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(
    String label,
    String value, {
    Color? valueColor,
    bool isBold = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 11.5,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: valueColor ?? AppColors.textPrimary,
              fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
