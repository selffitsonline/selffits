import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/design_system/design_system.dart';
import '../../auth/presentation/student_login_screen.dart';
import '../../auth/providers/auth_provider.dart';
import 'enrollment_checkout_screen.dart';
import '../models/public_catalog.dart';
import '../providers/catalog_provider.dart';
import 'widgets/special_promotion_section.dart';
import 'widgets/martial_arts_journey_section.dart';
import 'widgets/weight_management_journey_section.dart';
import 'widgets/master_coaches_section.dart';
import 'widgets/become_coach_section.dart';

/// Public Home Screen for guests and prospective students.
/// Completely redesigned with luxury native mobile UI:
/// - Background strictly #F8F9FB.
/// - Pure white #FFFFFF elevated cards with subtle ambient shadows.
/// - Strict Poppins typography hierarchy across all text elements.
/// - Compact single-row seven-day training selector.
/// - Authoritative backend schedule builder integration.
class PublicHomeScreen extends ConsumerStatefulWidget {
  final VoidCallback? onGoToAccount;

  const PublicHomeScreen({super.key, this.onGoToAccount});

  @override
  ConsumerState<PublicHomeScreen> createState() => _PublicHomeScreenState();
}

class _PublicHomeScreenState extends ConsumerState<PublicHomeScreen> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _scheduleBuilderKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(catalogProvider.notifier).loadCatalog();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToScheduleBuilder() {
    final targetContext = _scheduleBuilderKey.currentContext;
    if (targetContext != null) {
      Scrollable.ensureVisible(
        targetContext,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    } else if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0.0,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _handleProceedToEnrollment() async {
    final authState = ref.read(authProvider);
    final hasToken = await ref.read(secureStorageProvider).hasToken();
    if (!mounted) return;
    final isAuthenticated = authState.isAuthenticated || hasToken;
    if (!isAuthenticated) {
      ref.read(pendingCheckoutProvider.notifier).state = true;
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (loginContext) => StudentLoginScreen(
            showBackButton: true,
            onLoginSuccess: () {
              if (Navigator.of(loginContext).canPop()) {
                Navigator.of(loginContext).pop();
              }
            },
          ),
        ),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const EnrollmentCheckoutScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final catalogState = ref.watch(catalogProvider);
    final catalogNotifier = ref.read(catalogProvider.notifier);
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    // Floating nav pill is 56dp high, positioned 20dp above SafeArea bottom.
    // Total nav clearance = bottomInset + 56 + 20 = bottomInset + 76.
    // Adding 12dp natural breathing space ensures the checkout card ends cleanly
    // above the floating navigation without excessive blank space.
    // SafeArea has bottom: false to prevent duplicating the bottom inset.
    final bottomScrollPadding = bottomInset + 76.0 + 12.0;

    return Scaffold(
      backgroundColor: AppColors.background, // Exactly #F8F9FB
      appBar: const SelffitsAppBar(),
      body: SafeArea(
        top: false,
        bottom: false,
        child: RefreshIndicator(
          color: AppColors.brandRed,
          backgroundColor: AppColors.surface,
          onRefresh: () async {
            await catalogNotifier.loadCatalog(forceRefresh: true);
          },
          child: SingleChildScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(16, 12, 16, bottomScrollPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Offline / Cached Notice Banner
                if (catalogState.isFromCache) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF59E0B)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.wifi_off_rounded,
                          size: 16,
                          color: Color(0xFFD97706),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            catalogState.errorMessage ??
                                'Showing cached academy pricing • Pull down to refresh',
                            style: GoogleFonts.poppins(
                              color: const Color(0xFFB45309),
                              fontWeight: FontWeight.w600,
                              fontSize: 11.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // 1. Interactive Schedule Builder Anchor & Selection Dock (FIRST main content section)
                KeyedSubtree(
                  key: _scheduleBuilderKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildCompactHeader(),
                      const SizedBox(height: 30),

                      // Loading or Error State for Schedule Builder
                      if (catalogState.isLoading &&
                          catalogState.data == null) ...[
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 40),
                          child: Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.brandRed,
                              ),
                            ),
                          ),
                        ),
                      ] else if (catalogState.errorMessage != null &&
                          catalogState.data == null) ...[
                        // Error / Retry Card
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: AppColors.surface, // Pure White #FFFFFF
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: AppColors.shadowCard,
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.cloud_off_rounded,
                                size: 42,
                                color: AppColors.textTertiary,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Unable to Load Interactive Catalog',
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                catalogState.errorMessage!,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 18),
                              AppButton(
                                label: 'Retry Connection',
                                variant: AppButtonVariant.primaryRed,
                                size: AppButtonSize.sm,
                                onPressed: () {
                                  catalogNotifier.loadCatalog(
                                    forceRefresh: true,
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ] else ...[
                        _buildControlDock(catalogState, catalogNotifier),
                        const SizedBox(height: 14),
                        _buildInteractiveScheduleCard(
                          catalogState,
                          catalogNotifier,
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // 2. Special Promotion (Authoritative coupon & copy code)
                SpecialPromotionSection(
                  promotion: catalogState.data?.promotion,
                  onExplorePrograms: _scrollToScheduleBuilder,
                ),

                // 4. Your Martial Arts Learning Journey (Belt Progression Syllabus)
                MartialArtsJourneySection(
                  syllabusData: catalogState.data?.beltSyllabusSection,
                  onExploreMartialArts: () {
                    catalogNotifier.setProgramCategory('mma');
                    _scrollToScheduleBuilder();
                  },
                ),

                // 5. Your Weight Management Journey (Fitness & HIIT Modules)
                WeightManagementJourneySection(
                  journeyData: catalogState.data?.fitnessJourneySection,
                  onExploreFitness: () {
                    catalogNotifier.setProgramCategory('fitness');
                    _scrollToScheduleBuilder();
                  },
                ),

                // 6. Meet Our Master Coaches (Authoritative Senseis & Trainers)
                MasterCoachesSection(
                  coachesData: catalogState.data?.coachesSection,
                ),

                // 7. Become a SELFFITS Coach (Authoritative Instructor Recruitment CTA)
                BecomeCoachSection(
                  recruitmentData: catalogState.data?.becomeCoachSection,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Academy Schedule Builder Heading displayed directly on #F8F9FB background
  Widget _buildCompactHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 14, 2, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
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
                  Icons.auto_awesome_rounded,
                  size: 13,
                  color: AppColors.brandRed,
                ),
                const SizedBox(width: 5),
                Text(
                  'ACADEMY SCHEDULE BUILDER',
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
          const SizedBox(height: 14),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              'Explore Programs & Weekly Schedule',
              maxLines: 1,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w800,
                fontSize: 18.5,
                letterSpacing: -0.4,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Customize your training days, GMT batch timing, and monthly membership plan. Live interactive classes over Google Meet.',
            style: GoogleFonts.poppins(
              color: AppColors.textSecondary,
              height: 1.4,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  /// Program Category, Martial Arts Type & Audience Control Card
  Widget _buildControlDock(CatalogState state, CatalogNotifier notifier) {
    final isMma = state.programCategory == 'mma';
    final martialArtsTypes = state.data?.martialArtsTypes ?? [];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
        boxShadow: AppColors.shadowCard,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Row 1: Program Category Segmented Pill Bar (MMA vs Fitness)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildCategorySegment(
                    title: 'Mixed Martial Arts',
                    icon: Icons.shield_outlined,
                    isSelected: isMma,
                    onTap: () => notifier.setProgramCategory('mma'),
                  ),
                ),
                Expanded(
                  child: _buildCategorySegment(
                    title: 'Fitness & Weight',
                    icon: Icons.local_fire_department_rounded,
                    isSelected: !isMma,
                    onTap: () => notifier.setProgramCategory('fitness'),
                  ),
                ),
              ],
            ),
          ),

          // Row 2: Martial Arts Type Selector (when MMA is selected)
          if (isMma && martialArtsTypes.isNotEmpty) ...[
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Text(
                'MARTIAL ARTS TYPE',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textTertiary,
                  letterSpacing: 0.8,
                ),
              ),
            ),
            const SizedBox(height: 6),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: martialArtsTypes.map((typeItem) {
                  final label = typeItem['label'] ?? '';
                  final isSelected = state.martialArtsType == label;

                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: InkWell(
                      onTap: () => notifier.setMartialArtsType(label),
                      borderRadius: BorderRadius.circular(12),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 11,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.brandRedLight
                              : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.brandRed
                                : const Color(0xFFE2E8F0),
                            width: 1.0,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppColors.brandRed.withValues(
                                      alpha: 0.15,
                                    ),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  ),
                                  ...AppColors.shadowCardSubtle,
                                ]
                              : AppColors.shadowCardSubtle,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.brandRed
                                      : AppColors.textTertiary,
                                  width: 1.5,
                                ),
                                color: isSelected
                                    ? AppColors.brandRed
                                    : Colors.transparent,
                              ),
                              child: isSelected
                                  ? const Center(
                                      child: Icon(
                                        Icons.circle,
                                        size: 5,
                                        color: Colors.white,
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              label,
                              style: GoogleFonts.poppins(
                                color: isSelected
                                    ? AppColors.brandRed
                                    : AppColors.textPrimary,
                                fontWeight: isSelected
                                    ? FontWeight.w700
                                    : FontWeight.w600,
                                fontSize: 11.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],

          // Row 3: Audience Tabs with Integrated Age Badges
          const SizedBox(height: 12),
          const Divider(color: Color(0xFFE2E8F0), height: 1),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildAudienceTabButton(
                  title: 'Kids',
                  ageBadge: '8–20 Yrs',
                  isSelected: state.audienceGroup == 'kids',
                  onTap: () => notifier.setAudienceGroup('kids'),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildAudienceTabButton(
                  title: 'Adults Mix',
                  ageBadge: '21+ Yrs',
                  isSelected: state.audienceGroup == 'adults',
                  onTap: () => notifier.setAudienceGroup('adults'),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildAudienceTabButton(
                  title: 'Ladies Only',
                  ageBadge: '21+ Yrs',
                  isSelected: state.audienceGroup == 'ladies',
                  onTap: () => notifier.setAudienceGroup('ladies'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySegment({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandRed : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.brandRed.withValues(alpha: 0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 15,
              color: isSelected ? Colors.white : AppColors.textSecondary,
            ),
            const SizedBox(width: 5),
            Flexible(
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  color: isSelected ? Colors.white : AppColors.textPrimary,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  fontSize: 11.5,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudienceTabButton({
    required String title,
    required String ageBadge,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandBlue : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.brandBlue.withValues(alpha: 0.28),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
          border: Border.all(
            color: isSelected ? AppColors.brandBlue : const Color(0xFFE2E8F0),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: GoogleFonts.poppins(
                color: isSelected ? Colors.white : AppColors.textPrimary,
                fontWeight: FontWeight.w700,
                fontSize: 11,
              ),
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.22)
                    : const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                ageBadge,
                style: GoogleFonts.poppins(
                  fontSize: 8.5,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Interactive Schedule Builder Container (Steps 1 to 6)
  Widget _buildInteractiveScheduleCard(
    CatalogState state,
    CatalogNotifier notifier,
  ) {
    final activeCat = state.activeCategory;
    final plans = activeCat?.membershipPlans ?? [];
    final trainingDays = activeCat?.trainingDays ?? [];
    final batchTimings = activeCat?.batchTimings ?? [];
    final activeCurriculum = state.activePlan?.curriculum ?? [];
    final dietNutrition = state.data?.dietNutrition;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
        boxShadow: AppColors.shadowCard,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Builder Card Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.brandRedLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        'INTERACTIVE SCHEDULE BUILDER',
                        style: GoogleFonts.poppins(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: AppColors.brandRed,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      state.contextTitle,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              if (state.programCategory == 'mma' &&
                  state.martialArtsType.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'TYPE',
                        style: GoogleFonts.poppins(
                          fontSize: 8,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textTertiary,
                        ),
                      ),
                      Text(
                        state.martialArtsType,
                        style: GoogleFonts.poppins(
                          color: AppColors.brandRed,
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFFE2E8F0), height: 1),
          const SizedBox(height: 12),

          // STEP 1: Select Weekly Training Frequency
          _buildStepHeader(
            stepNumber: 1,
            title: 'Select Weekly Training Frequency',
            badgeText:
                'Selected: ${state.daysPerWeek} ${state.daysPerWeek == 1 ? "Day" : "Days"} / Wk',
            badgeColor: AppColors.brandBlue,
          ),
          const SizedBox(height: 10),
          _buildFrequencyGrid(plans, state.daysPerWeek, notifier),
          const SizedBox(height: 16),

          // STEP 2: Redesigned Single-Row 7-Day Training Selector
          _buildStepHeader(
            stepNumber: 2,
            title:
                'Select ${state.daysPerWeek} Training ${state.daysPerWeek == 1 ? "Day" : "Days"}',
            badgeText:
                '${state.selectedDays.length} of ${state.daysPerWeek} required',
            badgeColor: state.selectedDays.length == state.daysPerWeek
                ? AppColors.liveEmerald
                : AppColors.warningAmber,
          ),
          const SizedBox(height: 10),
          _buildTrainingDaysGrid(
            trainingDays,
            state.selectedDays,
            state.daysPerWeek,
            notifier,
          ),
          if (state.selectedDays.length < state.daysPerWeek) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.warningAmberLight,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.warningAmber.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline_rounded,
                    size: 14,
                    color: AppColors.warningAmber,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Please select ${state.daysPerWeek - state.selectedDays.length} more training day(s).',
                      style: GoogleFonts.poppins(
                        color: const Color(0xFFB45309),
                        fontWeight: FontWeight.w600,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),

          // STEP 3: Select Class Batch Timing
          _buildStepHeader(
            stepNumber: 3,
            title: 'Select Batch Timing (GMT UTC+0)',
            badgeText: 'Live Interactive',
            badgeColor: AppColors.brandBlue,
          ),
          const SizedBox(height: 10),
          _buildBatchTimingList(batchTimings, state.selectedBatchId, notifier),
          const SizedBox(height: 14),

          // STEP 4: Curriculum Syllabus Accordion
          _buildCurriculumAccordion(
            activeCurriculum,
            state.daysPerWeek,
            state.isCurriculumOpen,
            notifier,
          ),
          const SizedBox(height: 12),

          // STEP 5: Optional Diet & Nutrition Program Add-on
          if (dietNutrition != null && dietNutrition.activeStatus) ...[
            _buildDietNutritionAddon(
              dietNutrition,
              state.includeDietNutrition,
              notifier,
            ),
            const SizedBox(height: 14),
          ],

          // STEP 6: Live Enrollment Summary & Checkout CTA
          _buildSummaryAndCheckout(state, notifier),
        ],
      ),
    );
  }

  Widget _buildStepHeader({
    required int stepNumber,
    required String title,
    required String badgeText,
    required Color badgeColor,
  }) {
    return Row(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(
            color: AppColors.brandRed,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '$stepNumber',
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 10.5,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              fontSize: 12.5,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(
            color: badgeColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
          ),
          child: Text(
            badgeText,
            style: GoogleFonts.poppins(
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
              color: badgeColor,
            ),
          ),
        ),
      ],
    );
  }

  /// Step 1: Refined Horizontal Frequency Cards
  Widget _buildFrequencyGrid(
    List<PublicMembershipPlan> plans,
    int selectedDaysPerWeek,
    CatalogNotifier notifier,
  ) {
    if (plans.isEmpty) {
      return const SizedBox.shrink();
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: plans.map((plan) {
          final isSelected = selectedDaysPerWeek == plan.daysPerWeek;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => notifier.setDaysPerWeek(plan.daysPerWeek),
              borderRadius: BorderRadius.circular(16),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width: 102,
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.brandRedLight : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.brandRed
                        : const Color(0xFFE2E8F0),
                    width: 1.0,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.brandRed.withValues(alpha: 0.16),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                          ...AppColors.shadowCardSubtle,
                        ]
                      : AppColors.shadowCardSubtle,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Badge Area
                    SizedBox(
                      height: 16,
                      child: plan.badge != null
                          ? Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 5,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: plan.badge == 'MOST POPULAR'
                                    ? AppColors.brandRed
                                    : AppColors.brandBlue,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                plan.badge!,
                                style: GoogleFonts.poppins(
                                  fontSize: 7.5,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${plan.daysPerWeek} ${plan.daysPerWeek == 1 ? "Day" : "Days"}',
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: isSelected
                            ? AppColors.brandRed
                            : AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '/ Week',
                      style: GoogleFonts.poppins(
                        fontSize: 8.5,
                        color: AppColors.textTertiary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Divider(color: Color(0xFFE2E8F0), height: 1),
                    const SizedBox(height: 6),
                    Text(
                      '\$${plan.monthlyPriceUSD.toInt()}',
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '/ month',
                      style: GoogleFonts.poppins(
                        fontSize: 8.5,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  /// Step 2: Redesigned Compact Single-Row 7-Day Training Selector
  Widget _buildTrainingDaysGrid(
    List<PublicTrainingDay> days,
    List<String> selectedDays,
    int daysPerWeek,
    CatalogNotifier notifier,
  ) {
    if (days.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: AppColors.shadowCardSubtle,
      ),
      child: Column(
        children: [
          // Single-Row 7-Day Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: days.map((day) {
              final isRest = day.restDay || !day.selectable;
              final isSelected = selectedDays.contains(day.dayName);

              // Compact uppercase weekday label: SUN, MON, TUE, WED, THU, FRI, SAT
              final shortLabel = day.dayName.length >= 3
                  ? day.dayName.substring(0, 3).toUpperCase()
                  : day.dayName.toUpperCase();

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 1.5),
                  child: Semantics(
                    label: day.dayName,
                    button: true,
                    enabled: !isRest,
                    selected: isSelected,
                    child: InkWell(
                      key: Key('day-$shortLabel'),
                      onTap: isRest
                          ? null
                          : () => notifier.toggleTrainingDay(day.dayName),
                      borderRadius: BorderRadius.circular(12),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Short Weekday Header (Poppins)
                          Text(
                            shortLabel,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isRest
                                  ? AppColors.errorRose.withValues(alpha: 0.7)
                                  : isSelected
                                  ? AppColors.brandBlue
                                  : AppColors.textPrimary,
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(height: 6),

                          // Circular Day Control
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isRest
                                  ? AppColors.errorRoseLight
                                  : isSelected
                                  ? AppColors.brandBlue
                                  : const Color(0xFFF8FAFC),
                              border: Border.all(
                                color: isRest
                                    ? AppColors.errorRose.withValues(alpha: 0.3)
                                    : isSelected
                                    ? AppColors.brandBlue
                                    : AppColors.liveEmerald.withValues(
                                        alpha: 0.35,
                                      ),
                                width: isSelected ? 2.0 : 1.0,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: AppColors.brandBlue.withValues(
                                          alpha: 0.35,
                                        ),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Center(
                              child: isRest
                                  ? const Icon(
                                      Icons.block_rounded,
                                      size: 15,
                                      color: AppColors.errorRose,
                                    )
                                  : isSelected
                                  ? const Icon(
                                      Icons.check_rounded,
                                      size: 18,
                                      color: Colors.white,
                                    )
                                  : Container(
                                      width: 10,
                                      height: 10,
                                      decoration: const BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppColors.liveEmerald,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 6),

                          // Status Badge or Dot below circle (NO duplicate day name)
                          if (isRest)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 3,
                                vertical: 1.5,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.errorRose.withValues(
                                  alpha: 0.12,
                                ),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'REST DAY',
                                style: GoogleFonts.poppins(
                                  fontSize: 6.5,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.errorRose,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            )
                          else if (isSelected)
                            Container(
                              width: 5,
                              height: 5,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.brandBlue,
                              ),
                            )
                          else
                            Container(
                              width: 5,
                              height: 5,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.liveEmerald,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 8),
          const Divider(color: Color(0xFFE2E8F0), height: 1),
          const SizedBox(height: 6),

          // Refined Single-Row Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem(
                color: AppColors.brandBlue,
                label: 'Selected',
                isCircle: true,
              ),
              const SizedBox(width: 14),
              _buildLegendItem(
                color: AppColors.liveEmerald,
                label: 'Available',
                isCircle: true,
              ),
              const SizedBox(width: 14),
              _buildLegendItem(
                color: AppColors.errorRose,
                label: 'Rest Day',
                isCircle: false,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem({
    required Color color,
    required String label,
    required bool isCircle,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(
            color: color,
            shape: isCircle ? BoxShape.circle : BoxShape.rectangle,
            borderRadius: isCircle ? null : BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 9.5,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  /// Step 3: Refined Class Batch Timings
  Widget _buildBatchTimingList(
    List<PublicBatchTiming> batches,
    String? selectedBatchId,
    CatalogNotifier notifier,
  ) {
    if (batches.isEmpty) return const SizedBox.shrink();

    return Column(
      children: batches.map((batch) {
        final isSelected =
            selectedBatchId == batch.id ||
            (selectedBatchId == null && batches.first.id == batch.id);

        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: InkWell(
            onTap: () => notifier.setSelectedBatch(batch.id),
            borderRadius: BorderRadius.circular(14),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.brandBlueLight : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected
                      ? AppColors.brandBlue
                      : const Color(0xFFE2E8F0),
                  width: isSelected ? 1.5 : 1.0,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.brandBlue.withValues(alpha: 0.15),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                        ...AppColors.shadowCardSubtle,
                      ]
                    : AppColors.shadowCardSubtle,
              ),
              child: Row(
                children: [
                  Icon(
                    isSelected
                        ? Icons.radio_button_checked_rounded
                        : Icons.radio_button_unchecked_rounded,
                    size: 18,
                    color: isSelected
                        ? AppColors.brandBlue
                        : AppColors.textTertiary,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              batch.batchName,
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                color: isSelected
                                    ? AppColors.brandBlue
                                    : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                batch.timezone,
                                style: GoogleFonts.poppins(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          batch.displayLabel,
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isSelected)
                    const Icon(
                      Icons.check_rounded,
                      size: 18,
                      color: AppColors.brandBlue,
                    ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  /// Step 4: Expandable Curriculum Accordion
  Widget _buildCurriculumAccordion(
    List<String> curriculum,
    int daysPerWeek,
    bool isCurriculumOpen,
    CatalogNotifier notifier,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: AppColors.shadowCardSubtle,
      ),
      child: Column(
        children: [
          InkWell(
            onTap: notifier.toggleCurriculum,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: const BoxDecoration(
                      color: AppColors.brandRed,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '4',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 10.5,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Curriculum Syllabus ($daysPerWeek Day Plan)',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          isCurriculumOpen
                              ? 'Tap to collapse syllabus details'
                              : 'Tap to view full learning topics',
                          style: GoogleFonts.poppins(
                            fontSize: 9.5,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AnimatedRotation(
                    turns: isCurriculumOpen ? 0.5 : 0.0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(
                      Icons.keyboard_arrow_down_rounded,
                      size: 20,
                      color: AppColors.brandBlue,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isCurriculumOpen) ...[
            const Divider(color: Color(0xFFE2E8F0), height: 1),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: curriculum.asMap().entries.map((entry) {
                  final idx = entry.key + 1;
                  final topic = entry.value;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 7),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 18,
                          height: 18,
                          margin: const EdgeInsets.only(top: 1),
                          decoration: BoxDecoration(
                            color: AppColors.brandRedLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Center(
                            child: Text(
                              '$idx',
                              style: GoogleFonts.poppins(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.brandRed,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            topic,
                            style: GoogleFonts.poppins(
                              color: AppColors.textPrimary,
                              fontSize: 11.5,
                              height: 1.35,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Step 5: Optional Diet & Nutrition Program Add-on
  Widget _buildDietNutritionAddon(
    PublicDietNutrition dietNutrition,
    bool isIncluded,
    CatalogNotifier notifier,
  ) {
    return InkWell(
      onTap: notifier.toggleDietNutrition,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isIncluded ? AppColors.liveEmeraldLight : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isIncluded ? AppColors.liveEmerald : const Color(0xFFE2E8F0),
            width: isIncluded ? 1.5 : 1.0,
          ),
          boxShadow: isIncluded
              ? [
                  BoxShadow(
                    color: AppColors.liveEmerald.withValues(alpha: 0.18),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                  ...AppColors.shadowCardSubtle,
                ]
              : AppColors.shadowCardSubtle,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 22,
              height: 22,
              margin: const EdgeInsets.only(top: 2),
              decoration: BoxDecoration(
                color: isIncluded ? AppColors.liveEmerald : Colors.white,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: isIncluded
                      ? AppColors.liveEmerald
                      : const Color(0xFFE2E8F0),
                  width: 1.5,
                ),
              ),
              child: isIncluded
                  ? const Center(
                      child: Icon(
                        Icons.check_rounded,
                        size: 16,
                        color: Colors.white,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          '${dietNutrition.title} (Optional)',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            fontSize: 12.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.liveEmerald.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '+\$${dietNutrition.priceUSD.toInt()}',
                          style: GoogleFonts.poppins(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            color: AppColors.liveEmerald,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    dietNutrition.description,
                    style: GoogleFonts.poppins(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                      height: 1.35,
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

  /// Step 6: Luxury Summary & Authoritative Checkout Action
  Widget _buildSummaryAndCheckout(
    CatalogState state,
    CatalogNotifier notifier,
  ) {
    final batch = state.selectedBatch;
    final batchText = batch != null
        ? '${batch.batchName} — ${batch.displayLabel}'
        : 'Not Selected';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface, // Pure White #FFFFFF
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: AppColors.shadowCard,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(
                      Icons.auto_awesome_rounded,
                      size: 16,
                      color: AppColors.brandBlue,
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'Enrollment Schedule Summary',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          fontSize: 12,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.liveEmeraldLight,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.liveEmerald.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  'AUTO-CALCULATED',
                  style: GoogleFonts.poppins(
                    fontSize: 7.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.liveEmerald,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(color: Color(0xFFE2E8F0), height: 1),
          const SizedBox(height: 8),

          // Summary Rows (Poppins)
          _buildSummaryRow(
            'Membership Plan:',
            '${state.daysPerWeek} ${state.daysPerWeek == 1 ? "Day" : "Days"} / Wk (\$${state.monthlyPriceUSD.toInt()}/mo)',
          ),
          if (state.programCategory == 'mma' &&
              state.martialArtsType.isNotEmpty)
            _buildSummaryRow('Discipline Type:', state.martialArtsType),
          _buildSummaryRow(
            'Training Days:',
            state.selectedDays.isNotEmpty
                ? state.selectedDays.join(', ')
                : 'None Selected',
            highlightColor: AppColors.brandBlue,
          ),
          _buildSummaryRow('Batch Timing:', batchText),
          _buildSummaryRow(
            'Diet & Nutrition:',
            state.includeDietNutrition
                ? 'Selected (+\$${state.dietPriceUSD.toInt()})'
                : 'Not Included',
            highlightColor: state.includeDietNutrition
                ? AppColors.liveEmerald
                : AppColors.textSecondary,
          ),

          const SizedBox(height: 8),
          const Divider(color: Color(0xFFE2E8F0), height: 1),
          const SizedBox(height: 8),

          // Total Price Display
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                'Total Monthly Price:',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 12.5,
                  color: AppColors.textSecondary,
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    '\$${state.totalPriceUSD.toInt()}',
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      fontSize: 26,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '/ month',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Checkout CTA Button
          AppButton(
            label: 'Proceed to Enrollment (\$${state.totalPriceUSD.toInt()})',
            variant: AppButtonVariant.primaryRed,
            size: AppButtonSize.lg,
            leadingIcon: const Icon(
              Icons.lock_outline_rounded,
              size: 18,
              color: Colors.white,
            ),
            onPressed: state.isSelectionValid
                ? _handleProceedToEnrollment
                : null,
          ),
          if (!state.isSelectionValid) ...[
            const SizedBox(height: 6),
            Text(
              state.selectedDays.length != state.daysPerWeek
                  ? 'Please select exactly ${state.daysPerWeek} training day(s) to continue.'
                  : 'Please select a batch timing to continue.',
              style: GoogleFonts.poppins(
                fontSize: 10,
                color: AppColors.errorRose,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {Color? highlightColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: highlightColor ?? AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
