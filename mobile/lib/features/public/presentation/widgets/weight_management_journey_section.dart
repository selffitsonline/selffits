import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../models/public_catalog.dart';

/// Section 4: Your Weight Management Journey
/// Displays the core fitness, HIIT cardio, metabolic fat burn, and nutrition modules.
/// Uses authoritative backend-managed content from SELFFITS WebsiteSettings.
/// Features a CTA directing prospective students to explore fitness programs.
class WeightManagementJourneySection extends StatelessWidget {
  final PublicFitnessJourneySection? journeyData;
  final VoidCallback onExploreFitness;

  const WeightManagementJourneySection({
    super.key,
    this.journeyData,
    required this.onExploreFitness,
  });

  @override
  Widget build(BuildContext context) {
    final points = journeyData?.points ?? _defaultFitnessPoints();
    if (points.isEmpty) return const SizedBox.shrink();

    final badge = journeyData?.headingBadge ?? 'WEIGHT MANAGEMENT SYLLABUS';
    final title = journeyData?.headingTitle ?? 'Your Weight Management Journey';
    final subtitle =
        journeyData?.headingSubtitle ??
        'Explore the core fitness, HIIT cardio, muscle endurance, and body transformation modules covered in our Weight Management program.';

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Section Header Badge & Title
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
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
                    Icons.local_fire_department_rounded,
                    size: 14,
                    color: AppColors.brandRed,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    badge.toUpperCase(),
                    style: GoogleFonts.poppins(
                      color: AppColors.brandRed,
                      fontWeight: FontWeight.w800,
                      fontSize: 10,
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
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              subtitle,
              style: GoogleFonts.poppins(
                color: AppColors.textSecondary,
                height: 1.4,
                fontSize: 12.5,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 18),

          // Main Fitness Journey Card
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface, // Pure White #FFFFFF
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFFF97316).withValues(alpha: 0.35),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFF97316).withValues(alpha: 0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
                ...AppColors.shadowCard,
              ],
            ),
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header with Flame Icon & Track Badge
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: const Color(0xFFFB923C).withValues(alpha: 0.6),
                          width: 1.5,
                        ),
                      ),
                      child: const Icon(
                        Icons.local_fire_department_rounded,
                        color: Color(0xFFEA580C),
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Text(
                                  'Fitness & Fat Loss Track',
                                  style: GoogleFonts.poppins(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: -0.3,
                                    color: AppColors.textPrimary,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 9,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFF7ED),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: const Color(0xFFFB923C),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  'HIIT Track',
                                  style: GoogleFonts.poppins(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFFC2410C),
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 5),
                          Text(
                            'Curriculum & Daily Fitness Modules',
                            style: GoogleFonts.poppins(
                              fontSize: 12.5,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                Divider(
                  height: 1,
                  thickness: 1,
                  color: const Color(0xFFF97316).withValues(alpha: 0.18),
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEA580C),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'METABOLIC & CONDITIONING MODULES',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFFC2410C),
                        letterSpacing: 0.7,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Numbered Curriculum Modules
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  itemCount: points.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 22,
                          height: 22,
                          margin: const EdgeInsets.only(top: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF7ED),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: const Color(
                                0xFFFDBA74,
                              ).withValues(alpha: 0.6),
                              width: 0.8,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '${index + 1}',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFFC2410C),
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            points[index],
                            style: GoogleFonts.poppins(
                              fontSize: 12.5,
                              color: AppColors.textPrimary,
                              height: 1.45,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<String> _defaultFitnessPoints() {
    return const [
      'Full-body metabolic warm-up & posture alignment routines',
      'High-Intensity Interval Training (HIIT) for maximum fat burn & stamina',
      'Core strength, abdominal shred & posture stabilization drills',
      'Bodyweight resistance & progressive muscular endurance exercises',
      'Targeted waistline, thigh, and arm toning workouts',
      'Cardiovascular endurance building & active recovery techniques',
      'Nutritional guidelines, hydration habits & daily wellness tracking',
    ];
  }
}
