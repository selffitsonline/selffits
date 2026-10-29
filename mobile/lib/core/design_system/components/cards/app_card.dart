import 'package:flutter/material.dart';
import '../../tokens/app_colors.dart';
import '../../tokens/app_radii.dart';
import '../../tokens/app_spacing.dart';

/// Reusable Luxury Card component for the SELFFITS Luxury White design system.
/// Features a pure white or soft alabaster surface, 20px border radius, hair-thin 1px border,
/// and soft diffused ambient shadows.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? backgroundColor;
  final Border? border;
  final BorderRadius? borderRadius;
  final List<BoxShadow>? boxShadow;
  final VoidCallback? onTap;

  const AppCard({
    super.key,
    required this.child,
    this.padding = AppSpacing.cardPadding,
    this.backgroundColor,
    this.border,
    this.borderRadius,
    this.boxShadow,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBorderRadius = borderRadius ?? AppRadii.lgBorderRadius;
    final effectiveBackgroundColor = backgroundColor ?? AppColors.surface;
    final effectiveBorder =
        border ?? Border.all(color: AppColors.borderLight, width: 1.0);
    final effectiveShadow = boxShadow ?? AppColors.shadowCard;

    Widget cardWidget = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: effectiveBackgroundColor,
        borderRadius: effectiveBorderRadius,
        border: effectiveBorder,
        boxShadow: effectiveShadow,
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        borderRadius: effectiveBorderRadius,
        child: InkWell(
          onTap: onTap,
          borderRadius: effectiveBorderRadius,
          splashColor: AppColors.brandBlueLight,
          highlightColor: AppColors.surfaceSecondary,
          child: cardWidget,
        ),
      );
    }

    return cardWidget;
  }
}
