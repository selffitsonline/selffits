import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/network/api_exceptions.dart';
import '../models/registration_payload.dart';
import '../providers/auth_provider.dart';
import 'email_verification_screen.dart';

/// Supported Country definition with ISO code, dial code, and flag emoji.
class CountryData {
  final String name;
  final String code;
  final String dialCode;
  final String flag;

  const CountryData({
    required this.name,
    required this.code,
    required this.dialCode,
    required this.flag,
  });
}

/// Established supported countries list matching Selffits international academy reach.
const List<CountryData> kSupportedCountries = [
  CountryData(name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳'),
  CountryData(name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸'),
  CountryData(name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧'),
  CountryData(name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦'),
  CountryData(
    name: 'United Arab Emirates',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
  ),
  CountryData(
    name: 'Saudi Arabia',
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
  ),
  CountryData(name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬'),
  CountryData(name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺'),
  CountryData(name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿'),
  CountryData(name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪'),
  CountryData(name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷'),
  CountryData(name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦'),
  CountryData(name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼'),
  CountryData(name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲'),
  CountryData(name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭'),
  CountryData(name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾'),
  CountryData(name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭'),
  CountryData(name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦'),
];

/// Refined SELFFITS Mobile Student Registration Screen.
/// Strictly adheres to the professional design language established on the updated login screen:
/// - Pure white #FFFFFF background across all steps with transparent status bar and white system nav bar.
/// - Direct layout on the white background without large enclosing form or programme cards.
/// - Left-aligned dark navy headings (Popppins 800), muted supporting text, red primary actions.
/// - Proper country dropdown with flag and auto country-code synchronization.
/// - Polished interactive selection rows with prominent check/radio indicators.
/// - Red Continue buttons with clearly visible right-pointing arrow icons.
/// - Preserves the entire four-step registration flow, all questionnaire options, validation, and APIs.
class StudentRegistrationScreen extends ConsumerStatefulWidget {
  final String initialProgram;

  const StudentRegistrationScreen({
    super.key,
    this.initialProgram = 'MARTIAL_ARTS',
  });

  @override
  ConsumerState<StudentRegistrationScreen> createState() =>
      _StudentRegistrationScreenState();
}

class _StudentRegistrationScreenState
    extends ConsumerState<StudentRegistrationScreen> {
  // Step 0: Program, 1: Contact Details, 2: Student Type, 3: Programme Questions & Password
  int _currentStep = 0;

  final _contactFormKey = GlobalKey<FormState>();
  final _questionsFormKey = GlobalKey<FormState>();

  // State: Program Choice (Step 0)
  late String _registeredProgram;

  // State: Contact Details (Step 1)
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  CountryData _selectedPhoneCountry = kSupportedCountries.first;
  String _selectedCountry = kSupportedCountries.first.name;

  /// Combines selected calling code and national number according to backend contract
  /// without duplicating any calling code entered by the user.
  String get _fullPhoneNumber {
    final raw = _phoneController.text.trim();
    if (raw.isEmpty) return '';

    final dialCode = _selectedPhoneCountry.dialCode;

    if (raw.startsWith('+')) {
      if (raw.startsWith(dialCode)) {
        final rest = raw.substring(dialCode.length).trim();
        return '$dialCode $rest';
      }
      return raw;
    }

    return '$dialCode $raw';
  }

  // State: Student Type or Age Group (Step 2)
  String _studentType = 'Adult (18+)';
  String _fitnessAgeGroup = 'Adult (18+)';

  // State: Martial Arts Fields (Step 3)
  String _martialArtsLevel = "Beginner — I'm just starting";
  String _trainingGoal = 'Self-defence';
  final _martialWeightController = TextEditingController();

  // State: Weight Management & Fitness Fields (Step 3)
  final _fitnessCurrentWeightController = TextEditingController();
  final _fitnessTargetWeightController = TextEditingController();
  String _fitnessGoal = 'Weight management';
  String _fitnessLevel = 'Beginner';
  String _workoutFrequency = '3 days per week';

  // State: Account Security (Step 4)
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _registeredProgram = widget.initialProgram;
    _initCountryAndPhoneCode();
  }

  void _initCountryAndPhoneCode() {
    try {
      final localeCountryCode =
          WidgetsBinding.instance.platformDispatcher.locale.countryCode;
      if (localeCountryCode != null && localeCountryCode.isNotEmpty) {
        final match = kSupportedCountries.firstWhere(
          (c) => c.code.toUpperCase() == localeCountryCode.toUpperCase(),
          orElse: () => kSupportedCountries.first,
        );
        _selectedCountry = match.name;
        _selectedPhoneCountry = match;
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _martialWeightController.dispose();
    _fitnessCurrentWeightController.dispose();
    _fitnessTargetWeightController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _nextStep() {
    setState(() {
      _errorMessage = null;
    });

    if (_currentStep == 0) {
      setState(() {
        _currentStep = 1;
      });
      return;
    }

    if (_currentStep == 1) {
      if (!_contactFormKey.currentState!.validate()) {
        return;
      }
      setState(() {
        _currentStep = 2;
      });
      return;
    }

    if (_currentStep == 2) {
      setState(() {
        _currentStep = 3;
      });
      return;
    }

    if (_currentStep == 3) {
      _submitRegistration();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _errorMessage = null;
        _currentStep -= 1;
      });
    } else {
      Navigator.of(context).pop();
    }
  }

  Future<void> _submitRegistration() async {
    if (!_questionsFormKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final isMartial = _registeredProgram == 'MARTIAL_ARTS';

    final double? currentWeight = isMartial
        ? double.tryParse(_martialWeightController.text.trim())
        : double.tryParse(_fitnessCurrentWeightController.text.trim());

    final double? targetWeight = isMartial
        ? null
        : double.tryParse(_fitnessTargetWeightController.text.trim());

    final payload = RegistrationPayload(
      registeredProgram: _registeredProgram,
      fullName: _fullNameController.text.trim(),
      email: _emailController.text.trim().toLowerCase(),
      phone: _fullPhoneNumber,
      country: _selectedCountry,
      password: _passwordController.text,
      confirmPassword: _confirmPasswordController.text,
      studentType: isMartial ? _studentType : null,
      martialArtsLevel: isMartial ? _martialArtsLevel : null,
      trainingGoal: isMartial ? _trainingGoal : null,
      currentWeightKg: currentWeight,
      ageGroup: !isMartial ? _fitnessAgeGroup : null,
      targetWeightKg: targetWeight,
      fitnessGoal: !isMartial ? _fitnessGoal : null,
      fitnessLevel: !isMartial ? _fitnessLevel : null,
      workoutFrequency: !isMartial ? _workoutFrequency : null,
    );

    try {
      final repository = ref.read(authRepositoryProvider);
      final result = await repository.registerStudent(payload);

      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });

        // Navigate to Email Verification Screen
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (routeContext) => EmailVerificationScreen(
              email: result.email,
              emailDeliveryWarning: result.emailDeliveryWarning,
              onGoToLogin: () {
                Navigator.of(routeContext).popUntil((route) => route.isFirst);
              },
            ),
          ),
        );
      }
    } on DuplicateEmailException catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.message;
        });
      }
    } on RateLimitException catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.message;
        });
      }
    } on ValidationException catch (e) {
      if (mounted) {
        final firstFieldMsg = e.fieldErrors.values.firstOrNull?.firstOrNull;
        setState(() {
          _isSubmitting = false;
          _errorMessage = firstFieldMsg ?? e.message;
        });
      }
    } on NetworkConnectionException catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.message;
        });
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.message;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = 'An unexpected error occurred. Please try again.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
        systemNavigationBarDividerColor: Colors.transparent,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          bottom: false,
          child: Column(
            children: [
              // Top Navigation Header (Stationary, never scrolls)
              _buildHeader(),

              // Independently Scrollable Form Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 480),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Error Notice Banner
                          if (_errorMessage != null) ...[
                            _buildErrorBanner(),
                            const SizedBox(height: 20),
                          ],

                          // Animated Step Content Transition
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 200),
                            child: KeyedSubtree(
                              key: ValueKey<int>(_currentStep),
                              child: _buildCurrentStepContent(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // Fixed Bottom Action Area (Always visible, respects safe area)
              _buildBottomActionArea(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final hasStepIndicator = _currentStep > 0;
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 24, 8),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: 44,
                child: Row(
                  children: [
                    SizedBox(
                      width: 44,
                      height: 44,
                      child: IconButton(
                        icon: const Icon(
                          Icons.arrow_back_ios_new_rounded,
                          size: 20,
                          color: Color(0xFF0F172A),
                        ),
                        onPressed: _previousStep,
                        tooltip: _currentStep == 0
                            ? 'Back to Login'
                            : 'Previous Step',
                        padding: EdgeInsets.zero,
                        alignment: Alignment.centerLeft,
                      ),
                    ),
                    const Spacer(),
                    if (hasStepIndicator)
                      Text(
                        'Step $_currentStep of 3',
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                  ],
                ),
              ),
              if (hasStepIndicator) ...[
                const SizedBox(height: 8),
                // 3-segment progress indicator
                Row(
                  children: List.generate(3, (index) {
                    final isCompletedOrActive = index < _currentStep;
                    return Expanded(
                      child: Container(
                        height: 3.5,
                        margin: EdgeInsets.only(
                          left: index == 0 ? 0 : 4,
                          right: index == 2 ? 0 : 4,
                        ),
                        decoration: BoxDecoration(
                          color: isCompletedOrActive
                              ? const Color(0xFFE50914)
                              : const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomActionArea() {
    final isFinalStep = _currentStep == 3;
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(24, 12, 24, 12 + bottomInset),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: _buildContinueButton(
            label: isFinalStep ? 'Create Student Profile' : 'Next',
            isLoading: isFinalStep && _isSubmitting,
            onPressed: _isSubmitting
                ? null
                : (isFinalStep ? _submitRegistration : _nextStep),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: const Color(0xFFFCA5A5),
          width: 1.0,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.error_outline_rounded,
            size: 18,
            color: Color(0xFFDC2626),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: GoogleFonts.poppins(
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
                color: const Color(0xFFDC2626),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep0ProgrammeSelection();
      case 1:
        return _buildStep1ContactDetails();
      case 2:
        return _buildStep2StudentType();
      case 3:
        return _buildStep3ProgrammeQuestions();
      default:
        return const SizedBox.shrink();
    }
  }

  // =========================================================================
  // STEP 0: PROGRAMME SELECTION SCREEN
  // Pure white background, clean left-aligned typography, interactive rows,
  // prominent selection indicators, no large enclosing cards.
  // =========================================================================
  Widget _buildStep0ProgrammeSelection() {
    final isMartialSelected = _registeredProgram == 'MARTIAL_ARTS';
    final isFitnessSelected = _registeredProgram == 'WEIGHT_MANAGEMENT_FITNESS';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Join SELFFITS Academy',
          style: GoogleFonts.poppins(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Select your preferred training programme to begin your academy registration.',
          style: GoogleFonts.poppins(
            fontSize: 14.5,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF64748B),
            height: 1.45,
          ),
        ),
        const SizedBox(height: 28),

        // Martial Arts Interactive Selection Row
        _buildProgrammeRow(
          title: 'Martial Arts',
          subtitle: 'Online Martial Arts Academy',
          description:
              'Train authentic martial arts, belt progressions, sparring drills, and self-defence with certified academy senseis.',
          icon: Icons.sports_martial_arts_rounded,
          isSelected: isMartialSelected,
          onTap: () {
            setState(() {
              _registeredProgram = 'MARTIAL_ARTS';
            });
          },
        ),
        const SizedBox(height: 14),

        // Weight Management & Fitness Interactive Selection Row
        _buildProgrammeRow(
          title: 'Weight Management & Fitness',
          subtitle: 'Personalised Fitness Journey',
          description:
              'High-intensity interval training, strength conditioning, fat loss routines, and customized workout frequencies.',
          icon: Icons.fitness_center_rounded,
          isSelected: isFitnessSelected,
          onTap: () {
            setState(() {
              _registeredProgram = 'WEIGHT_MANAGEMENT_FITNESS';
            });
          },
        ),
      ],
    );
  }

  Widget _buildProgrammeRow({
    required String title,
    required String subtitle,
    required String description,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFFEF2F2) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? const Color(0xFFE50914)
                  : const Color(0xFFE2E8F0),
              width: isSelected ? 1.6 : 1.2,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: const Color(0xFFE50914).withValues(alpha: 0.08),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFE50914)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: isSelected ? Colors.white : const Color(0xFF0F172A),
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFE50914),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      description,
                      style: GoogleFonts.poppins(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w400,
                        color: const Color(0xFF64748B),
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected
                      ? const Color(0xFFE50914)
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFFE50914)
                        : const Color(0xFFCBD5E1),
                    width: 2.0,
                  ),
                ),
                child: isSelected
                    ? const Icon(
                        Icons.check_rounded,
                        size: 15,
                        color: Colors.white,
                      )
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // STEP 1: CONTACT DETAILS
  // Full Name, Email Address, Country Dropdown, Phone / WhatsApp
  // Clean layout directly on pure white canvas without enclosing card.
  // =========================================================================
  Widget _buildStep1ContactDetails() {
    final isMartial = _registeredProgram == 'MARTIAL_ARTS';

    return Form(
      key: _contactFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Contact Details',
            style: GoogleFonts.poppins(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Enter your personal contact details for your student profile.',
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 28),

          // Full Name
          _buildTextField(
            label: isMartial ? "Student's Full Name" : 'Full Name',
            hintText: 'Enter full name',
            controller: _fullNameController,
            prefixIcon: const Icon(
              Icons.person_outline_rounded,
              size: 20,
              color: Color(0xFF94A3B8),
            ),
            validator: (value) {
              final trimmed = value?.trim() ?? '';
              if (trimmed.isEmpty) return 'Full name is required.';
              if (trimmed.length < 2) {
                return 'Full name must be at least 2 characters.';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),

          // Email Address
          _buildTextField(
            label: isMartial ? 'Contact Email' : 'Email Address',
            hintText: 'student@example.com',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            prefixIcon: const Icon(
              Icons.mail_outline_rounded,
              size: 20,
              color: Color(0xFF94A3B8),
            ),
            validator: (value) {
              final trimmed = value?.trim() ?? '';
              if (trimmed.isEmpty) return 'Email address is required.';
              if (!trimmed.contains('@') || !trimmed.contains('.')) {
                return 'Please enter a valid email address.';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),

          // Country Dropdown
          _buildCountryDropdown(),
          const SizedBox(height: 20),

          // Phone Number / WhatsApp
          _buildTextField(
            label: 'Phone Number / WhatsApp',
            hintText: '9876543210',
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            prefixIcon: _buildPhoneCodeDropdown(),
            prefixIconConstraints: const BoxConstraints(
              minWidth: 0,
              minHeight: 0,
            ),
            validator: (value) {
              final trimmed = value?.trim() ?? '';
              final dialCode = _selectedPhoneCountry.dialCode;
              if (trimmed.isEmpty ||
                  trimmed == dialCode ||
                  trimmed == '$dialCode ') {
                return 'Phone number is required.';
              }
              final nationalPart = trimmed.startsWith(dialCode)
                  ? trimmed.substring(dialCode.length).trim()
                  : trimmed.replaceAll(RegExp(r'^\+\d+\s*'), '').trim();
              if (nationalPart.length < 5) {
                return 'Please enter a valid phone number.';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  /// Builds the country calling-code dropdown inside the Phone field.
  /// Operates 100% independently from the separate Country field.
  Widget _buildPhoneCodeDropdown() {
    return Container(
      margin: const EdgeInsets.only(left: 12, right: 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonHideUnderline(
            child: DropdownButton<CountryData>(
              value: _selectedPhoneCountry,
              dropdownColor: Colors.white,
              borderRadius: BorderRadius.circular(12),
              isDense: true,
              icon: const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: Color(0xFF0F172A),
                size: 18,
              ),
              items: kSupportedCountries.map((country) {
                return DropdownMenuItem<CountryData>(
                  value: country,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        country.flag,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        country.dialCode,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${country.name})',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              selectedItemBuilder: (context) {
                return kSupportedCountries.map((country) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        country.flag,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        country.dialCode,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(width: 2),
                    ],
                  );
                }).toList();
              },
              onChanged: (newPhoneCountry) {
                if (newPhoneCountry == null ||
                    newPhoneCountry == _selectedPhoneCountry) {
                  return;
                }
                setState(() {
                  final oldDial = _selectedPhoneCountry.dialCode;
                  _selectedPhoneCountry = newPhoneCountry;
                  final current = _phoneController.text.trim();
                  if (current.startsWith(oldDial)) {
                    _phoneController.text =
                        current.substring(oldDial.length).trim();
                  }
                });
              },
            ),
          ),
          const SizedBox(width: 6),
          Container(
            height: 22,
            width: 1.2,
            color: const Color(0xFFE2E8F0),
          ),
          const SizedBox(width: 6),
        ],
      ),
    );
  }

  /// Builds the Country dropdown.
  /// Displays ONLY the country flag and name (no dial code),
  /// and updates only the country of residence without overwriting phone calling codes.
  Widget _buildCountryDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Country',
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _selectedCountry,
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(12),
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Color(0xFF0F172A),
            size: 22,
          ),
          style: GoogleFonts.poppins(
            fontSize: 14.5,
            fontWeight: FontWeight.w500,
            color: const Color(0xFF0F172A),
          ),
          decoration: InputDecoration(
            prefixIcon: const Icon(
              Icons.public_rounded,
              size: 20,
              color: Color(0xFF94A3B8),
            ),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFE2E8F0),
                width: 1.2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFF0F172A),
                width: 1.4,
              ),
            ),
          ),
          items: kSupportedCountries.map((country) {
            return DropdownMenuItem<String>(
              value: country.name,
              child: Row(
                children: [
                  Text(
                    country.flag,
                    style: const TextStyle(fontSize: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      country.name,
                      style: GoogleFonts.poppins(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF0F172A),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: (newCountryName) {
            if (newCountryName == null || newCountryName == _selectedCountry) {
              return;
            }
            setState(() {
              _selectedCountry = newCountryName;
            });
          },
        ),
      ],
    );
  }

  // =========================================================================
  // STEP 2: STUDENT TYPE OR AGE GROUP
  // Clear distinction between Adult and Child, clean interactive selection rows.
  // =========================================================================
  Widget _buildStep2StudentType() {
    final isMartial = _registeredProgram == 'MARTIAL_ARTS';
    final currentSelection = isMartial ? _studentType : _fitnessAgeGroup;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isMartial ? 'Student Type' : 'Age Group',
          style: GoogleFonts.poppins(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Select whether this training profile is for an adult or a child under 18.',
          style: GoogleFonts.poppins(
            fontSize: 14.5,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF64748B),
          ),
        ),
        const SizedBox(height: 28),

        // Adult (18+) Selection Row
        _buildStudentTypeRow(
          title: 'Adult (18+)',
          subtitle: 'Independent adult training & self-paced learning',
          features:
              'Full access to all classes, adult belt curriculum, and evening batches.',
          icon: Icons.person_rounded,
          isSelected: currentSelection == 'Adult (18+)',
          onTap: () {
            setState(() {
              if (isMartial) {
                _studentType = 'Adult (18+)';
              } else {
                _fitnessAgeGroup = 'Adult (18+)';
              }
            });
          },
        ),
        const SizedBox(height: 14),

        // Child (under 18) Selection Row
        _buildStudentTypeRow(
          title: 'Child (under 18)',
          subtitle: 'Junior academy training with parental supervision',
          features:
              'Child-focused discipline, youth belt syllabus, and parent progress notifications.',
          icon: Icons.child_care_rounded,
          isSelected: currentSelection == 'Child (under 18)',
          onTap: () {
            setState(() {
              if (isMartial) {
                _studentType = 'Child (under 18)';
              } else {
                _fitnessAgeGroup = 'Child (under 18)';
              }
            });
          },
        ),
      ],
    );
  }

  Widget _buildStudentTypeRow({
    required String title,
    required String subtitle,
    required String features,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFFEF2F2) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? const Color(0xFFE50914)
                  : const Color(0xFFE2E8F0),
              width: isSelected ? 1.6 : 1.2,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: const Color(0xFFE50914).withValues(alpha: 0.08),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFE50914)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: isSelected ? Colors.white : const Color(0xFF0F172A),
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFE50914),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      features,
                      style: GoogleFonts.poppins(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w400,
                        color: const Color(0xFF64748B),
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected
                      ? const Color(0xFFE50914)
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected
                        ? const Color(0xFFE50914)
                        : const Color(0xFFCBD5E1),
                    width: 2.0,
                  ),
                ),
                child: isSelected
                    ? const Icon(
                        Icons.check_rounded,
                        size: 15,
                        color: Colors.white,
                      )
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // STEP 3: PROGRAMME-SPECIFIC QUESTIONS
  // Martial Arts or Fitness questions directly on pure white canvas.
  // =========================================================================
  Widget _buildStep3ProgrammeQuestions() {
    final isMartial = _registeredProgram == 'MARTIAL_ARTS';

    return Form(
      key: _questionsFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isMartial ? 'Martial Arts Profile' : 'Fitness Profile',
            style: GoogleFonts.poppins(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            isMartial
                ? 'Tell us about your martial arts background and goals.'
                : 'Personalise your fitness and conditioning targets.',
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 28),

          if (isMartial) ..._buildMartialArtsSpecificQuestions(),
          if (!isMartial) ..._buildFitnessSpecificQuestions(),

          // Account Security (Password and Confirm Password)
          const SizedBox(height: 28),
          const Divider(
            color: Color(0xFFE2E8F0),
            thickness: 1,
            height: 1,
          ),
          const SizedBox(height: 20),
          Text(
            'Account Security',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Create a password for your student portal account.',
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 20),

          // Password Field
          _buildTextField(
            label: 'Password',
            hintText: 'At least 8 characters',
            controller: _passwordController,
            obscureText: _obscurePassword,
            prefixIcon: const Icon(
              Icons.lock_outline_rounded,
              size: 20,
              color: Color(0xFF94A3B8),
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: const Color(0xFF94A3B8),
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Password is required.';
              }
              if (value.length < 8) {
                return 'Password must be at least 8 characters.';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),

          // Confirm Password Field
          _buildTextField(
            label: 'Confirm Password',
            hintText: 'Re-enter your password',
            controller: _confirmPasswordController,
            obscureText: _obscureConfirmPassword,
            prefixIcon: const Icon(
              Icons.lock_outline_rounded,
              size: 20,
              color: Color(0xFF94A3B8),
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirmPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: const Color(0xFF94A3B8),
              ),
              onPressed: () {
                setState(() {
                  _obscureConfirmPassword = !_obscureConfirmPassword;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Confirm password is required.';
              }
              if (value != _passwordController.text) {
                return 'Passwords do not match.';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  List<Widget> _buildMartialArtsSpecificQuestions() {
    return [
      // Martial Arts Level
      _buildSectionLabel('Current Martial Arts Level', isRequired: true),
      _buildRadioOptionList(
        options: const [
          "Beginner — I'm just starting",
          'Intermediate — I have some experience',
          'Advanced — I train regularly',
        ],
        selected: _martialArtsLevel,
        onSelected: (val) {
          setState(() {
            _martialArtsLevel = val;
          });
        },
      ),
      const SizedBox(height: 20),

      // Current Weight (kg) — Optional
      _buildTextField(
        label: 'Current Weight (kg) (Optional)',
        hintText: 'e.g. 72.5',
        controller: _martialWeightController,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        prefixIcon: const Icon(
          Icons.monitor_weight_outlined,
          size: 20,
          color: Color(0xFF94A3B8),
        ),
        validator: (value) {
          final trimmed = value?.trim() ?? '';
          if (trimmed.isNotEmpty) {
            final parsed = double.tryParse(trimmed);
            if (parsed == null || parsed <= 0) {
              return 'Weight must be a positive number.';
            }
          }
          return null;
        },
      ),
      const SizedBox(height: 20),

      // Training Goal
      _buildSectionLabel('Your Main Training Goal', isRequired: true),
      _buildRadioOptionList(
        options: const [
          'Self-defence',
          'Fitness and flexibility',
          'Strength and endurance',
          'Belts and techniques',
          'Competition preparation',
          'Confidence and discipline',
        ],
        selected: _trainingGoal,
        onSelected: (val) {
          setState(() {
            _trainingGoal = val;
          });
        },
      ),
    ];
  }

  List<Widget> _buildFitnessSpecificQuestions() {
    return [
      // Current Weight (kg) — Required
      _buildTextField(
        label: 'Current Weight (kg)',
        hintText: 'e.g. 80.0',
        controller: _fitnessCurrentWeightController,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        prefixIcon: const Icon(
          Icons.monitor_weight_outlined,
          size: 20,
          color: Color(0xFF94A3B8),
        ),
        validator: (value) {
          final trimmed = value?.trim() ?? '';
          if (trimmed.isEmpty) return 'Current weight in kg is required.';
          final parsed = double.tryParse(trimmed);
          if (parsed == null || parsed <= 0) {
            return 'Weight must be a positive number.';
          }
          return null;
        },
      ),
      const SizedBox(height: 20),

      // Target Weight (kg) — Optional
      _buildTextField(
        label: 'Target Weight (kg) (Optional)',
        hintText: 'e.g. 72.0',
        controller: _fitnessTargetWeightController,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        prefixIcon: const Icon(
          Icons.flag_outlined,
          size: 20,
          color: Color(0xFF94A3B8),
        ),
        validator: (value) {
          final trimmed = value?.trim() ?? '';
          if (trimmed.isNotEmpty) {
            final parsed = double.tryParse(trimmed);
            if (parsed == null || parsed <= 0) {
              return 'Target weight must be a positive number.';
            }
          }
          return null;
        },
      ),
      const SizedBox(height: 20),

      // Fitness Goal
      _buildSectionLabel('Main Fitness Goal', isRequired: true),
      _buildRadioOptionList(
        options: const [
          'Weight management',
          'Improve overall fitness',
          'Build strength and muscle',
          'Improve stamina and endurance',
          'Flexibility and mobility',
          'Healthy lifestyle',
        ],
        selected: _fitnessGoal,
        onSelected: (val) {
          setState(() {
            _fitnessGoal = val;
          });
        },
      ),
      const SizedBox(height: 20),

      // Fitness Level
      _buildSectionLabel('Current Fitness Level', isRequired: true),
      _buildSingleSelectChips(
        options: const ['Beginner', 'Intermediate', 'Advanced'],
        selected: _fitnessLevel,
        onSelected: (val) {
          setState(() {
            _fitnessLevel = val;
          });
        },
      ),
      const SizedBox(height: 20),

      // Preferred Workout Frequency
      _buildSectionLabel('Preferred Workout Frequency', isRequired: true),
      _buildRadioOptionList(
        options: const [
          '1–2 days per week',
          '3 days per week',
          '4–5 days per week',
          'Flexible schedule',
        ],
        selected: _workoutFrequency,
        onSelected: (val) {
          setState(() {
            _workoutFrequency = val;
          });
        },
      ),
    ];
  }

  // =========================================================================
  // HELPER COMPONENTS
  // =========================================================================
  Widget _buildContinueButton({
    required String label,
    required VoidCallback? onPressed,
    bool isLoading = false,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFE50914),
          foregroundColor: Colors.white,
          disabledBackgroundColor:
              const Color(0xFFE50914).withValues(alpha: 0.7),
          elevation: 1.5,
          shadowColor: const Color(0xFFE50914).withValues(alpha: 0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        ),
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 20,
                    color: Colors.white,
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String hintText,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    TextInputAction textInputAction = TextInputAction.next,
    bool obscureText = false,
    Widget? prefixIcon,
    BoxConstraints? prefixIconConstraints,
    Widget? suffixIcon,
    String? Function(String?)? validator,
    VoidCallback? onFieldSubmitted,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          obscureText: obscureText,
          onFieldSubmitted:
              onFieldSubmitted != null ? (_) => onFieldSubmitted() : null,
          style: GoogleFonts.poppins(
            fontSize: 14.5,
            fontWeight: FontWeight.w500,
            color: const Color(0xFF0F172A),
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF94A3B8),
            ),
            prefixIcon: prefixIcon,
            prefixIconConstraints: prefixIconConstraints,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFE2E8F0),
                width: 1.2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFF0F172A),
                width: 1.4,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFEF4444),
                width: 1.2,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFEF4444),
                width: 1.4,
              ),
            ),
          ),
          validator: validator,
        ),
      ],
    );
  }

  Widget _buildSectionLabel(String label, {bool isRequired = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text.rich(
        TextSpan(
          text: label,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
          children: [
            if (isRequired)
              const TextSpan(
                text: ' *',
                style: TextStyle(
                  color: Color(0xFFE50914),
                  fontWeight: FontWeight.w900,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSingleSelectChips({
    required List<String> options,
    required String selected,
    required ValueChanged<String> onSelected,
  }) {
    return Row(
      children: options.map((opt) {
        final isChosen = selected == opt;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: Material(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                onTap: () => onSelected(opt),
                borderRadius: BorderRadius.circular(12),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  decoration: BoxDecoration(
                    color: isChosen ? const Color(0xFFE50914) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isChosen
                          ? const Color(0xFFE50914)
                          : const Color(0xFFE2E8F0),
                      width: isChosen ? 1.5 : 1.2,
                    ),
                  ),
                  child: Text(
                    opt,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 13.5,
                      fontWeight:
                          isChosen ? FontWeight.w700 : FontWeight.w500,
                      color: isChosen ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRadioOptionList({
    required List<String> options,
    required String selected,
    required ValueChanged<String> onSelected,
  }) {
    return Column(
      children: options.map((opt) {
        final isChosen = selected == opt;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              onTap: () => onSelected(opt),
              borderRadius: BorderRadius.circular(12),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  color: isChosen ? const Color(0xFFFEF2F2) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isChosen
                        ? const Color(0xFFE50914)
                        : const Color(0xFFE2E8F0),
                    width: isChosen ? 1.5 : 1.2,
                  ),
                ),
                child: Row(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isChosen
                            ? const Color(0xFFE50914)
                            : Colors.transparent,
                        border: Border.all(
                          color: isChosen
                              ? const Color(0xFFE50914)
                              : const Color(0xFFCBD5E1),
                          width: 2.0,
                        ),
                      ),
                      child: isChosen
                          ? const Icon(
                              Icons.check_rounded,
                              size: 13,
                              color: Colors.white,
                            )
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        opt,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight:
                              isChosen ? FontWeight.w600 : FontWeight.w400,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
