import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/design_system/design_system.dart';
import '../../auth/providers/auth_provider.dart';
import '../../public/presentation/public_main_shell.dart';

/// Data model representing a single onboarding slide.
class OnboardingSlide {
  final String imagePath;
  final Widget headline;
  final String description;

  const OnboardingSlide({
    required this.imagePath,
    required this.headline,
    required this.description,
  });
}

/// Three-slide cinematic fitness onboarding experience for SELFFITS.
/// Displayed on first launch of the application.
class OnboardingScreen extends ConsumerStatefulWidget {
  final VoidCallback? onComplete;

  const OnboardingScreen({super.key, this.onComplete});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _hasPrecached = false;

  static final List<OnboardingSlide> _slides = [
    // Slide 1: Martial Arts
    OnboardingSlide(
      imagePath: 'assets/images/onboarding/slide1.jpg',
      headline: RichText(
        text: TextSpan(
          style: GoogleFonts.poppins(
            fontSize: 36,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            height: 1.15,
            letterSpacing: -0.5,
          ),
          children: [
            const TextSpan(text: 'Focus Your '),
            TextSpan(
              text: 'Mind.\n',
              style: GoogleFonts.poppins(
                color: AppColors.brandBlue,
                fontWeight: FontWeight.w800,
              ),
            ),
            const TextSpan(text: 'Strengthen Your '),
            TextSpan(
              text: 'Body.',
              style: GoogleFonts.poppins(
                color: AppColors.brandRed,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
      description:
          'Build discipline, confidence, and skill through structured martial arts training.',
    ),

    // Slide 2: Progress & Achievement
    OnboardingSlide(
      imagePath: 'assets/images/onboarding/slide2.jpg',
      headline: RichText(
        text: TextSpan(
          style: GoogleFonts.poppins(
            fontSize: 36,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            height: 1.15,
            letterSpacing: -0.5,
          ),
          children: [
            const TextSpan(text: 'Every Session.\nA Stronger '),
            TextSpan(
              text: 'You.',
              style: GoogleFonts.poppins(
                color: AppColors.brandBlue,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
      description:
          'Track your progress, stay consistent, and become your best self.',
    ),

    // Slide 3: Weight Management & Fitness
    OnboardingSlide(
      imagePath: 'assets/images/onboarding/slide3.jpg',
      headline: RichText(
        text: TextSpan(
          style: GoogleFonts.poppins(
            fontSize: 36,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            height: 1.15,
            letterSpacing: -0.5,
          ),
          children: [
            const TextSpan(text: 'Stronger Habits.\nA Healthier '),
            TextSpan(
              text: 'You.',
              style: GoogleFonts.poppins(
                color: AppColors.brandBlue,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
      description:
          'Personalised training to help you build strength, improve fitness, and reach your goals.',
    ),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasPrecached) {
      _hasPrecached = true;
      precacheImage(const AssetImage('assets/images/onboarding/logo.png'), context);
      for (final slide in _slides) {
        precacheImage(AssetImage(slide.imagePath), context);
      }
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finishOnboarding() async {
    // Persist first-launch completion to hardware-backed secure storage
    await ref.read(onboardingProvider.notifier).completeOnboarding();
    if (widget.onComplete != null) {
      widget.onComplete!();
    }
    // If OnboardingScreen was pushed onto the navigator, pop it cleanly
    if (mounted && Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    } else if (mounted) {
      // Direct navigation fallback to Home if OnboardingScreen is the root widget
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => const PublicMainShell(initialIndex: 0),
        ),
      );
    }
  }

  void _nextPage() {
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 340),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _finishOnboarding();
    }
  }

  void _goToPage(int index) {
    if (index >= 0 && index < _slides.length && index != _currentPage) {
      _pageController.animateToPage(
        index,
        duration: const Duration(milliseconds: 340),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isLastSlide = _currentPage == _slides.length - 1;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Sliding PageView (Background Image + Gradient + Text)
          PageView.builder(
            controller: _pageController,
            itemCount: _slides.length,
            physics: const BouncingScrollPhysics(),
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemBuilder: (context, index) {
              final slide = _slides[index];
              return Stack(
                fit: StackFit.expand,
                children: [
                  // Full-bleed background photograph
                  Image.asset(
                    slide.imagePath,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    filterQuality: FilterQuality.high,
                  ),

                  // Multi-stop cinematic vertical gradient overlay
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        stops: const [0.0, 0.22, 0.45, 0.70, 0.92, 1.0],
                        colors: [
                          Colors.black.withValues(alpha: 0.75),
                          Colors.black.withValues(alpha: 0.20),
                          Colors.black.withValues(alpha: 0.40),
                          Colors.black.withValues(alpha: 0.82),
                          Colors.black.withValues(alpha: 0.95),
                          Colors.black.withValues(alpha: 0.98),
                        ],
                      ),
                    ),
                  ),

                  // Horizontal gradient for left-aligned typography legibility
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        stops: const [0.0, 0.65, 1.0],
                        colors: [
                          Colors.black.withValues(alpha: 0.55),
                          Colors.black.withValues(alpha: 0.20),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),

                  // Slide Text Content positioned above bottom action area
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 125), // Clearance for enlarged top header
                          const Spacer(),
                          // Headline
                          slide.headline,
                          const SizedBox(height: 12),
                          // Supporting Description
                          Text(
                            slide.description,
                            style: GoogleFonts.poppins(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 15,
                              fontWeight: FontWeight.w400,
                              height: 1.45,
                            ),
                          ),
                          // Clearance for stationary bottom controls (indicators + CTA)
                          const SizedBox(height: 130),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // 2. Stationary Top Area: Enlarged Brand Logo (50% screen width) & Tagline
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Enlarged SELFFITS Brand Logo (50% of mobile screen width)
                    SizedBox(
                      width: screenWidth * 0.50,
                      child: Image.asset(
                        'assets/images/onboarding/logo.png',
                        fit: BoxFit.contain,
                        alignment: Alignment.centerLeft,
                        filterQuality: FilterQuality.high,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Tagline Line 1
                    Text(
                      'Online Fitness & Martial Arts Academy',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.2,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 3),
                    // Tagline Line 2
                    Text(
                      'Train Anywhere. Transform Yourself.',
                      style: GoogleFonts.poppins(
                        color: Colors.white.withValues(alpha: 0.72),
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        letterSpacing: 0.25,
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 3. Stationary Bottom Area: Pagination Indicators & Primary CTA
          Positioned(
            left: 24,
            right: 24,
            bottom: 0,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Pagination Indicators
                    _buildPaginationIndicators(),

                    const SizedBox(height: 20),

                    // Primary Action CTA (Next → / Get Started →)
                    _buildActionButton(isLastSlide),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds the 3 interactive horizontal pagination indicators.
  Widget _buildPaginationIndicators() {
    return Row(
      children: List.generate(_slides.length, (index) {
        final isActive = index == _currentPage;
        return GestureDetector(
          onTap: () => _goToPage(index),
          behavior: HitTestBehavior.opaque,
          child: Padding(
            padding: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 280),
              curve: Curves.easeInOut,
              height: 4,
              width: isActive ? 32 : 18,
              decoration: BoxDecoration(
                color: isActive
                    ? AppColors.brandRed
                    : Colors.white.withValues(alpha: 0.30),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        );
      }),
    );
  }

  /// Builds the stationary, moderately rounded red action CTA button.
  Widget _buildActionButton(bool isLastSlide) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: Material(
        color: AppColors.brandRed,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: _nextPage,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                const SizedBox(width: 24), // Optical balance for arrow icon
                Expanded(
                  child: Text(
                    isLastSlide ? 'Get Started' : 'Next',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
