enum NotificationPermissionStatus {
  granted,
  denied,
  unavailable,
  notDetermined;

  bool get isGranted => this == NotificationPermissionStatus.granted;
  bool get isDenied => this == NotificationPermissionStatus.denied;
  bool get isUnavailable => this == NotificationPermissionStatus.unavailable;
}

/// Representation of an in-app and remote push notification item.
class NotificationItem {
  final String id;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;
  final String type;
  final String? deepLink;
  final String? meetingUrl;
  final String? batchId;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
    this.type = 'general',
    this.deepLink,
    this.meetingUrl,
    this.batchId,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    if (json['createdAt'] is String) {
      parsedDate =
          DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return NotificationItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Notification',
      message: json['message'] as String? ?? '',
      isRead: json['isRead'] as bool? ?? false,
      createdAt: parsedDate,
      type: json['type'] as String? ?? 'general',
      deepLink: json['deepLink'] as String?,
      meetingUrl: json['meetingUrl'] as String?,
      batchId: json['batchId'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'message': message,
    'isRead': isRead,
    'createdAt': createdAt.toIso8601String(),
    'type': type,
    'deepLink': deepLink,
    'meetingUrl': meetingUrl,
    'batchId': batchId,
  };

  NotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    bool? isRead,
    DateTime? createdAt,
    String? type,
    String? deepLink,
    String? meetingUrl,
    String? batchId,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      type: type ?? this.type,
      deepLink: deepLink ?? this.deepLink,
      meetingUrl: meetingUrl ?? this.meetingUrl,
      batchId: batchId ?? this.batchId,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NotificationItem &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          isRead == other.isRead;

  @override
  int get hashCode => id.hashCode ^ isRead.hashCode;
}

/// Payload received from FCM / APNs remote push messages.
class PushNotificationPayload {
  final String title;
  final String body;
  final String type;
  final String? deepLink;
  final String? meetingUrl;
  final String? batchId;
  final DateTime createdAt;

  const PushNotificationPayload({
    required this.title,
    required this.body,
    this.type = 'general',
    this.deepLink,
    this.meetingUrl,
    this.batchId,
    required this.createdAt,
  });

  factory PushNotificationPayload.fromData(Map<String, dynamic> data) {
    return PushNotificationPayload(
      title: data['title'] as String? ?? 'Selffits Academy',
      body: data['body'] as String? ?? '',
      type: data['type'] as String? ?? 'general',
      deepLink: data['deepLink'] as String?,
      meetingUrl: data['meetingUrl'] as String?,
      batchId: data['batchId'] as String?,
      createdAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toData() => {
    'title': title,
    'body': body,
    'type': type,
    'deepLink': deepLink,
    'meetingUrl': meetingUrl,
    'batchId': batchId,
  };
}
