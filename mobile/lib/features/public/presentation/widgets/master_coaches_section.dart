import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/design_system/design_system.dart';
import '../../models/public_catalog.dart';

/// Section 5: Meet Our Master Coaches
/// Displays authoritative master coaches from the SELFFITS backend.
/// Follows website coach information and visibility rules:
/// - Real names (e.g. Sensei Rahul Sharma, Sarah Jenkins, Master Kenji Sato).
/// - Official belt ranks & master certifications.
/// - Specialized disciplines, years of teaching experience, and verified ratings.
/// - Clean horizontal swipeable cards on pure white #FFFFFF elevated surfaces.
class MasterCoachesSection extends StatefulWidget {
  final PublicCoachesSection? coachesData;

  const MasterCoachesSection({super.key, this.coachesData});

  @override
  State<MasterCoachesSection> createState() => _MasterCoachesSectionState();
}

class _MasterCoachesSectionState extends State<MasterCoachesSection> {
  final ScrollController _scrollController = ScrollController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToIndex(int index, int totalCount) {
    if (index < 0 || index >= totalCount) return;
    const cardWidth = 294.0; // 280 card + 14 separator
    _scrollController.animateTo(
      index * cardWidth,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOut,
    );
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final coaches = widget.coachesData?.items ?? _defaultCoaches();
    if (coaches.isEmpty) return const SizedBox.shrink();

    final badge = widget.coachesData?.headingBadge ?? 'WORLD CLASS INSTRUCTORS';
    final title = widget.coachesData?.headingTitle ?? 'Meet Our Master Coaches';
    final subtitle =
        widget.coachesData?.headingSubtitle ??
        'Learn from certified black belt instructors and master fitness trainers dedicated to guiding your form and technique in real time.';

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Section Header Badge & Title
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
                    Icons.verified_outlined,
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

          // Horizontal Carousel
          SizedBox(
            height: 295,
            child: NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (notification is ScrollEndNotification) {
                  const cardWidth = 294.0;
                  final newIndex = (_scrollController.offset / cardWidth)
                      .round();
                  if (newIndex != _currentIndex &&
                      newIndex >= 0 &&
                      newIndex < coaches.length) {
                    setState(() {
                      _currentIndex = newIndex;
                    });
                  }
                }
                return false;
              },
              child: ListView.separated(
                controller: _scrollController,
                scrollDirection: Axis.horizontal,
                clipBehavior: Clip.none,
                itemCount: coaches.length,
                separatorBuilder: (_, _) => const SizedBox(width: 14),
                itemBuilder: (context, index) {
                  final coach = coaches[index];
                  return _buildCoachCard(coach);
                },
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Carousel Navigation Controls & Indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded),
                iconSize: 22,
                color: _currentIndex > 0
                    ? AppColors.textPrimary
                    : AppColors.textTertiary,
                onPressed: _currentIndex > 0
                    ? () => _scrollToIndex(_currentIndex - 1, coaches.length)
                    : null,
              ),
              const SizedBox(width: 6),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(
                  coaches.length,
                  (dotIndex) => AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: _currentIndex == dotIndex ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: _currentIndex == dotIndex
                          ? AppColors.brandRed
                          : const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded),
                iconSize: 22,
                color: _currentIndex < coaches.length - 1
                    ? AppColors.textPrimary
                    : AppColors.textTertiary,
                onPressed: _currentIndex < coaches.length - 1
                    ? () => _scrollToIndex(_currentIndex + 1, coaches.length)
                    : null,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCoachCard(PublicCoach coach) {
    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: AppColors.shadowCard,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Badges Row (Rank + Specialty)
              Row(
                children: [
                  Expanded(
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3.5,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.brandRedLight,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: AppColors.brandRed.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          coach.rank.toUpperCase(),
                          style: GoogleFonts.poppins(
                            color: AppColors.brandRed,
                            fontWeight: FontWeight.w800,
                            fontSize: 9.5,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3.5,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF93C5FD)),
                    ),
                    child: Text(
                      coach.rating.isNotEmpty ? '★ ${coach.rating}' : '★ 4.9',
                      style: GoogleFonts.poppins(
                        color: const Color(0xFF1D4ED8),
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Avatar & Name Row
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFE50914), Color(0xFF0080FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      coach.name.isNotEmpty
                          ? coach.name
                                .split(' ')
                                .map((w) => w.isNotEmpty ? w[0] : '')
                                .take(2)
                                .join()
                          : 'C',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          coach.name,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            height: 1.2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          coach.role,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF0080FF),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Experience pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.history_edu_rounded,
                      size: 12,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        coach.experience,
                        style: GoogleFonts.poppins(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Bio
              Text(
                coach.bio,
                style: GoogleFonts.poppins(
                  fontSize: 11.5,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),

          // Card Footer: Live Form Evaluation
          Container(
            padding: const EdgeInsets.only(top: 10),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.shield_outlined,
                  size: 13,
                  color: Color(0xFF10B981),
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    coach.statusBadge.isNotEmpty
                        ? coach.statusBadge
                        : 'Live Form Evaluation Active',
                    style: GoogleFonts.poppins(
                      color: const Color(0xFF059669),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<PublicCoach> _defaultCoaches() {
    return const [
      PublicCoach(
        id: 'rahul',
        name: 'Sensei Rahul Sharma',
        role: 'Head Martial Arts Instructor',
        experience: '14+ Years Teaching',
        rank: '4th Dan Black Belt',
        rating: '4.9',
        statusBadge: 'Live Form Evaluation Active',
        image: '/images/adults_martial_arts.png',
        bio:
            'Former national champion specializing in Taekwondo, Karate, and real-time stance evaluation.',
        specialty: 'Martial Arts & Skills Progression',
      ),
      PublicCoach(
        id: 'sarah',
        name: 'Sarah Jenkins',
        role: 'Lead Fitness & HIIT Coach',
        experience: '9+ Years Master Coaching',
        rank: 'Certified Master Trainer',
        rating: '4.9',
        statusBadge: 'Live Form Evaluation Active',
        image: '/images/ladies_fitness.png',
        bio:
            'Transformation specialist focusing on female fitness, fat loss challenges, and conditioning.',
        specialty: 'Fitness & Weight Management',
      ),
      PublicCoach(
        id: 'kenji',
        name: 'Master Kenji Sato',
        role: 'Kickboxing & Self Defense Lead',
        experience: '12+ Years Experience',
        rank: '3rd Dan Black Belt',
        rating: '4.9',
        statusBadge: 'Live Form Evaluation Active',
        image: '/images/hero1.jpg',
        bio:
            'Expert in strike mechanics, rapid reaction drills, and practical self-defense for all age groups.',
        specialty: 'Combat Self Defense',
      ),
      PublicCoach(
        id: 'priya',
        name: 'Priya Kapoor',
        role: 'Ladies Only Fitness Coach',
        experience: '8+ Years Coaching',
        rank: 'Aerobics & HIIT Specialist',
        rating: '4.9',
        statusBadge: 'Live Form Evaluation Active',
        image: '/images/ladies_fitness.png',
        bio:
            'Dedicated instructor empowering women worldwide through energetic online workout routines.',
        specialty: 'Ladies Special Batches',
      ),
      PublicCoach(
        id: 'alex',
        name: 'Master Alex Vance',
        role: 'Kids Martial Arts Mentor',
        experience: '10+ Years Experience',
        rank: '2nd Dan Black Belt',
        rating: '4.9',
        statusBadge: 'Live Form Evaluation Active',
        image: '/images/kids_martial_arts.png',
        bio:
            'Specialist in youth discipline, agility building, and virtual skills examination preparation.',
        specialty: 'Youth Martial Arts Academy',
      ),
      PublicCoach(
        id: 'elena',
        name: 'Elena Rostova',
        role: 'Core Conditioning Specialist',
        experience: '11+ Years Experience',
        rank: 'Master Mobility Trainer',
        rating: '4.9',
        statusBadge: 'Live Form Evaluation Active',
        image: '/images/weight_loss_hiit.png',
        bio:
            'Passionate trainer focusing on core strength, muscle stamina building, and posture alignment.',
        specialty: 'Core Strength & Fat Shred',
      ),
    ];
  }
}
