import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../models/public_catalog.dart';

/// Section 3: Your Martial Arts Learning Journey
/// Interactive Belt Progression Syllabus (White -> Yellow -> Green -> Blue -> Brown -> Black).
/// Displays authoritative techniques and curriculum topics for each official belt level.
/// Features a CTA directing users to start training martial arts in the schedule builder.
class MartialArtsJourneySection extends StatefulWidget {
  final PublicBeltSyllabusSection? syllabusData;
  final VoidCallback onExploreMartialArts;

  const MartialArtsJourneySection({
    super.key,
    this.syllabusData,
    required this.onExploreMartialArts,
  });

  @override
  State<MartialArtsJourneySection> createState() =>
      _MartialArtsJourneySectionState();
}

class _MartialArtsJourneySectionState extends State<MartialArtsJourneySection> {
  late String _selectedBeltId;

  @override
  void initState() {
    super.initState();
    final belts = widget.syllabusData?.belts ?? _defaultBelts();
    _selectedBeltId = belts.isNotEmpty ? belts.first.id : 'white_belt';
  }

  @override
  Widget build(BuildContext context) {
    final belts = widget.syllabusData?.belts ?? _defaultBelts();
    if (belts.isEmpty) return const SizedBox.shrink();

    final activeBelts = belts.where((b) => b.isEnabled).toList();
    final currentBelt = activeBelts.firstWhere(
      (b) => b.id == _selectedBeltId,
      orElse: () => activeBelts.first,
    );

    final badge =
        widget.syllabusData?.headingBadge ?? 'BELT PROGRESSION SYLLABUS';
    final title =
        widget.syllabusData?.headingTitle ??
        'Your Martial Arts Learning Journey';
    final subtitle =
        widget.syllabusData?.headingSubtitle ??
        'Explore the skills, techniques, and syllabus covered at each belt progression rank from White Belt to Black Belt.';

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Section Header Badge
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
                    Icons.military_tech_rounded,
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

          // Belt Tabs Selector (Horizontal scrollable pill list with genuine belt colors)
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: activeBelts.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final belt = activeBelts[index];
                final isSelected = belt.id == currentBelt.id;
                final style = _getBeltColorTheme(belt.name);

                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedBeltId = belt.id;
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 9,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected ? style.bg : style.unselectedBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected
                              ? style.border
                              : style.unselectedBorder,
                          width: isSelected ? 1.5 : 1,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: style.accent.withValues(alpha: 0.18),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.workspace_premium_rounded,
                            size: 15,
                            color: isSelected
                                ? style.accent
                                : style.accent.withValues(alpha: 0.75),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            belt.name,
                            style: GoogleFonts.poppins(
                              color: isSelected
                                  ? style.text
                                  : style.text.withValues(alpha: 0.9),
                              fontWeight: isSelected
                                  ? FontWeight.w800
                                  : FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),

          // Selected Belt Detail Card
          _buildBeltDetailCard(currentBelt),
        ],
      ),
    );
  }

  Widget _buildBeltDetailCard(PublicBeltItem belt) {
    final style = _getBeltColorTheme(belt.name);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: style.border.withValues(alpha: 0.45),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: style.primary.withValues(alpha: 0.08),
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
          // Belt Header with coordinated rank indicator
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: style.bg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: style.border, width: 1.5),
                ),
                child: Icon(
                  Icons.workspace_premium_rounded,
                  color: style.accent,
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
                            belt.name,
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
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
                            color: style.bg,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: style.border, width: 1),
                          ),
                          child: Text(
                            'Official Rank',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: style.text,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    _buildBeltSubtitle(belt.subtitle),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          Divider(
            height: 1,
            thickness: 1,
            color: style.border.withValues(alpha: 0.2),
          ),
          const SizedBox(height: 16),

          // Numbered Syllabus Items
          if (belt.syllabus.isNotEmpty) ...[
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: style.accent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'CURRICULUM & TECHNIQUES',
                  style: GoogleFonts.poppins(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w800,
                    color: style.text,
                    letterSpacing: 0.7,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: EdgeInsets.zero,
              itemCount: belt.syllabus.length,
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
                        color: style.numberBg,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: style.border.withValues(alpha: 0.5),
                          width: 0.8,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${index + 1}',
                        style: GoogleFonts.poppins(
                          color: style.numberText,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        belt.syllabus[index],
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
          ] else ...[
            Text(
              'Curriculum details available in student dojo dashboard.',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: AppColors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBeltSubtitle(String subtitle) {
    final cleanSub = subtitle.trim();
    String firstLine = cleanSub;
    String? secondLine;

    final parenIndex = cleanSub.indexOf('(');
    if (parenIndex > 0) {
      firstLine = cleanSub.substring(0, parenIndex).trim();
      secondLine = cleanSub
          .substring(parenIndex)
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();
    } else if (cleanSub.contains('\n')) {
      final parts = cleanSub.split('\n');
      firstLine = parts[0].trim();
      secondLine = parts.sublist(1).join(' ').trim();
    }

    if (secondLine != null && secondLine.isNotEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            firstLine,
            style: GoogleFonts.poppins(
              fontSize: 12.5,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            secondLine,
            style: GoogleFonts.poppins(
              fontSize: 12.0,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
              height: 1.3,
            ),
          ),
        ],
      );
    }

    return Text(
      firstLine,
      style: GoogleFonts.poppins(
        fontSize: 12.5,
        color: AppColors.textSecondary,
        fontWeight: FontWeight.w500,
        height: 1.35,
      ),
    );
  }

  _BeltColorTheme _getBeltColorTheme(String name) {
    final n = name.toLowerCase();
    if (n.contains('yellow')) {
      return const _BeltColorTheme(
        primary: Color(0xFFEAB308),
        accent: Color(0xFFCA8A04),
        bg: Color(0xFFFEF9C3),
        unselectedBg: Color(0xFFFEFCE8),
        border: Color(0xFFFACC15),
        unselectedBorder: Color(0xFFFDE047),
        text: Color(0xFF854D0E),
        numberBg: Color(0xFFFEF08A),
        numberText: Color(0xFF854D0E),
      );
    } else if (n.contains('orange')) {
      return const _BeltColorTheme(
        primary: Color(0xFFF97316),
        accent: Color(0xFFEA580C),
        bg: Color(0xFFFFEDD5),
        unselectedBg: Color(0xFFFFF7ED),
        border: Color(0xFFFB923C),
        unselectedBorder: Color(0xFFFDBA74),
        text: Color(0xFF9A3412),
        numberBg: Color(0xFFFED7AA),
        numberText: Color(0xFF9A3412),
      );
    } else if (n.contains('green')) {
      return const _BeltColorTheme(
        primary: Color(0xFF10B981),
        accent: Color(0xFF059669),
        bg: Color(0xFFD1FAE5),
        unselectedBg: Color(0xFFECFDF5),
        border: Color(0xFF34D399),
        unselectedBorder: Color(0xFFA7F3D0),
        text: Color(0xFF065F46),
        numberBg: Color(0xFFA7F3D0),
        numberText: Color(0xFF065F46),
      );
    } else if (n.contains('blue')) {
      return const _BeltColorTheme(
        primary: Color(0xFF3B82F6),
        accent: Color(0xFF2563EB),
        bg: Color(0xFFDBEAFE),
        unselectedBg: Color(0xFFEFF6FF),
        border: Color(0xFF60A5FA),
        unselectedBorder: Color(0xFFBFDBFE),
        text: Color(0xFF1E40AF),
        numberBg: Color(0xFFBFDBFE),
        numberText: Color(0xFF1E40AF),
      );
    } else if (n.contains('brown')) {
      return const _BeltColorTheme(
        primary: Color(0xFF92400E),
        accent: Color(0xFF78350F),
        bg: Color(0xFFF5EBE6),
        unselectedBg: Color(0xFFFAF5F2),
        border: Color(0xFFB45309),
        unselectedBorder: Color(0xFFD7B9A5),
        text: Color(0xFF451A03),
        numberBg: Color(0xFFE6D2C4),
        numberText: Color(0xFF451A03),
      );
    } else if (n.contains('black')) {
      return const _BeltColorTheme(
        primary: Color(0xFF0F172A),
        accent: Color(0xFF1E293B),
        bg: Color(0xFFF1F5F9),
        unselectedBg: Color(0xFFF8FAFC),
        border: Color(0xFF475569),
        unselectedBorder: Color(0xFFCBD5E1),
        text: Color(0xFF0F172A),
        numberBg: Color(0xFFE2E8F0),
        numberText: Color(0xFF0F172A),
      );
    }
    // White Belt default
    return const _BeltColorTheme(
      primary: Color(0xFF64748B),
      accent: Color(0xFF475569),
      bg: Color(0xFFF8FAFC),
      unselectedBg: Color(0xFFFFFFFF),
      border: Color(0xFFCBD5E1),
      unselectedBorder: Color(0xFFE2E8F0),
      text: Color(0xFF334155),
      numberBg: Color(0xFFF1F5F9),
      numberText: Color(0xFF334155),
    );
  }

  List<PublicBeltItem> _defaultBelts() {
    return const [
      PublicBeltItem(
        id: 'white_belt',
        name: 'White Belt',
        subtitle: 'Foundations & Fundamental Stances',
        isEnabled: true,
        syllabus: [
          'Breathing & mind-body focus exercises',
          'Full joint warm-up & flexibility routines',
          'Martial arts fundamental stances & front kick mechanics',
          'Core strength conditioning & basic self-defense blocks',
          'Dojo etiquette, respect, and discipline basics',
        ],
      ),
      PublicBeltItem(
        id: 'yellow_belt',
        name: 'Yellow Belt',
        subtitle: 'Striking Foundations & Footwork',
        isEnabled: true,
        syllabus: [
          'Jab-Cross punch combination & guard positioning',
          'Roundhouse kick techniques & target accuracy',
          'Basic evasion, ducking, and footwork drills',
          'Upper body blocks & counter-attack timing',
          'Stamina building & high-intensity core sets',
        ],
      ),
      PublicBeltItem(
        id: 'orange_belt',
        name: 'Orange Belt',
        subtitle: 'Intermediate Stance Transitions & Combination Strikes',
        isEnabled: true,
        syllabus: [
          'Front & roundhouse kick fluidity & balance recovery',
          'Elbow strikes, hammer fists & close-range counters',
          'Defensive parries, head movement & angle cutting',
          'High-cadence pad work & explosive interval rounds',
          'Situational wrist-lock escapes & boundary awareness',
        ],
      ),
      PublicBeltItem(
        id: 'green_belt',
        name: 'Green Belt',
        subtitle: 'Intermediate Striking & Defense',
        isEnabled: true,
        syllabus: [
          'Side kicks, hook kicks & dynamic leg flexibility',
          'Combination striking & distance management',
          'Intermediate wrist escape & release self-defense maneuvers',
          'Reaction time drills & counter-punching precision',
          'Core stability & balance endurance exercises',
        ],
      ),
      PublicBeltItem(
        id: 'blue_belt',
        name: 'Blue Belt',
        subtitle: 'Advanced Form & Sparring Tactics',
        isEnabled: true,
        syllabus: [
          'Spinning back kick & jump kick execution',
          'Advanced defense counters & sweep techniques',
          'Close-range elbow and knee strike combinations',
          'Multi-attacker defense awareness & tactical positioning',
          'Mental resilience & competitive focus conditioning',
        ],
      ),
      PublicBeltItem(
        id: 'brown_belt',
        name: 'Brown Belt',
        subtitle: 'Mastery Level Combat & Control',
        isEnabled: true,
        syllabus: [
          'Precision combination chaining & fluid movement mastery',
          'Joint lock defense & advanced takedown prevention',
          'Speed, power, and kinetic energy striking mechanics',
          'Leadership, junior mentoring & assistant instructor drills',
          'Intensive full-body endurance & power conditioning',
        ],
      ),
      PublicBeltItem(
        id: 'black_belt',
        name: 'Black Belt',
        subtitle: 'Black Belt Excellence & Syllabus Graduation',
        isEnabled: true,
        syllabus: [
          'Full martial arts curriculum mastery & flawless form execution',
          'Real-world situational self-defense & rapid neutralizing drills',
          'Advanced teaching methodology & stance evaluation techniques',
          'Official black belt examination & graduation syllabus completion',
          'Lifelong discipline, philosophy, and academy ambassador leadership',
        ],
      ),
    ];
  }
}

class _BeltColorTheme {
  final Color primary;
  final Color accent;
  final Color bg;
  final Color unselectedBg;
  final Color border;
  final Color unselectedBorder;
  final Color text;
  final Color numberBg;
  final Color numberText;

  const _BeltColorTheme({
    required this.primary,
    required this.accent,
    required this.bg,
    required this.unselectedBg,
    required this.border,
    required this.unselectedBorder,
    required this.text,
    required this.numberBg,
    required this.numberText,
  });
}
