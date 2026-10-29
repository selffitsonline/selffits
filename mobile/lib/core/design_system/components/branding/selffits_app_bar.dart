import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../features/notifications/presentation/notification_badge_button.dart';
import '../../tokens/app_colors.dart';
import 'selffits_logo.dart';

/// Reusable branded header AppBar for SELFFITS Mobile.
/// Enforces pixel-perfect visual consistency across Public Home, Student, and Coach portals:
/// - 56px standard toolbar height
/// - AppColors.background (#F8F9FB) with dual diffused elevation ambient shadow
/// - Centered or aligned SelfFits branded logo (23px height)
/// - Integrated NotificationBadgeButton with unread count indicator
/// - Dark status bar icons on transparent system overlay
class SelffitsAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Widget? title;
  final Widget? leading;
  final List<Widget>? actions;
  final bool automaticallyImplyLeading;
  final bool centerTitle;
  final double? titleSpacing;

  const SelffitsAppBar({
    super.key,
    this.title,
    this.leading,
    this.actions,
    this.automaticallyImplyLeading = true,
    this.centerTitle = false,
    this.titleSpacing = 16,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        boxShadow: [
          BoxShadow(
            color: Color(0x1C0F172A),
            blurRadius: 10,
            offset: Offset(0, 3.5),
          ),
          BoxShadow(
            color: Color(0x0F0F172A),
            blurRadius: 3,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        toolbarHeight: 56,
        centerTitle: centerTitle,
        titleSpacing: titleSpacing,
        automaticallyImplyLeading: automaticallyImplyLeading,
        leading: leading,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        title:
            title ??
            const SelffitsLogo(
              height: 23,
              showText: false,
              fit: BoxFit.contain,
            ),
        actions:
            actions ??
            const [
              Padding(
                padding: EdgeInsets.only(right: 8),
                child: NotificationBadgeButton(),
              ),
            ],
      ),
    );
  }
}
