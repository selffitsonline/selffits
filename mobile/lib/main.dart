import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'features/notifications/services/fcm_push_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enforce system overlay style: transparent status bar with dark icons for light background
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize native Firebase push services safely (fails gracefully if unconfigured)
  await FcmPushService.instance.initialize();

  runApp(const ProviderScope(child: SelffitsApp()));
}
