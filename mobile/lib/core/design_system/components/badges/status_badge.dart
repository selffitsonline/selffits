import 'package:flutter/material.dart';
import '../../tokens/app_colors.dart';
import '../../tokens/app_radii.dart';
import '../../tokens/app_spacing.dart';
import '../../tokens/app_typography.dart';

enum StatusBadgeVariant { live, batch, alert, error, neutral }

/// Reusable Luxury Status Badge & Tag pill for classes, batches, and system alerts.
class StatusBadge extends StatefulWidget {
  final String label;
  final StatusBadgeVariant variant;
  final bool showLivePulse;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    this.variant = StatusBadgeVariant.neutral,
    this.showLivePulse = false,
    this.icon,
  });

  @override
  State<StatusBadge> createState() => _StatusBadgeState();
}

class _StatusBadgeState extends State<StatusBadge>
    with SingleTickerProviderStateMixin {
  AnimationController? _pulseController;
  Animation<double>? _pulseAnimation;

  @override
  void initState() {
    super.initState();
    if (widget.showLivePulse || widget.variant == StatusBadgeVariant.live) {
      _pulseController = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 1400),
      )..repeat(reverse: true);
      _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(
        CurvedAnimation(parent: _pulseController!, curve: Curves.easeInOut),
      );
    }
  }

  @override
  void dispose() {
    _pulseController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    Color borderColor;

    switch (widget.variant) {
      case StatusBadgeVariant.live:
        backgroundColor = AppColors.liveEmeraldLight;
        textColor = AppColors.liveEmerald;
        borderColor = AppColors.liveEmerald.withValues(alpha: 0.3);
        break;
      case StatusBadgeVariant.batch:
        backgroundColor = AppColors.brandBlueLight;
        textColor = AppColors.brandBlue;
        borderColor = AppColors.brandBlue.withValues(alpha: 0.25);
        break;
      case StatusBadgeVariant.alert:
        backgroundColor = AppColors.warningAmberLight;
        textColor = AppColors.warningAmber;
        borderColor = AppColors.warningAmber.withValues(alpha: 0.3);
        break;
      case StatusBadgeVariant.error:
        backgroundColor = AppColors.errorRoseLight;
        textColor = AppColors.errorRose;
        borderColor = AppColors.errorRose.withValues(alpha: 0.3);
        break;
      case StatusBadgeVariant.neutral:
        backgroundColor = AppColors.surfaceTertiary;
        textColor = AppColors.textSecondary;
        borderColor = AppColors.borderLight;
        break;
    }

    final bool isPulsing = _pulseAnimation != null;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: AppRadii.pillBorderRadius,
        border: Border.all(color: borderColor, width: 1.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (isPulsing) ...[
            FadeTransition(
              opacity: _pulseAnimation!,
              child: Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: AppColors.liveEmerald,
                  shape: BoxShape.circle,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
          ] else if (widget.icon != null) ...[
            Icon(widget.icon, size: 12, color: textColor),
            const SizedBox(width: AppSpacing.xxs),
          ],
          Text(
            widget.label.toUpperCase(),
            style: AppTypography.labelSmall.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }
}
