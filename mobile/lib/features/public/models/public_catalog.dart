import 'package:flutter/foundation.dart';

/// Individual membership plan tier in the public catalog
@immutable
class PublicMembershipPlan {
  final int daysPerWeek;
  final double monthlyPriceUSD;
  final double monthlyPriceINR;
  final String label;
  final String? badge;
  final bool activeStatus;
  final List<String> curriculum;

  const PublicMembershipPlan({
    required this.daysPerWeek,
    required this.monthlyPriceUSD,
    required this.monthlyPriceINR,
    required this.label,
    this.badge,
    required this.activeStatus,
    required this.curriculum,
  });

  factory PublicMembershipPlan.fromJson(Map<String, dynamic> json) {
    return PublicMembershipPlan(
      daysPerWeek: json['daysPerWeek'] as int? ?? 1,
      monthlyPriceUSD: (json['monthlyPriceUSD'] as num?)?.toDouble() ?? 0.0,
      monthlyPriceINR: (json['monthlyPriceINR'] as num?)?.toDouble() ?? 0.0,
      label: json['label'] as String? ?? '',
      badge: json['badge'] as String?,
      activeStatus: json['activeStatus'] as bool? ?? true,
      curriculum:
          (json['curriculum'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'daysPerWeek': daysPerWeek,
      'monthlyPriceUSD': monthlyPriceUSD,
      'monthlyPriceINR': monthlyPriceINR,
      'label': label,
      'badge': badge,
      'activeStatus': activeStatus,
      'curriculum': curriculum,
    };
  }
}

/// Batch timing option for live classes
@immutable
class PublicBatchTiming {
  final String id;
  final String batchName;
  final String startTime;
  final String endTime;
  final String timezone;
  final String displayLabel;
  final bool activeStatus;

  const PublicBatchTiming({
    required this.id,
    required this.batchName,
    required this.startTime,
    required this.endTime,
    required this.timezone,
    required this.displayLabel,
    required this.activeStatus,
  });

  factory PublicBatchTiming.fromJson(Map<String, dynamic> json) {
    return PublicBatchTiming(
      id: json['id'] as String? ?? '',
      batchName: json['batchName'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      timezone: json['timezone'] as String? ?? 'GMT (UTC+0)',
      displayLabel: json['displayLabel'] as String? ?? '',
      activeStatus: json['activeStatus'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'batchName': batchName,
      'startTime': startTime,
      'endTime': endTime,
      'timezone': timezone,
      'displayLabel': displayLabel,
      'activeStatus': activeStatus,
    };
  }
}

/// Available / Rest Day configuration for training schedule
@immutable
class PublicTrainingDay {
  final String dayName;
  final bool selectable;
  final bool restDay;
  final bool activeStatus;

  const PublicTrainingDay({
    required this.dayName,
    required this.selectable,
    required this.restDay,
    required this.activeStatus,
  });

  factory PublicTrainingDay.fromJson(Map<String, dynamic> json) {
    return PublicTrainingDay(
      dayName: json['dayName'] as String? ?? '',
      selectable: json['selectable'] as bool? ?? true,
      restDay: json['restDay'] as bool? ?? false,
      activeStatus: json['activeStatus'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'dayName': dayName,
      'selectable': selectable,
      'restDay': restDay,
      'activeStatus': activeStatus,
    };
  }
}

/// Optional Diet & Nutrition add-on
@immutable
class PublicDietNutrition {
  final String title;
  final String description;
  final double priceUSD;
  final bool activeStatus;

  const PublicDietNutrition({
    required this.title,
    required this.description,
    required this.priceUSD,
    required this.activeStatus,
  });

  factory PublicDietNutrition.fromJson(Map<String, dynamic> json) {
    return PublicDietNutrition(
      title: json['title'] as String? ?? 'Diet & Nutrition Program',
      description: json['description'] as String? ?? '',
      priceUSD: (json['priceUSD'] as num?)?.toDouble() ?? 10.0,
      activeStatus: json['activeStatus'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'priceUSD': priceUSD,
      'activeStatus': activeStatus,
    };
  }
}

/// Training category (e.g. Kids, Adults, Ladies, Fitness)
@immutable
class PublicProgramCategory {
  final String id;
  final String category;
  final String group;
  final String title;
  final String description;
  final String targetAudience;
  final List<PublicMembershipPlan> membershipPlans;
  final List<PublicBatchTiming> batchTimings;
  final List<PublicTrainingDay> trainingDays;

  const PublicProgramCategory({
    required this.id,
    required this.category,
    required this.group,
    required this.title,
    required this.description,
    required this.targetAudience,
    required this.membershipPlans,
    required this.batchTimings,
    required this.trainingDays,
  });

  factory PublicProgramCategory.fromJson(Map<String, dynamic> json) {
    return PublicProgramCategory(
      id: json['id'] as String? ?? '',
      category: json['category'] as String? ?? 'mma',
      group: json['group'] as String? ?? 'adults',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      targetAudience: json['targetAudience'] as String? ?? '',
      membershipPlans:
          (json['membershipPlans'] as List<dynamic>?)
              ?.map(
                (e) => PublicMembershipPlan.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
      batchTimings:
          (json['batchTimings'] as List<dynamic>?)
              ?.map(
                (e) => PublicBatchTiming.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
      trainingDays:
          (json['trainingDays'] as List<dynamic>?)
              ?.map(
                (e) => PublicTrainingDay.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'group': group,
      'title': title,
      'description': description,
      'targetAudience': targetAudience,
      'membershipPlans': membershipPlans.map((p) => p.toJson()).toList(),
      'batchTimings': batchTimings.map((b) => b.toJson()).toList(),
      'trainingDays': trainingDays.map((d) => d.toJson()).toList(),
    };
  }
}

/// Root Public Catalog Response Data
@immutable
class PublicCatalogData {
  final List<PublicProgramCategory> categories;
  final List<Map<String, String>> martialArtsTypes;
  final PublicDietNutrition? dietNutrition;
  final PublicPromotion? promotion;
  final PublicFeaturedProgramsSection? featuredProgramsSection;
  final PublicBeltSyllabusSection? beltSyllabusSection;
  final PublicFitnessJourneySection? fitnessJourneySection;
  final PublicCoachesSection? coachesSection;
  final PublicBecomeCoachSection? becomeCoachSection;
  final String currencyNotice;
  final String checkoutBaseUrl;
  final String updatedAt;

  const PublicCatalogData({
    required this.categories,
    required this.martialArtsTypes,
    this.dietNutrition,
    this.promotion,
    this.featuredProgramsSection,
    this.beltSyllabusSection,
    this.fitnessJourneySection,
    this.coachesSection,
    this.becomeCoachSection,
    required this.currencyNotice,
    required this.checkoutBaseUrl,
    required this.updatedAt,
  });

  factory PublicCatalogData.fromJson(Map<String, dynamic> json) {
    final rawCategories = json['categories'] as List<dynamic>? ?? [];
    final rawTypes = json['martialArtsTypes'] as List<dynamic>? ?? [];
    final rawDiet = json['dietNutrition'] as Map<String, dynamic>?;
    final rawPromotion = json['promotion'] as Map<String, dynamic>?;
    final rawPrograms =
        json['featuredProgramsSection'] as Map<String, dynamic>?;
    final rawBelt = json['beltSyllabusSection'] as Map<String, dynamic>?;
    final rawFitness = json['fitnessJourneySection'] as Map<String, dynamic>?;
    final rawCoaches = json['coachesSection'] as Map<String, dynamic>?;
    final rawBecomeCoach = json['becomeCoachSection'] as Map<String, dynamic>?;

    return PublicCatalogData(
      categories: rawCategories
          .map((c) => PublicProgramCategory.fromJson(c as Map<String, dynamic>))
          .toList(),
      martialArtsTypes: rawTypes.map((t) {
        final m = t as Map<String, dynamic>;
        return {
          'id': m['id']?.toString() ?? '',
          'label': m['label']?.toString() ?? '',
        };
      }).toList(),
      dietNutrition: rawDiet != null
          ? PublicDietNutrition.fromJson(rawDiet)
          : null,
      promotion: rawPromotion != null
          ? PublicPromotion.fromJson(rawPromotion)
          : null,
      featuredProgramsSection: rawPrograms != null
          ? PublicFeaturedProgramsSection.fromJson(rawPrograms)
          : null,
      beltSyllabusSection: rawBelt != null
          ? PublicBeltSyllabusSection.fromJson(rawBelt)
          : null,
      fitnessJourneySection: rawFitness != null
          ? PublicFitnessJourneySection.fromJson(rawFitness)
          : null,
      coachesSection: rawCoaches != null
          ? PublicCoachesSection.fromJson(rawCoaches)
          : null,
      becomeCoachSection: rawBecomeCoach != null
          ? PublicBecomeCoachSection.fromJson(rawBecomeCoach)
          : null,
      currencyNotice:
          json['currencyNotice'] as String? ??
          'Prices in USD (\$) and INR (₹) synchronized with live academy administration.',
      checkoutBaseUrl:
          json['checkoutBaseUrl'] as String? ?? 'https://selffits.com/checkout',
      updatedAt:
          json['updatedAt'] as String? ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'categories': categories.map((c) => c.toJson()).toList(),
      'martialArtsTypes': martialArtsTypes,
      'dietNutrition': dietNutrition?.toJson(),
      'promotion': promotion?.toJson(),
      'featuredProgramsSection': featuredProgramsSection?.toJson(),
      'beltSyllabusSection': beltSyllabusSection?.toJson(),
      'fitnessJourneySection': fitnessJourneySection?.toJson(),
      'coachesSection': coachesSection?.toJson(),
      'becomeCoachSection': becomeCoachSection?.toJson(),
      'currencyNotice': currencyNotice,
      'checkoutBaseUrl': checkoutBaseUrl,
      'updatedAt': updatedAt,
    };
  }
}

/// Special Promotion configuration
@immutable
class PublicPromotion {
  final bool isEnabled;
  final bool isCouponValid;
  final String badgeText;
  final String heading;
  final String description;
  final String couponCode;
  final String discountType;
  final double discountValue;
  final String discountLabel;
  final String buttonText;
  final String buttonLink;

  const PublicPromotion({
    required this.isEnabled,
    required this.isCouponValid,
    required this.badgeText,
    required this.heading,
    required this.description,
    required this.couponCode,
    required this.discountType,
    required this.discountValue,
    required this.discountLabel,
    required this.buttonText,
    required this.buttonLink,
  });

  factory PublicPromotion.fromJson(Map<String, dynamic> json) {
    return PublicPromotion(
      isEnabled: json['isEnabled'] as bool? ?? true,
      isCouponValid: json['isCouponValid'] as bool? ?? true,
      badgeText: json['badgeText'] as String? ?? 'SPECIAL PROMOTION',
      heading:
          json['heading'] as String? ?? 'Exclusive Academy Enrollment Offer',
      description: json['description'] as String? ?? '',
      couponCode: json['couponCode'] as String? ?? '',
      discountType: json['discountType'] as String? ?? 'PERCENTAGE',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 0.0,
      discountLabel: json['discountLabel'] as String? ?? '',
      buttonText: json['buttonText'] as String? ?? 'Explore Programs',
      buttonLink: json['buttonLink'] as String? ?? '/programs',
    );
  }

  Map<String, dynamic> toJson() => {
    'isEnabled': isEnabled,
    'isCouponValid': isCouponValid,
    'badgeText': badgeText,
    'heading': heading,
    'description': description,
    'couponCode': couponCode,
    'discountType': discountType,
    'discountValue': discountValue,
    'discountLabel': discountLabel,
    'buttonText': buttonText,
    'buttonLink': buttonLink,
  };
}

/// Featured Program card item
@immutable
class PublicFeaturedProgram {
  final String id;
  final String title;
  final String category;
  final String image;
  final String description;
  final String classes;
  final String duration;
  final String priceStartsUSD;
  final String targetCategory;
  final String targetAudience;
  final String href;

  const PublicFeaturedProgram({
    required this.id,
    required this.title,
    required this.category,
    required this.image,
    required this.description,
    required this.classes,
    required this.duration,
    required this.priceStartsUSD,
    required this.targetCategory,
    required this.targetAudience,
    required this.href,
  });

  factory PublicFeaturedProgram.fromJson(Map<String, dynamic> json) {
    return PublicFeaturedProgram(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      category: json['category'] as String? ?? 'MARTIAL ARTS',
      image: json['image'] as String? ?? '',
      description: json['description'] as String? ?? '',
      classes: json['classes'] as String? ?? '4 - 20 Live Classes',
      duration: json['duration'] as String? ?? '1 - 5 Days / Wk',
      priceStartsUSD: json['priceStartsUSD'] as String? ?? '25',
      targetCategory: json['targetCategory'] as String? ?? 'mma',
      targetAudience: json['targetAudience'] as String? ?? 'adults',
      href: json['href'] as String? ?? '/programs',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'category': category,
    'image': image,
    'description': description,
    'classes': classes,
    'duration': duration,
    'priceStartsUSD': priceStartsUSD,
    'targetCategory': targetCategory,
    'targetAudience': targetAudience,
    'href': href,
  };
}

/// Featured Programs Section container
@immutable
class PublicFeaturedProgramsSection {
  final String headingBadge;
  final String headingTitle;
  final String headingSubtitle;
  final List<PublicFeaturedProgram> items;

  const PublicFeaturedProgramsSection({
    required this.headingBadge,
    required this.headingTitle,
    required this.headingSubtitle,
    required this.items,
  });

  factory PublicFeaturedProgramsSection.fromJson(Map<String, dynamic> json) {
    return PublicFeaturedProgramsSection(
      headingBadge: json['headingBadge'] as String? ?? 'Training Pathways',
      headingTitle: json['headingTitle'] as String? ?? 'Explore Our Programs',
      headingSubtitle: json['headingSubtitle'] as String? ?? '',
      items:
          (json['items'] as List<dynamic>?)
              ?.map(
                (e) =>
                    PublicFeaturedProgram.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'headingBadge': headingBadge,
    'headingTitle': headingTitle,
    'headingSubtitle': headingSubtitle,
    'items': items.map((i) => i.toJson()).toList(),
  };
}

/// Belt progression item
@immutable
class PublicBeltItem {
  final String id;
  final String name;
  final String subtitle;
  final bool isEnabled;
  final List<String> syllabus;

  const PublicBeltItem({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.isEnabled,
    required this.syllabus,
  });

  factory PublicBeltItem.fromJson(Map<String, dynamic> json) {
    return PublicBeltItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      isEnabled: json['isEnabled'] as bool? ?? true,
      syllabus:
          (json['syllabus'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'subtitle': subtitle,
    'isEnabled': isEnabled,
    'syllabus': syllabus,
  };
}

/// Belt Syllabus Section container
@immutable
class PublicBeltSyllabusSection {
  final String headingBadge;
  final String headingTitle;
  final String headingSubtitle;
  final List<PublicBeltItem> belts;

  const PublicBeltSyllabusSection({
    required this.headingBadge,
    required this.headingTitle,
    required this.headingSubtitle,
    required this.belts,
  });

  factory PublicBeltSyllabusSection.fromJson(Map<String, dynamic> json) {
    return PublicBeltSyllabusSection(
      headingBadge:
          json['headingBadge'] as String? ?? 'BELT PROGRESSION SYLLABUS',
      headingTitle:
          json['headingTitle'] as String? ??
          'Your Martial Arts Learning Journey',
      headingSubtitle: json['headingSubtitle'] as String? ?? '',
      belts:
          (json['belts'] as List<dynamic>?)
              ?.map((e) => PublicBeltItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'headingBadge': headingBadge,
    'headingTitle': headingTitle,
    'headingSubtitle': headingSubtitle,
    'belts': belts.map((b) => b.toJson()).toList(),
  };
}

/// Fitness Journey Section container
@immutable
class PublicFitnessJourneySection {
  final String headingBadge;
  final String headingTitle;
  final String headingSubtitle;
  final List<String> points;

  const PublicFitnessJourneySection({
    required this.headingBadge,
    required this.headingTitle,
    required this.headingSubtitle,
    required this.points,
  });

  factory PublicFitnessJourneySection.fromJson(Map<String, dynamic> json) {
    return PublicFitnessJourneySection(
      headingBadge:
          json['headingBadge'] as String? ?? 'WEIGHT MANAGEMENT SYLLABUS',
      headingTitle:
          json['headingTitle'] as String? ?? 'Your Weight Management Journey',
      headingSubtitle: json['headingSubtitle'] as String? ?? '',
      points:
          (json['points'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'headingBadge': headingBadge,
    'headingTitle': headingTitle,
    'headingSubtitle': headingSubtitle,
    'points': points,
  };
}

/// Master Coach item
@immutable
class PublicCoach {
  final String id;
  final String name;
  final String role;
  final String experience;
  final String rank;
  final String rating;
  final String statusBadge;
  final String image;
  final String bio;
  final String specialty;

  const PublicCoach({
    required this.id,
    required this.name,
    required this.role,
    required this.experience,
    required this.rank,
    required this.rating,
    required this.statusBadge,
    required this.image,
    required this.bio,
    required this.specialty,
  });

  factory PublicCoach.fromJson(Map<String, dynamic> json) {
    return PublicCoach(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      role: json['role'] as String? ?? 'Certified Instructor',
      experience: json['experience'] as String? ?? '',
      rank: json['rank'] as String? ?? 'Certified Sensei',
      rating: json['rating'] as String? ?? '4.9',
      statusBadge:
          json['statusBadge'] as String? ?? 'Live Form Evaluation Active',
      image: json['image'] as String? ?? '',
      bio: json['bio'] as String? ?? '',
      specialty: json['specialty'] as String? ?? 'Martial Arts & Fitness',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'role': role,
    'experience': experience,
    'rank': rank,
    'rating': rating,
    'statusBadge': statusBadge,
    'image': image,
    'bio': bio,
    'specialty': specialty,
  };
}

/// Coaches Section container
@immutable
class PublicCoachesSection {
  final String headingBadge;
  final String headingTitle;
  final String headingSubtitle;
  final List<PublicCoach> items;

  const PublicCoachesSection({
    required this.headingBadge,
    required this.headingTitle,
    required this.headingSubtitle,
    required this.items,
  });

  factory PublicCoachesSection.fromJson(Map<String, dynamic> json) {
    return PublicCoachesSection(
      headingBadge:
          json['headingBadge'] as String? ?? 'World Class Instructors',
      headingTitle:
          json['headingTitle'] as String? ?? 'Meet Our Master Coaches',
      headingSubtitle: json['headingSubtitle'] as String? ?? '',
      items:
          (json['items'] as List<dynamic>?)
              ?.map((e) => PublicCoach.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'headingBadge': headingBadge,
    'headingTitle': headingTitle,
    'headingSubtitle': headingSubtitle,
    'items': items.map((c) => c.toJson()).toList(),
  };
}

/// Instructor Recruitment / Become a Coach Section container
@immutable
class PublicBecomeCoachSection {
  final bool isEnabled;
  final String badgeText;
  final String heading;
  final String description;
  final String buttonText;
  final String buttonLink;

  const PublicBecomeCoachSection({
    required this.isEnabled,
    required this.badgeText,
    required this.heading,
    required this.description,
    required this.buttonText,
    required this.buttonLink,
  });

  factory PublicBecomeCoachSection.fromJson(Map<String, dynamic> json) {
    return PublicBecomeCoachSection(
      isEnabled: json['isEnabled'] as bool? ?? true,
      badgeText: json['badgeText'] as String? ?? 'Instructor Recruitment',
      heading: json['heading'] as String? ?? 'BECOME A SELFFITS COACH',
      description:
          json['description'] as String? ??
          'Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.',
      buttonText: json['buttonText'] as String? ?? 'BECOME A COACH',
      buttonLink: json['buttonLink'] as String? ?? '/become-coach',
    );
  }

  static PublicBecomeCoachSection defaultSection() {
    return const PublicBecomeCoachSection(
      isEnabled: true,
      badgeText: 'Instructor Recruitment',
      heading: 'BECOME A SELFFITS COACH',
      description:
          'Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.',
      buttonText: 'BECOME A COACH',
      buttonLink: '/become-coach',
    );
  }

  Map<String, dynamic> toJson() => {
    'isEnabled': isEnabled,
    'badgeText': badgeText,
    'heading': heading,
    'description': description,
    'buttonText': buttonText,
    'buttonLink': buttonLink,
  };
}
