import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../models/public_catalog.dart';

/// Section 2: Explore Our Programs
/// Displays active programs and categories provided by the authoritative backend.
/// Supports Mixed Martial Arts (Kids, Adults, Ladies) and Fitness & Weight Management.
/// Allows prospective students to select a program and seamlessly continue to the schedule & pricing flow.
class ExploreProgramsSection extends StatelessWidget {
  final PublicFeaturedProgramsSection? sectionData;
  final void Function(String category, String audience) onSelectProgram;

  const ExploreProgramsSection({
    super.key,
    this.sectionData,
    required this.onSelectProgram,
  });

  @override
  Widget build(BuildContext context) {
    // Only display real server-provided program items; never render hardcoded fallback prices
    final programs = sectionData?.items ?? const [];
    if (programs.isEmpty) return const SizedBox.shrink();

    final badge = sectionData?.headingBadge ?? 'TRAINING PATHWAYS';
    final title = sectionData?.headingTitle ?? 'Explore Our Programs';
    final subtitle =
        sectionData?.headingSubtitle ??
        'Structured live virtual training paths with customizable weekly schedule frequencies from 1 to 5 Days / Week.';

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Section Header
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.brandRedLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.brandRed.withValues(alpha: 0.25),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.route_outlined,
                    size: 13,
                    color: AppColors.brandRed,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    badge.toUpperCase(),
                    style: GoogleFonts.poppins(
                      color: AppColors.brandRed,
                      fontWeight: FontWeight.w800,
                      fontSize: 9.5,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.w800,
              fontSize: 20,
              letterSpacing: -0.4,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              subtitle,
              style: GoogleFonts.poppins(
                color: AppColors.textSecondary,
                height: 1.4,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),

          // Horizontal scrollable card carousel
          SizedBox(
            height: 280,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: programs.length,
              separatorBuilder: (_, _) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final prog = programs[index];
                return _buildProgramCard(context, prog);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgramCard(BuildContext context, PublicFeaturedProgram prog) {
    final isLadies =
        prog.category.toUpperCase().contains('LADIES') ||
        prog.targetAudience == 'ladies';
    final isFitness =
        prog.targetCategory == 'fitness' ||
        prog.category.toUpperCase().contains('FITNESS');

    final Color badgeBg = isLadies
        ? const Color(0xFFFCE7F3)
        : isFitness
        ? const Color(0xFFECFDF5)
        : AppColors.brandRedLight;
    final Color badgeText = isLadies
        ? const Color(0xFFDB2777)
        : isFitness
        ? const Color(0xFF059669)
        : AppColors.brandRed;
    final Color badgeBorder = isLadies
        ? const Color(0xFFF472B6)
        : isFitness
        ? const Color(0xFF34D399)
        : AppColors.brandRed.withValues(alpha: 0.3);

    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: AppColors.shadowCard,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () =>
              onSelectProgram(prog.targetCategory, prog.targetAudience),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category Badge Pill
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3.5,
                      ),
                      decoration: BoxDecoration(
                        color: badgeBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: badgeBorder),
                      ),
                      child: Text(
                        prog.category.toUpperCase(),
                        style: GoogleFonts.poppins(
                          color: badgeText,
                          fontWeight: FontWeight.w800,
                          fontSize: 9.5,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Program Title
                    Text(
                      prog.title,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.25,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),

                    // Description
                    Text(
                      prog.description,
                      style: GoogleFonts.poppins(
                        fontSize: 11.5,
                        color: AppColors.textSecondary,
                        height: 1.4,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),

                    // Meta Chips
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        _buildMetaChip(Icons.videocam_outlined, prog.classes),
                        _buildMetaChip(
                          Icons.calendar_today_outlined,
                          prog.duration,
                        ),
                      ],
                    ),
                  ],
                ),

                // Bottom row: Starting Price + CTA Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Starts at',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: AppColors.textTertiary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '\$${prog.priceStartsUSD} / mo',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.brandRed,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.brandRed,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Select',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward_rounded,
                            size: 13,
                            color: Colors.white,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetaChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.poppins(
              color: AppColors.textSecondary,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
