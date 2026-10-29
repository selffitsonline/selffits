import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/design_system/design_system.dart';
import '../providers/notification_provider.dart';
import 'notifications_screen.dart';

/// Notification action button with unread count badge.
/// Designed for AppBars across Public, Student and Coach screens.
/// Features an elegant, modern outline bell with thin clean stroke and refined accent colour.
class NotificationBadgeButton extends ConsumerWidget {
  final Color? iconColor;

  const NotificationBadgeButton({super.key, this.iconColor});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationsProvider);
    final count = state.unreadCount;

    return Stack(
      alignment: Alignment.center,
      children: [
        IconButton(
          icon: Icon(
            CupertinoIcons.bell,
            color: iconColor ?? AppColors.brandBlue,
            size: 26.0,
          ),
          splashRadius: 22,
          constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
          tooltip: 'Notifications',
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const NotificationsScreen()),
            );
          },
        ),
        if (count > 0)
          Positioned(
            top: 6,
            right: 6,
            child: IgnorePointer(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 5,
                  vertical: 1.5,
                ),
                decoration: BoxDecoration(
                  color: AppColors.brandRed,
                  borderRadius: AppRadii.pillBorderRadius,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
                constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                child: Center(
                  child: Text(
                    count > 99 ? '99+' : count.toString(),
                    style: AppTypography.bodySmall.copyWith(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      height: 1.1,
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
