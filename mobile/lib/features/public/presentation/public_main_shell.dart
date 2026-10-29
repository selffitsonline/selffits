import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/design_system/design_system.dart';
import '../../auth/providers/auth_provider.dart';
import '../../student/presentation/student_home_screen.dart';
import 'account_screen.dart';
import 'public_home_screen.dart';

/// Public Main Navigation Shell.
/// Strictly enforces exactly TWO bottom navigation tabs:
/// - Tab 0: Home (Public academy discovery and in-page program catalog)
/// - Tab 1: Account (Student/Coach authentication or authenticated profile summary)
/// Designed as an elegant floating rounded white pill positioned ~20px above safe area.
class PublicMainShell extends ConsumerStatefulWidget {
  final int initialIndex;

  const PublicMainShell({super.key, this.initialIndex = 0});

  @override
  ConsumerState<PublicMainShell> createState() => _PublicMainShellState();
}

class _PublicMainShellState extends ConsumerState<PublicMainShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  void didUpdateWidget(PublicMainShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialIndex != oldWidget.initialIndex) {
      _currentIndex = widget.initialIndex;
    }
  }

  void _onTabTapped(int index) {
    if (index == 1) {
      // Whenever Account bottom tab is tapped, reset to default Account Information
      ref.read(studentAccountSectionProvider.notifier).state = 4;
    }
    if (index != _currentIndex) {
      setState(() {
        _currentIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final gradientHeight = bottomInset + 118.0;
    final authState = ref.watch(authProvider);
    final isGuestLogin = _currentIndex == 1 && !authState.isAuthenticated;

    final systemOverlayStyle = SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor:
          isGuestLogin ? Colors.white : AppColors.background,
      systemNavigationBarIconBrightness: Brightness.dark,
      systemNavigationBarDividerColor: Colors.transparent,
    );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: systemOverlayStyle,
      child: Scaffold(
        backgroundColor: isGuestLogin ? Colors.white : AppColors.background,
        extendBody: true, // Enables smooth scroll behind the floating nav pill
        body: Stack(
          children: [
            IndexedStack(
              index: _currentIndex,
              children: [
                PublicHomeScreen(onGoToAccount: () => _onTabTapped(1)),
                const AccountScreen(),
              ],
            ),
            // Bottom fade gradient is only shown on home tab; suppressed on login screen for consistent pure white
            if (!isGuestLogin)
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                height: gradientHeight,
                child: const IgnorePointer(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Color(0x00F8F9FB),
                          Color(0x08F8F9FB),
                          Color(0x14F8F9FB),
                          Color(0x33F8F9FB),
                          Color(0x7AF8F9FB),
                          Color(0xD9F8F9FB),
                          Color(0xFFF8F9FB),
                        ],
                        stops: [0.0, 0.22, 0.40, 0.58, 0.74, 0.88, 1.0],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(
            bottom:
                20, // Positioned approx 20 logical px above bottom safe area
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 220, // Compact, proportionate two-item navigation pill
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.surface, // Pure White #FFFFFF
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    width: 1.0,
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x180F172A),
                      blurRadius: 18,
                      offset: Offset(0, 6),
                    ),
                    BoxShadow(
                      color: Color(0x0C0F172A),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: Theme(
                    data: Theme.of(context).copyWith(
                      splashColor: Colors.transparent,
                      highlightColor: Colors.transparent,
                    ),
                    child: BottomNavigationBar(
                      currentIndex: _currentIndex,
                      onTap: _onTabTapped,
                      backgroundColor: AppColors.surface,
                      selectedItemColor: AppColors.brandRed,
                      unselectedItemColor: AppColors.pureBlack,
                      selectedLabelStyle: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: AppColors.brandRed,
                      ),
                      unselectedLabelStyle: GoogleFonts.poppins(
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                        color: AppColors.pureBlack,
                      ),
                      type: BottomNavigationBarType.fixed,
                      elevation: 0,
                      items: const [
                        BottomNavigationBarItem(
                          icon: Icon(Icons.home_outlined, size: 22),
                          activeIcon: Icon(Icons.home_rounded, size: 22),
                          label: 'Home',
                        ),
                        BottomNavigationBarItem(
                          icon: Icon(Icons.person_outline_rounded, size: 22),
                          activeIcon: Icon(Icons.person_rounded, size: 22),
                          label: 'Account',
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
}
