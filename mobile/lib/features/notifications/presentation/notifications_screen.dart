import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/design_system/design_system.dart';
import '../models/notification_item.dart';
import '../providers/notification_provider.dart';
import '../services/deep_link_navigator.dart';

/// Notifications Feed Screen built with SELFFITS Luxury White Design System.
/// Provides:
/// - Real-time push & in-app updates feed
/// - Visual unread status indicators
/// - Permission denied status alert with resolution prompt
/// - Interactive deep links (Google Meet launch, schedule links)
/// - Mark as read / Mark all as read actions
class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationsProvider.notifier).loadNotifications();
      ref.read(notificationsProvider.notifier).checkPermission();
    });
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'class_reminder':
        return Icons.alarm_on_rounded;
      case 'schedule_change':
        return Icons.event_repeat_rounded;
      case 'class_cancelled':
        return Icons.event_busy_rounded;
      case 'announcement':
        return Icons.campaign_rounded;
      case 'enrollment_update':
        return Icons.verified_user_rounded;
      default:
        return Icons.notifications_active_outlined;
    }
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'class_reminder':
        return AppColors.brandRed;
      case 'schedule_change':
        return AppColors.brandBlue;
      case 'class_cancelled':
        return AppColors.errorRose;
      case 'announcement':
        return AppColors.brandBlue;
      case 'enrollment_update':
        return AppColors.liveEmerald;
      default:
        return AppColors.textPrimary;
    }
  }

  Future<void> _handleAction(NotificationItem item) async {
    // 1. Mark as read
    if (!item.isRead) {
      await ref.read(notificationsProvider.notifier).markAsRead(item.id);
    }

    // 2. Handle meetingUrl or deepLink
    if (item.meetingUrl != null && item.meetingUrl!.isNotEmpty) {
      final uri = Uri.tryParse(item.meetingUrl!);
      if (uri != null) {
        try {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          return;
        } catch (_) {}
      }
    }

    if (item.deepLink != null && item.deepLink!.isNotEmpty) {
      await DeepLinkNavigator.navigate(
        deepLink: item.deepLink!,
        onOpenMeeting: (url) async {
          final uri = Uri.tryParse(url);
          if (uri != null) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
        },
        onOpenNotifications: () {},
      );
    }
  }

  String _formatTimestamp(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);

    if (diff.inSeconds < 60) {
      return 'Just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return '${dt.day}/${dt.month}/${dt.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Notifications', style: AppTypography.headlineMedium),
        centerTitle: false,
        actions: [
          if (state.notifications.isNotEmpty && state.unreadCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: TextButton(
                onPressed: () {
                  ref.read(notificationsProvider.notifier).markAllAsRead();
                },
                child: Text(
                  'Mark all read',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.brandBlue,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.brandRed,
          backgroundColor: AppColors.surface,
          onRefresh: () =>
              ref.read(notificationsProvider.notifier).loadNotifications(),
          child: ListView(
            padding: AppSpacing.screenPadding,
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              // Permission Denied / Unavailable Banner
              if (state.permissionStatus ==
                      NotificationPermissionStatus.denied ||
                  state.permissionStatus ==
                      NotificationPermissionStatus.unavailable) ...[
                Container(
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.brandRedLight,
                    borderRadius: AppRadii.mdBorderRadius,
                    border: Border.all(
                      color: AppColors.brandRed.withValues(alpha: 0.25),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.notifications_off_outlined,
                        color: AppColors.brandRed,
                        size: 24,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Push Notifications Disabled',
                              style: AppTypography.titleMedium.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xxs),
                            Text(
                              'Enable notifications in your device settings to receive 15-minute live class reminders and schedule changes.',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            GestureDetector(
                              onTap: () {
                                ref
                                    .read(notificationsProvider.notifier)
                                    .requestPermission();
                              },
                              child: Text(
                                'Enable Notifications →',
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.brandRed,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Loading State
              if (state.isLoading && state.notifications.isEmpty) ...[
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.xxl),
                  child: Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 2.4,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.brandRed,
                      ),
                    ),
                  ),
                ),
              ] else if (state.notifications.isEmpty) ...[
                // Empty State
                Padding(
                  padding: const EdgeInsets.symmetric(
                    vertical: AppSpacing.xxl * 1.5,
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: const BoxDecoration(
                            color: AppColors.surfaceSecondary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.notifications_none_rounded,
                            size: 32,
                            color: AppColors.textTertiary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          'No Notifications Yet',
                          style: AppTypography.headlineLarge,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Live class reminders, schedule changes, and academy announcements will appear here.',
                          textAlign: TextAlign.center,
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                // Notifications List
                ...state.notifications.map((item) {
                  final typeColor = _getColorForType(item.type);
                  final typeIcon = _getIconForType(item.type);

                  return Container(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: item.isRead
                          ? AppColors.surface
                          : AppColors.brandBlueLight.withValues(alpha: 0.35),
                      borderRadius: AppRadii.mdBorderRadius,
                      border: Border.all(
                        color: item.isRead
                            ? AppColors.borderLight
                            : AppColors.brandBlue.withValues(alpha: 0.25),
                        width: item.isRead ? 1 : 1.5,
                      ),
                      boxShadow: AppColors.shadowCard,
                    ),
                    child: InkWell(
                      borderRadius: AppRadii.mdBorderRadius,
                      onTap: () => _handleAction(item),
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Type icon badge
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: typeColor.withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(typeIcon, color: typeColor, size: 20),
                            ),
                            const SizedBox(width: AppSpacing.md),

                            // Content
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          item.title,
                                          style: AppTypography.titleMedium
                                              .copyWith(
                                                fontWeight: item.isRead
                                                    ? FontWeight.w600
                                                    : FontWeight.w700,
                                              ),
                                        ),
                                      ),
                                      if (!item.isRead) ...[
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: AppColors.brandRed,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    item.message,
                                    style: AppTypography.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.xs),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _formatTimestamp(item.createdAt),
                                        style: AppTypography.bodySmall.copyWith(
                                          color: AppColors.textTertiary,
                                          fontSize: 11,
                                        ),
                                      ),
                                      if (item.meetingUrl != null &&
                                          item.meetingUrl!.isNotEmpty)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: AppSpacing.sm,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: AppColors.brandRed,
                                            borderRadius:
                                                AppRadii.smBorderRadius,
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(
                                                Icons.video_call_rounded,
                                                size: 14,
                                                color: Colors.white,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                'Join Class',
                                                style: AppTypography.bodySmall
                                                    .copyWith(
                                                      color: Colors.white,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                      fontSize: 11,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
