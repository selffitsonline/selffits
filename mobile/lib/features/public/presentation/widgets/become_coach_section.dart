import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/utils/app_url_launcher.dart';
import '../../models/public_catalog.dart';

/// Promotional Section: Become a SELFFITS Coach
/// Placed directly below the "Meet Our Master Coaches" section on the Home screen.
/// Follows the website's dark charcoal luxury aesthetic:
/// - Dark charcoal background: #14161D
/// - Subtle translucent white border (15% opacity)
/// - Red accent glow / blur ambient highlight
/// - Instructor recruitment badge with award icon
/// - Bold white headline: "BECOME A SELFFITS COACH"
/// - Refined light grey supporting text
/// - Prominent red gradient CTA button with arrow icon: "BECOME A COACH →"
/// - Reuses authoritative admin-managed content and visibility from the backend.
class BecomeCoachSection extends StatelessWidget {
  final PublicBecomeCoachSection? recruitmentData;

  const BecomeCoachSection({super.key, this.recruitmentData});

  Future<void> _handleBecomeCoachPressed(BuildContext context) async {
    final rawLink = recruitmentData?.buttonLink.trim().isNotEmpty == true
        ? recruitmentData!.buttonLink.trim()
        : '/become-coach';

    final String targetUrl;
    if (rawLink.startsWith('http://') || rawLink.startsWith('https://')) {
      targetUrl = rawLink;
    } else {
      final base = ApiEndpoints.baseUrl.replaceAll(RegExp(r'/+$'), '');
      final path = rawLink.startsWith('/') ? rawLink : '/$rawLink';
      targetUrl = '$base$path';
    }

    await AppUrlLauncher.launch(
      context,
      targetUrl,
      fallbackMessage: 'Could not open recruitment page ($targetUrl).',
    );
  }

  @override
  Widget build(BuildContext context) {
    // If explicitly disabled by administrator, hide the section entirely
    if (recruitmentData != null && !recruitmentData!.isEnabled) {
      return const SizedBox.shrink();
    }

    final badgeText = recruitmentData?.badgeText.trim().isNotEmpty == true
        ? recruitmentData!.badgeText
        : 'Instructor Recruitment';

    final heading = recruitmentData?.heading.trim().isNotEmpty == true
        ? recruitmentData!.heading
        : 'BECOME A SELFFITS COACH';

    final description = recruitmentData?.description.trim().isNotEmpty == true
        ? recruitmentData!.description
        : 'Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.';

    final buttonText = recruitmentData?.buttonText.trim().isNotEmpty == true
        ? recruitmentData!.buttonText
        : 'BECOME A COACH';

    return Container(
      margin: const EdgeInsets.only(top: 8, bottom: 28),
      decoration: BoxDecoration(
        color: const Color(
          0xFF14161D,
        ), // Dark charcoal background matching website
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.15),
          width: 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: AppColors.brandRed.withValues(alpha: 0.08),
            blurRadius: 32,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Ambient Radial Glow Highlights (subtle red and blue aura matching website)
            Positioned(
              top: -40,
              right: -40,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.brandRed.withValues(alpha: 0.22),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: -40,
              left: -40,
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      const Color(0xFF0080FF).withValues(alpha: 0.14),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Card Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // 1. Instructor Recruitment Pill Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.brandRed.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.brandRed.withValues(alpha: 0.35),
                        width: 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.military_tech_rounded,
                          size: 14,
                          color: AppColors.brandRed,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          badgeText.toUpperCase(),
                          style: GoogleFonts.poppins(
                            color: AppColors.brandRed,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 2. White Bold Heading
                  Text(
                    heading.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.6,
                      height: 1.2,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // 3. Supporting Description in Light Grey
                  Text(
                    description,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      color: const Color(
                        0xFFD1D5DB,
                      ), // Light grey text matching website
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      height: 1.55,
                    ),
                  ),

                  const SizedBox(height: 22),

                  // 4. Prominent Red "BECOME A COACH →" CTA Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFE50914), Color(0xFFFF1E27)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(
                              0xFFE50914,
                            ).withValues(alpha: 0.38),
                            blurRadius: 18,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () => _handleBecomeCoachPressed(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              buttonText.toUpperCase(),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(
                              Icons.arrow_forward_rounded,
                              size: 18,
                              color: Colors.white,
                            ),
                          ],
                        ),
                      ),
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
}
