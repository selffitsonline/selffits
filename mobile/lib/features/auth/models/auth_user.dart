/// Model representing the authenticated user profile in the mobile app.
class AuthUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final bool isBlocked;
  final String? image;

  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.isBlocked = false,
    this.image,
  });

  bool get isStudent => role.toUpperCase() == 'STUDENT';
  bool get isCoach => role.toUpperCase() == 'COACH';
  bool get isAdmin => role.toUpperCase() == 'ADMIN';

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'SELFFITS Student',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'STUDENT',
      isBlocked: json['isBlocked'] as bool? ?? false,
      image: json['image'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'isBlocked': isBlocked,
      'image': image,
    };
  }
}
