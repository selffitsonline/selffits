import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Contract for secure key-value credential storage.
abstract class ISecureStorageService {
  Future<void> saveSession({
    required String token,
    required String userId,
    required String email,
    required String name,
    required String role,
  });

  Future<String?> getAccessToken();
  Future<Map<String, String?>> getUserData();
  Future<bool> hasToken();
  Future<void> clearSession();

  Future<bool> hasCompletedOnboarding();
  Future<void> setCompletedOnboarding(bool completed);
  Future<String?> getCachedCatalog();
  Future<void> saveCachedCatalog(String catalogJson);
}

/// Production implementation using platform-backed hardware-backed encryption:
/// - iOS: Apple Keychain (first_unlock accessibility)
/// - Android: EncryptedSharedPreferences (AES-256 GCM backed by Android Keystore)
class FlutterSecureStorageService implements ISecureStorageService {
  static const String _keyToken = 'selffits_mobile_access_token';
  static const String _keyUserId = 'selffits_mobile_user_id';
  static const String _keyEmail = 'selffits_mobile_user_email';
  static const String _keyName = 'selffits_mobile_user_name';
  static const String _keyRole = 'selffits_mobile_user_role';
  static const String _keyHasOnboarded = 'selffits_mobile_has_onboarded';
  static const String _keyCachedCatalog = 'selffits_mobile_cached_catalog';

  final FlutterSecureStorage _storage;

  // In-memory credential cache to guarantee immediate availability and eliminate disk race conditions
  String? _cachedToken;
  String? _cachedUserId;
  String? _cachedEmail;
  String? _cachedName;
  String? _cachedRole;
  bool? _cachedHasOnboarded;

  FlutterSecureStorageService({FlutterSecureStorage? storage})
    : _storage =
          storage ??
          const FlutterSecureStorage(
            aOptions: AndroidOptions(
              encryptedSharedPreferences: true,
              resetOnError: true,
            ),
            iOptions: IOSOptions(
              accessibility: KeychainAccessibility.first_unlock,
            ),
          );

  @override
  Future<void> saveSession({
    required String token,
    required String userId,
    required String email,
    required String name,
    required String role,
  }) async {
    _cachedToken = token;
    _cachedUserId = userId;
    _cachedEmail = email;
    _cachedName = name;
    _cachedRole = role;

    try {
      await _storage.write(key: _keyToken, value: token);
      await _storage.write(key: _keyUserId, value: userId);
      await _storage.write(key: _keyEmail, value: email);
      await _storage.write(key: _keyName, value: name);
      await _storage.write(key: _keyRole, value: role);
      await _storage.write(key: _keyHasOnboarded, value: 'true');
    } catch (_) {}
  }

  @override
  Future<String?> getAccessToken() async {
    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      return _cachedToken;
    }
    try {
      final token = await _storage
          .read(key: _keyToken)
          .timeout(const Duration(seconds: 3));
      if (token != null && token.isNotEmpty) {
        _cachedToken = token;
      }
      return token;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Map<String, String?>> getUserData() async {
    if (_cachedUserId != null) {
      return {
        'id': _cachedUserId,
        'email': _cachedEmail,
        'name': _cachedName,
        'role': _cachedRole,
      };
    }
    try {
      final id = await _storage.read(key: _keyUserId);
      final email = await _storage.read(key: _keyEmail);
      final name = await _storage.read(key: _keyName);
      final role = await _storage.read(key: _keyRole);

      _cachedUserId = id;
      _cachedEmail = email;
      _cachedName = name;
      _cachedRole = role;

      return {'id': id, 'email': email, 'name': name, 'role': role};
    } catch (_) {
      return {'id': null, 'email': null, 'name': null, 'role': null};
    }
  }

  @override
  Future<bool> hasToken() async {
    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      return true;
    }
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  @override
  Future<void> clearSession() async {
    _cachedToken = null;
    _cachedUserId = null;
    _cachedEmail = null;
    _cachedName = null;
    _cachedRole = null;

    // Strictly delete session credentials only; preserve onboarding and cached catalog
    try {
      await _storage.delete(key: _keyToken);
      await _storage.delete(key: _keyUserId);
      await _storage.delete(key: _keyEmail);
      await _storage.delete(key: _keyName);
      await _storage.delete(key: _keyRole);
    } catch (_) {}
  }

  @override
  Future<bool> hasCompletedOnboarding() async {
    if (_cachedHasOnboarded != null) {
      return _cachedHasOnboarded!;
    }
    try {
      final val = await _storage
          .read(key: _keyHasOnboarded)
          .timeout(const Duration(seconds: 8));
      final completed = val == 'true';
      _cachedHasOnboarded = completed;
      return completed;
    } catch (_) {
      return _cachedHasOnboarded ?? false;
    }
  }

  @override
  Future<void> setCompletedOnboarding(bool completed) async {
    _cachedHasOnboarded = completed;
    try {
      await _storage
          .write(key: _keyHasOnboarded, value: completed ? 'true' : 'false')
          .timeout(const Duration(seconds: 8));
    } catch (_) {}
  }

  @override
  Future<String?> getCachedCatalog() async {
    try {
      return await _storage
          .read(key: _keyCachedCatalog)
          .timeout(const Duration(seconds: 3));
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> saveCachedCatalog(String catalogJson) async {
    try {
      await _storage
          .write(key: _keyCachedCatalog, value: catalogJson)
          .timeout(const Duration(seconds: 3));
    } catch (_) {}
  }
}

/// In-memory implementation used for automated headless unit and widget testing.
class InMemorySecureStorageService implements ISecureStorageService {
  final Map<String, String> _data = {};

  @override
  Future<void> saveSession({
    required String token,
    required String userId,
    required String email,
    required String name,
    required String role,
  }) async {
    _data['token'] = token;
    _data['id'] = userId;
    _data['email'] = email;
    _data['name'] = name;
    _data['role'] = role;
    _data['selffits_mobile_has_onboarded'] = 'true';
  }

  @override
  Future<String?> getAccessToken() async {
    return _data['token'];
  }

  @override
  Future<Map<String, String?>> getUserData() async {
    return {
      'id': _data['id'],
      'email': _data['email'],
      'name': _data['name'],
      'role': _data['role'],
    };
  }

  @override
  Future<bool> hasToken() async {
    final token = _data['token'];
    return token != null && token.isNotEmpty;
  }

  @override
  Future<void> clearSession() async {
    // Strictly clear session credentials; preserve onboarding and cached catalog
    _data.remove('token');
    _data.remove('id');
    _data.remove('email');
    _data.remove('name');
    _data.remove('role');
  }

  @override
  Future<bool> hasCompletedOnboarding() async {
    return _data['selffits_mobile_has_onboarded'] == 'true';
  }

  @override
  Future<void> setCompletedOnboarding(bool completed) async {
    _data['selffits_mobile_has_onboarded'] = completed ? 'true' : 'false';
  }

  @override
  Future<String?> getCachedCatalog() async {
    return _data['selffits_mobile_cached_catalog'];
  }

  @override
  Future<void> saveCachedCatalog(String catalogJson) async {
    _data['selffits_mobile_cached_catalog'] = catalogJson;
  }
}
