import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/student_dashboard_data.dart';

/// Repository responsible for loading student live class and schedule readiness
/// directly from the authoritative Next.js / PostgreSQL backend.
class StudentRepository {
  final ApiClient apiClient;
  final ISecureStorageService secureStorage;

  StudentRepository({required this.apiClient, required this.secureStorage});

  /// No-op backward compatibility stub.
  void clearDemoEnrollment() {}

  /// Fetches real-time student class readiness from GET /api/v1/student/dashboard.
  /// Strictly returns authoritative database-backed data without any synthetic demo overlays.
  Future<StudentDashboardData> getDashboard({String? token}) async {
    final effectiveToken = token ?? await secureStorage.getAccessToken();
    if (effectiveToken == null || effectiveToken.isEmpty) {
      throw const TokenExpiredException();
    }

    final responseData = await apiClient.get(
      ApiEndpoints.studentDashboard,
      token: effectiveToken,
    );

    return StudentDashboardData.fromJson(responseData);
  }

  /// Validates a coupon code with live server-side validation.
  /// Strictly requires real backend validation; never fabricates local demo discounts.
  Future<CouponResult> validateCoupon({
    required String code,
    required double currentAmount,
  }) async {
    final token = await secureStorage.getAccessToken();

    try {
      final responseData = await apiClient.post(
        ApiEndpoints.validateCoupon,
        body: {'code': code.trim(), 'currentAmount': currentAmount},
        token: token,
      );

      return CouponResult.fromJson(responseData);
    } on ApiException catch (e) {
      if (e.statusCode == 404) {
        return CouponResult.failure(
          'Coupon validation service is currently unavailable.',
        );
      }
      return CouponResult.failure(e.message);
    } catch (_) {
      return CouponResult.failure(
        'Unable to validate coupon. Please check your connection.',
      );
    }
  }

  /// Submits student enrollment to the authoritative backend endpoint POST /api/v1/student/enroll.
  /// Never fabricates in-memory demo records or false payment activations.
  Future<EnrollmentResult> enrollStudent({
    required String programCategory,
    required String audienceGroup,
    required int daysPerWeek,
    required List<String> selectedDays,
    required String batchId,
    String? batchTiming,
    String? martialArtsType,
    required bool includeDietNutrition,
    String? couponCode,
    String paymentMethod = 'card',
    String currency = 'USD',
    double? amountPaid,
    bool isDemo = false,
    String? razorpayOrderId,
    String? razorpayPaymentId,
    String? razorpaySignature,
    Map<String, dynamic>? directCard,
  }) async {
    final token = await secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw const TokenExpiredException();
    }

    try {
      final responseData = await apiClient.post(
        ApiEndpoints.studentEnroll,
        body: {
          'programCategory': programCategory,
          'audienceGroup': audienceGroup,
          'daysPerWeek': daysPerWeek,
          'selectedDays': selectedDays,
          'batchId': batchId,
          if (martialArtsType != null && martialArtsType.isNotEmpty)
            'martialArtsType': martialArtsType,
          'includeDietNutrition': includeDietNutrition,
          if (couponCode != null && couponCode.trim().isNotEmpty)
            'couponCode': couponCode.trim(),
          'paymentMethod': paymentMethod,
          'currency': currency,
          if (razorpayOrderId != null && razorpayOrderId.isNotEmpty)
            'razorpayOrderId': razorpayOrderId,
          if (razorpayPaymentId != null && razorpayPaymentId.isNotEmpty)
            'razorpayPaymentId': razorpayPaymentId,
          if (razorpaySignature != null && razorpaySignature.isNotEmpty)
            'razorpaySignature': razorpaySignature,
          if (directCard != null) 'directCard': directCard,
        },
        token: token,
      );

      return EnrollmentResult.fromJson(responseData);
    } on ApiException catch (e) {
      if (e.statusCode == 404) {
        return EnrollmentResult.failure(
          'Server endpoint unavailable (HTTP 404). Backend service is not deployed.',
        );
      }
      return EnrollmentResult.failure(e.message);
    } catch (_) {
      return EnrollmentResult.failure(
        'Enrollment request could not be completed. Please check your connection.',
      );
    }
  }

  /// Creates a Payment Gateway Order on the server (POST /api/v1/payments/create-order)
  Future<PaymentOrderResult> createPaymentOrder({
    required String programCategory,
    required String audienceGroup,
    required int daysPerWeek,
    required List<String> selectedDays,
    required String batchId,
    bool includeDietNutrition = false,
    String? couponCode,
    String currency = 'USD',
  }) async {
    final token = await secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw const TokenExpiredException();
    }

    try {
      final responseData = await apiClient.post(
        ApiEndpoints.createPaymentOrder,
        body: {
          'programCategory': programCategory,
          'audienceGroup': audienceGroup,
          'daysPerWeek': daysPerWeek,
          'selectedDays': selectedDays,
          'batchId': batchId,
          'includeDietNutrition': includeDietNutrition,
          if (couponCode != null && couponCode.trim().isNotEmpty)
            'couponCode': couponCode.trim(),
          'currency': currency,
        },
        token: token,
      );

      return PaymentOrderResult.fromJson(responseData);
    } on ApiException catch (e) {
      return PaymentOrderResult.failure(e.message);
    } catch (_) {
      return PaymentOrderResult.failure(
        'Unable to initialize payment gateway order. Please check your connection.',
      );
    }
  }

  /// Authorizes test payment through the configured gateway's official test flow (POST /api/v1/payments/test-checkout)
  Future<GatewayAuthorizationResult> processTestPayment({
    required String orderId,
    required String cardNumber,
    required String cardExpiry,
    required String cardCvv,
  }) async {
    final token = await secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw const TokenExpiredException();
    }

    try {
      final responseData = await apiClient.post(
        ApiEndpoints.testPaymentCheckout,
        body: {
          'orderId': orderId,
          'cardNumber': cardNumber,
          'cardExpiry': cardExpiry,
          'cardCvv': cardCvv,
        },
        token: token,
      );

      return GatewayAuthorizationResult.fromJson(responseData);
    } on ApiException catch (e) {
      return GatewayAuthorizationResult.failure(e.message);
    } catch (_) {
      return GatewayAuthorizationResult.failure(
        'Payment gateway test authorization failed. Please check your connection.',
      );
    }
  }
}

class EnrollmentResult {
  final bool success;
  final String? enrollmentId;
  final String? programTitle;
  final String? tierName;
  final double? amountPaid;
  final String? currency;
  final String? status;
  final String? martialArtsType;
  final String? batchName;
  final String? classTiming;
  final int? daysPerWeek;
  final List<String> selectedDays;
  final int? remainingClasses;
  final int? totalClassesGranted;
  final String? errorMessage;
  final bool isDemo;

  const EnrollmentResult({
    required this.success,
    this.enrollmentId,
    this.programTitle,
    this.tierName,
    this.amountPaid,
    this.currency,
    this.status,
    this.martialArtsType,
    this.batchName,
    this.classTiming,
    this.daysPerWeek,
    this.selectedDays = const [],
    this.remainingClasses,
    this.totalClassesGranted,
    this.errorMessage,
    this.isDemo = false,
  });

  factory EnrollmentResult.fromJson(Map<String, dynamic> json) {
    return EnrollmentResult(
      success: true,
      enrollmentId: json['enrollmentId'] as String?,
      programTitle: json['programTitle'] as String?,
      tierName: json['tierName'] as String?,
      amountPaid: (json['amountPaid'] as num?)?.toDouble(),
      currency: json['currency'] as String?,
      status: json['status'] as String?,
      martialArtsType: json['martialArtsType'] as String?,
      batchName: json['batchName'] as String?,
      classTiming: json['classTiming'] as String?,
      daysPerWeek: json['daysPerWeek'] as int?,
      selectedDays:
          (json['selectedDays'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      remainingClasses: json['remainingClasses'] as int?,
      totalClassesGranted: json['totalClassesGranted'] as int?,
      isDemo: json['isDemo'] as bool? ?? false,
    );
  }

  factory EnrollmentResult.failure(String message) {
    return EnrollmentResult(success: false, errorMessage: message);
  }
}

class CouponResult {
  final bool success;
  final String? code;
  final String? discountType;
  final double discountValue;
  final double discountAmount;
  final double finalAmount;
  final double originalAmount;
  final String? description;
  final String? errorMessage;

  const CouponResult({
    required this.success,
    this.code,
    this.discountType,
    this.discountValue = 0,
    this.discountAmount = 0,
    this.finalAmount = 0,
    this.originalAmount = 0,
    this.description,
    this.errorMessage,
  });

  factory CouponResult.fromJson(Map<String, dynamic> json) {
    return CouponResult(
      success: true,
      code: json['code'] as String?,
      discountType: json['discountType'] as String?,
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0,
      finalAmount: (json['finalAmount'] as num?)?.toDouble() ?? 0,
      originalAmount: (json['originalAmount'] as num?)?.toDouble() ?? 0,
      description: json['description'] as String?,
    );
  }

  factory CouponResult.failure(String message) {
    return CouponResult(success: false, errorMessage: message);
  }
}

class PaymentOrderResult {
  final bool success;
  final String? orderId;
  final double amount;
  final String? currency;
  final String? keyId;
  final bool isTestMode;
  final String? errorMessage;

  const PaymentOrderResult({
    required this.success,
    this.orderId,
    this.amount = 0,
    this.currency,
    this.keyId,
    this.isTestMode = false,
    this.errorMessage,
  });

  factory PaymentOrderResult.fromJson(Map<String, dynamic> json) {
    return PaymentOrderResult(
      success: true,
      orderId: json['orderId'] as String?,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String?,
      keyId: json['keyId'] as String?,
      isTestMode: json['isTestMode'] as bool? ?? false,
    );
  }

  factory PaymentOrderResult.failure(String message) {
    return PaymentOrderResult(success: false, errorMessage: message);
  }
}

class GatewayAuthorizationResult {
  final bool success;
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final String? razorpaySignature;
  final String? errorMessage;

  const GatewayAuthorizationResult({
    required this.success,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    this.razorpaySignature,
    this.errorMessage,
  });

  factory GatewayAuthorizationResult.fromJson(Map<String, dynamic> json) {
    return GatewayAuthorizationResult(
      success: true,
      razorpayOrderId: json['razorpayOrderId'] as String?,
      razorpayPaymentId: json['razorpayPaymentId'] as String?,
      razorpaySignature: json['razorpaySignature'] as String?,
    );
  }

  factory GatewayAuthorizationResult.failure(String message) {
    return GatewayAuthorizationResult(success: false, errorMessage: message);
  }
}
