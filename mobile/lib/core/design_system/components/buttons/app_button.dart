import 'package:flutter/material.dart';
import '../../tokens/app_colors.dart';
import '../../tokens/app_radii.dart';
import '../../tokens/app_spacing.dart';
import '../../tokens/app_typography.dart';

enum AppButtonVariant {
  primaryRed,
  secondaryBlue,
  outline,
  ghost,
  primaryEmerald,
}

enum AppButtonSize { sm, md, lg }

/// Reusable Luxury Button adhering to Selffits Design Tokens.
/// Includes interactive micro-animations (scale on press), loading spinner,
/// and signature red/blue glowing drop-shadows.
class AppButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final bool fullWidth;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primaryRed,
    this.size = AppButtonSize.lg,
    this.isLoading = false,
    this.leadingIcon,
    this.trailingIcon,
    this.fullWidth = true,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      lowerBound: 0.0,
      upperBound: 1.0,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (widget.onPressed != null && !widget.isLoading && mounted) {
      _animController.forward();
    }
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.onPressed != null && !widget.isLoading && mounted) {
      _animController.reverse();
    }
  }

  void _onTapCancel() {
    if (widget.onPressed != null && !widget.isLoading && mounted) {
      _animController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isEnabled = widget.onPressed != null && !widget.isLoading;

    // Dimensions based on size
    final double height = switch (widget.size) {
      AppButtonSize.sm => 38.0,
      AppButtonSize.md => 46.0,
      AppButtonSize.lg => 54.0,
    };

    final TextStyle textStyle = switch (widget.size) {
      AppButtonSize.sm => AppTypography.buttonLabel.copyWith(fontSize: 13),
      AppButtonSize.md => AppTypography.buttonLabel.copyWith(fontSize: 14),
      AppButtonSize.lg => AppTypography.buttonLabel.copyWith(fontSize: 15),
    };

    final double horizontalPadding = switch (widget.size) {
      AppButtonSize.sm => AppSpacing.sm,
      AppButtonSize.md => AppSpacing.md,
      AppButtonSize.lg => AppSpacing.lg,
    };

    // Colors and decorations
    Color backgroundColor;
    Color textColor;
    Border? border;
    List<BoxShadow> shadows = [];

    switch (widget.variant) {
      case AppButtonVariant.primaryRed:
        backgroundColor = isEnabled
            ? AppColors.brandRed
            : AppColors.brandRed.withValues(alpha: 0.5);
        textColor = AppColors.textOnPrimary;
        if (isEnabled) shadows = AppColors.shadowRedButton;
        break;
      case AppButtonVariant.secondaryBlue:
        backgroundColor = isEnabled
            ? AppColors.brandBlue
            : AppColors.brandBlue.withValues(alpha: 0.5);
        textColor = AppColors.textOnPrimary;
        if (isEnabled) shadows = AppColors.shadowBlueButton;
        break;
      case AppButtonVariant.outline:
        backgroundColor = Colors.transparent;
        textColor = isEnabled ? AppColors.brandBlue : AppColors.textTertiary;
        border = Border.all(
          color: isEnabled ? AppColors.borderLight : AppColors.borderSubtle,
          width: 1.5,
        );
        break;
      case AppButtonVariant.ghost:
        backgroundColor = Colors.transparent;
        textColor = isEnabled ? AppColors.textPrimary : AppColors.textTertiary;
        break;
      case AppButtonVariant.primaryEmerald:
        backgroundColor = isEnabled
            ? AppColors.liveEmerald
            : AppColors.liveEmerald.withValues(alpha: 0.5);
        textColor = Colors.white;
        if (isEnabled) {
          shadows = [
            BoxShadow(
              color: AppColors.liveEmerald.withValues(alpha: 0.3),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ];
        }
        break;
    }

    Widget content = Row(
      mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
        ] else if (widget.leadingIcon != null) ...[
          widget.leadingIcon!,
          const SizedBox(width: AppSpacing.xs),
        ],
        Flexible(
          child: Text(
            widget.label,
            style: textStyle.copyWith(color: textColor),
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
            textAlign: TextAlign.center,
          ),
        ),
        if (widget.trailingIcon != null && !widget.isLoading) ...[
          const SizedBox(width: AppSpacing.xs),
          widget.trailingIcon!,
        ],
      ],
    );

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) =>
          Transform.scale(scale: _scaleAnimation.value, child: child),
      child: GestureDetector(
        onTapDown: _onTapDown,
        onTapUp: _onTapUp,
        onTapCancel: _onTapCancel,
        onTap: isEnabled ? widget.onPressed : null,
        child: Container(
          height: height,
          width: widget.fullWidth ? double.infinity : null,
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: AppRadii.mdBorderRadius,
            border: border,
            boxShadow: shadows,
          ),
          alignment: Alignment.center,
          child: content,
        ),
      ),
    );
  }
}
