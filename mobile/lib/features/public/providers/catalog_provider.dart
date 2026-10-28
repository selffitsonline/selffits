import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/public_catalog.dart';
import '../repositories/catalog_repository.dart';

class CatalogState {
  final bool isLoading;
  final PublicCatalogData? data;
  final bool isFromCache;
  final String? errorMessage;

  // Interactive Schedule Builder State
  final String programCategory; // 'mma' | 'fitness'
  final String audienceGroup; // 'kids' | 'adults' | 'ladies'
  final String martialArtsType; // 'Karate', 'Kick Boxing', etc.
  final int daysPerWeek; // 1 to 5
  final List<String> selectedDays; // e.g. ['Sunday', 'Monday']
  final String? selectedBatchId;
  final bool includeDietNutrition;
  final bool isCurriculumOpen;

  const CatalogState({
    this.isLoading = false,
    this.data,
    this.isFromCache = false,
    this.errorMessage,
    this.programCategory = 'mma',
    this.audienceGroup = 'kids',
    this.martialArtsType = 'Karate',
    this.daysPerWeek = 1,
    this.selectedDays = const ['Sunday'],
    this.selectedBatchId,
    this.includeDietNutrition = false,
    this.isCurriculumOpen = false,
  });

  CatalogState copyWith({
    bool? isLoading,
    PublicCatalogData? data,
    bool? isFromCache,
    String? errorMessage,
    String? programCategory,
    String? audienceGroup,
    String? martialArtsType,
    int? daysPerWeek,
    List<String>? selectedDays,
    String? selectedBatchId,
    bool? includeDietNutrition,
    bool? isCurriculumOpen,
  }) {
    return CatalogState(
      isLoading: isLoading ?? this.isLoading,
      data: data ?? this.data,
      isFromCache: isFromCache ?? this.isFromCache,
      errorMessage: errorMessage,
      programCategory: programCategory ?? this.programCategory,
      audienceGroup: audienceGroup ?? this.audienceGroup,
      martialArtsType: martialArtsType ?? this.martialArtsType,
      daysPerWeek: daysPerWeek ?? this.daysPerWeek,
      selectedDays: selectedDays ?? this.selectedDays,
      selectedBatchId: selectedBatchId ?? this.selectedBatchId,
      includeDietNutrition: includeDietNutrition ?? this.includeDietNutrition,
      isCurriculumOpen: isCurriculumOpen ?? this.isCurriculumOpen,
    );
  }

  /// Authoritative Active Category matching selected category and audience
  PublicProgramCategory? get activeCategory {
    if (data == null || data!.categories.isEmpty) return null;
    return data!.categories.firstWhere(
      (c) => c.category == programCategory && c.group == audienceGroup,
      orElse: () => data!.categories.firstWhere(
        (c) => c.category == programCategory,
        orElse: () => data!.categories.first,
      ),
    );
  }

  /// Active plan object for currently selected frequency
  PublicMembershipPlan? get activePlan {
    final cat = activeCategory;
    if (cat == null || cat.membershipPlans.isEmpty) return null;
    return cat.membershipPlans.firstWhere(
      (p) => p.daysPerWeek == daysPerWeek,
      orElse: () => cat.membershipPlans.first,
    );
  }

  /// Active batch timing object
  PublicBatchTiming? get selectedBatch {
    final cat = activeCategory;
    if (cat == null || cat.batchTimings.isEmpty) return null;
    if (selectedBatchId != null) {
      return cat.batchTimings.firstWhere(
        (b) => b.id == selectedBatchId,
        orElse: () => cat.batchTimings.first,
      );
    }
    return cat.batchTimings.first;
  }

  /// Monthly price in USD for selected frequency
  double get monthlyPriceUSD {
    return activePlan?.monthlyPriceUSD ?? 25.0;
  }

  /// Diet add-on price in USD
  double get dietPriceUSD {
    return data?.dietNutrition?.priceUSD ?? 10.0;
  }

  /// Total calculated price including optional diet add-on
  double get totalPriceUSD {
    final addOn =
        (includeDietNutrition && (data?.dietNutrition?.activeStatus ?? true))
        ? dietPriceUSD
        : 0.0;
    return monthlyPriceUSD + addOn;
  }

  /// Context title formatted identically to website
  String get contextTitle {
    if (programCategory == 'mma') {
      switch (audienceGroup) {
        case 'kids':
          return 'Kids Martial Arts';
        case 'adults':
          return 'Adults Mixed Martial Arts';
        case 'ladies':
          return 'Ladies Only Martial Arts';
        default:
          return 'Mixed Martial Arts';
      }
    } else {
      switch (audienceGroup) {
        case 'kids':
          return 'Kids Fitness & Weight Management';
        case 'adults':
          return 'Adult Fitness & Weight Management';
        case 'ladies':
          return 'Ladies Fitness & Weight Management';
        default:
          return 'Fitness & Weight Management';
      }
    }
  }

  /// Validation: exactly daysPerWeek days selected and a batch chosen
  bool get isSelectionValid {
    return selectedDays.length == daysPerWeek && selectedBatch != null;
  }
}

class CatalogNotifier extends StateNotifier<CatalogState> {
  final CatalogRepository _repository;

  CatalogNotifier(this._repository) : super(const CatalogState());

  Future<void> loadCatalog({bool forceRefresh = false}) async {
    // 1. If not force-refreshing, reuse valid in-memory or state data immediately
    if (!forceRefresh) {
      if (state.data != null && _repository.isMemoryCacheValid) {
        // State already contains fresh authoritative catalog data (< 5 mins old)
        return;
      }

      // Check synchronous in-memory cache first to avoid waiting on storage KeyStore I/O
      final memoryData = _repository.memoryCachedData;
      if (memoryData != null && state.data == null) {
        state = state.copyWith(
          data: memoryData,
          isFromCache: false,
          isLoading: false,
        );
        _reconcileScheduleSelections();
        if (_repository.isMemoryCacheValid) {
          return;
        }
      }

      // Check disk cache only if state has no data and memory cache was empty
      if (state.data == null) {
        final cached = await _repository.getCachedData();
        if (cached != null && state.data == null) {
          state = state.copyWith(
            data: cached,
            isFromCache: true,
            isLoading: false,
          );
          _reconcileScheduleSelections();
          if (_repository.isMemoryCacheValid) {
            return;
          }
        }
      }
    }

    // 2. Refresh from server.
    // Only show full loading spinner if no data is currently displayed to prevent UI flash
    state = state.copyWith(
      isLoading: state.data == null,
      errorMessage: null,
    );

    final result = await _repository.getCatalog(forceRefresh: forceRefresh);

    if (result.hasError && result.data == null && state.data == null) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: result.errorMessage,
      );
    } else {
      final catalogData = result.data ?? state.data;
      String initialMartialArtsType = state.martialArtsType;
      if (catalogData != null && catalogData.martialArtsTypes.isNotEmpty) {
        final existingMatch = catalogData.martialArtsTypes.any(
          (t) => t['label'] == state.martialArtsType,
        );
        if (!existingMatch) {
          initialMartialArtsType =
              catalogData.martialArtsTypes.first['label'] ?? 'Karate';
        }
      }

      state = state.copyWith(
        isLoading: false,
        data: catalogData,
        isFromCache: result.isFromCache,
        errorMessage: result.isFromCache ? result.errorMessage : null,
        martialArtsType: initialMartialArtsType,
      );

      _reconcileScheduleSelections();
    }
  }

  void setProgramCategory(String category) {
    if (state.programCategory == category) return;
    state = state.copyWith(
      programCategory: category,
      audienceGroup: 'kids', // Reset to kids on category change like website
    );
    _reconcileScheduleSelections();
  }

  void setAudienceGroup(String group) {
    if (state.audienceGroup == group) return;
    state = state.copyWith(audienceGroup: group);
    _reconcileScheduleSelections();
  }

  void setMartialArtsType(String type) {
    state = state.copyWith(martialArtsType: type);
  }

  void setDaysPerWeek(int freq) {
    if (freq < 1 || freq > 5) return;
    final cat = state.activeCategory;
    if (cat == null) {
      state = state.copyWith(daysPerWeek: freq);
      return;
    }

    final selectableDays = cat.trainingDays
        .where((d) => !d.restDay && d.selectable)
        .map((d) => d.dayName)
        .toList();

    List<String> newSelectedDays;
    if (freq == 5) {
      // Rule: frequency 5 auto-selects all 5 active training days
      newSelectedDays = List<String>.from(selectableDays);
    } else {
      final currentValid = state.selectedDays
          .where((d) => selectableDays.contains(d))
          .toList();
      if (currentValid.length > freq) {
        newSelectedDays = currentValid.sublist(0, freq);
      } else if (currentValid.length < freq) {
        final needed = freq - currentValid.length;
        final available = selectableDays
            .where((d) => !currentValid.contains(d))
            .toList();
        newSelectedDays = [...currentValid, ...available.take(needed)];
      } else {
        newSelectedDays = currentValid;
      }
    }

    state = state.copyWith(daysPerWeek: freq, selectedDays: newSelectedDays);
  }

  void toggleTrainingDay(String dayName) {
    final cat = state.activeCategory;
    if (cat == null) return;

    // Disallow toggling when 5 days selected (all 5 are active)
    if (state.daysPerWeek == 5) return;

    // Check if rest day
    final dayObj = cat.trainingDays.firstWhere(
      (d) => d.dayName.toLowerCase() == dayName.toLowerCase(),
      orElse: () => const PublicTrainingDay(
        dayName: '',
        selectable: false,
        restDay: true,
        activeStatus: false,
      ),
    );
    if (dayObj.restDay || !dayObj.selectable) return;

    final current = List<String>.from(state.selectedDays);
    if (current.contains(dayName)) {
      if (current.length > 1) {
        current.remove(dayName);
      }
    } else {
      if (current.length < state.daysPerWeek) {
        current.add(dayName);
      } else {
        // Replace oldest selection
        current.removeAt(0);
        current.add(dayName);
      }
    }

    state = state.copyWith(selectedDays: current);
  }

  void setSelectedBatch(String batchId) {
    state = state.copyWith(selectedBatchId: batchId);
  }

  void toggleDietNutrition() {
    state = state.copyWith(includeDietNutrition: !state.includeDietNutrition);
  }

  void toggleCurriculum() {
    state = state.copyWith(isCurriculumOpen: !state.isCurriculumOpen);
  }

  void _reconcileScheduleSelections() {
    final cat = state.activeCategory;
    if (cat == null) return;

    // Reconcile batch
    String? currentBatchId = state.selectedBatchId;
    if (cat.batchTimings.isNotEmpty) {
      final exists = cat.batchTimings.any((b) => b.id == currentBatchId);
      if (!exists) {
        currentBatchId = cat.batchTimings.first.id;
      }
    }

    // Reconcile selected training days against active category rest days
    final selectableDays = cat.trainingDays
        .where((d) => !d.restDay && d.selectable)
        .map((d) => d.dayName)
        .toList();

    List<String> newSelected;
    if (state.daysPerWeek == 5) {
      newSelected = List<String>.from(selectableDays);
    } else {
      final valid = state.selectedDays
          .where((d) => selectableDays.contains(d))
          .toList();
      if (valid.isEmpty && selectableDays.isNotEmpty) {
        valid.add(selectableDays.first);
      }
      if (valid.length > state.daysPerWeek) {
        newSelected = valid.sublist(0, state.daysPerWeek);
      } else if (valid.length < state.daysPerWeek) {
        final needed = state.daysPerWeek - valid.length;
        final available = selectableDays
            .where((d) => !valid.contains(d))
            .toList();
        newSelected = [...valid, ...available.take(needed)];
      } else {
        newSelected = valid;
      }
    }

    state = state.copyWith(
      selectedBatchId: currentBatchId,
      selectedDays: newSelected,
    );
  }

  /// Builds the authoritative checkout portal handoff URL
  String buildCheckoutUrl({String? couponCode}) {
    final baseUrl =
        state.data?.checkoutBaseUrl ?? 'https://selffits.com/checkout';
    final batch = state.selectedBatch;
    final batchLabel = batch != null
        ? '${batch.batchName} — ${batch.displayLabel} (${batch.timezone})'
        : 'Default Batch';

    final uri = Uri.parse(baseUrl).replace(
      queryParameters: {
        'freq': state.daysPerWeek.toString(),
        'days': state.selectedDays.isNotEmpty
            ? state.selectedDays.join(',')
            : 'Sunday',
        'batch': batchLabel,
        'currency': 'USD',
        'basePrice': state.monthlyPriceUSD.toInt().toString(),
        'dietAddon': state.includeDietNutrition.toString(),
        'dietPrice': state.dietPriceUSD.toInt().toString(),
        'price': state.totalPriceUSD.toInt().toString(),
        'plan': 'plan-${state.daysPerWeek}-day',
        if (state.programCategory == 'mma' && state.martialArtsType.isNotEmpty)
          'type': state.martialArtsType,
        if (couponCode != null && couponCode.trim().isNotEmpty)
          'coupon': couponCode.trim(),
      },
    );

    return uri.toString();
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return CatalogRepository(apiClient: apiClient, storage: storage);
});

final catalogProvider = StateNotifierProvider<CatalogNotifier, CatalogState>((
  ref,
) {
  final repository = ref.watch(catalogRepositoryProvider);
  return CatalogNotifier(repository);
});

/// Indicates that an enrollment checkout flow was initiated and should be presented
/// immediately upon successful student authentication.
final pendingCheckoutProvider = StateProvider<bool>((ref) => false);
