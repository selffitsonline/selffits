import 'package:flutter/material.dart';
import '../../tokens/app_colors.dart';
import '../../tokens/app_radii.dart';
import '../../tokens/app_typography.dart';

/// Renders the authentic, uncoloured Selffits logo from the original brand assets.
/// Preserves original red and blue colors without modification or tinting.
class SelffitsLogo extends StatelessWidget {
  final double height;
  final double? width;
  final bool showText;
  final BoxFit fit;

  final String assetPath;

  const SelffitsLogo({
    super.key,
    this.height = 40.0,
    this.width,
    this.showText = false,
    this.fit = BoxFit.contain,
    this.assetPath = 'assets/branding/Logo-selffits.png',
  });

  @override
  Widget build(BuildContext context) {
    final Widget logoImage = Image.asset(
      assetPath,
      height: height,
      width: width,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        // Fallback to legacy logo.jpg if Logo-selffits.png is loading or missing
        return Image.asset(
          'assets/branding/logo.jpg',
          height: height,
          width: width,
          fit: fit,
          errorBuilder: (context, error2, stackTrace2) {
            // Graceful vector fallback if asset is loading or missing
            return Container(
              height: height,
              width: width ?? height,
              decoration: BoxDecoration(
                color: AppColors.surfaceSecondary,
                borderRadius: AppRadii.smBorderRadius,
                border: Border.all(color: AppColors.borderLight),
              ),
              alignment: Alignment.center,
              child: Text(
                'SF',
                style: AppTypography.titleMedium.copyWith(
                  color: AppColors.brandRed,
                  fontWeight: FontWeight.w800,
                ),
              ),
            );
          },
        );
      },
    );

    return logoImage;
  }
}
