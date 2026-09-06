export interface TrainingDayConfig {
  dayName: string;
  selectable: boolean;
  restDay: boolean;
  activeStatus: boolean;
}

export interface BatchTimingConfig {
  id: string;
  batchName: string;
  startTime: string;
  endTime: string;
  timezone: string;
  displayLabel: string;
  activeStatus: boolean;
}

export interface MembershipPlanConfig {
  daysPerWeek: number;
  monthlyPriceUSD: number;
  monthlyPriceINR: number;
  label: string;
  badge: string | null;
  activeStatus: boolean;
  curriculum?: string[];
}

export interface CentralScheduleConfig {
  trainingDays: TrainingDayConfig[];
  batchTimings: BatchTimingConfig[];
  membershipPlans: MembershipPlanConfig[];
}

// 1. MMA - KIDS
export const DEFAULT_MMA_KIDS_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: [
    { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Tuesday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Wednesday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Friday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Saturday", selectable: true, restDay: false, activeStatus: true },
  ],
  batchTimings: [
    { id: "mma-kids-b1", batchName: "Junior Batch 1", startTime: "04:00 PM", endTime: "04:45 PM", timezone: "GMT (UTC+0)", displayLabel: "04:00 PM – 04:45 PM", activeStatus: true },
    { id: "mma-kids-b2", batchName: "Junior Batch 2", startTime: "05:00 PM", endTime: "05:45 PM", timezone: "GMT (UTC+0)", displayLabel: "05:00 PM – 05:45 PM", activeStatus: true },
  ],
  membershipPlans: [
    { daysPerWeek: 1, monthlyPriceUSD: 20, monthlyPriceINR: 1599, label: "1 Day / Week", badge: null, activeStatus: true, curriculum: ["Kids Martial Arts discipline & focus exercises", "Joint flexibility & balance coordination drills", "Basic defensive stance & safety awareness"] },
    { daysPerWeek: 2, monthlyPriceUSD: 35, monthlyPriceINR: 2799, label: "2 Days / Week", badge: null, activeStatus: true, curriculum: ["Fundamental kicks & punches for kids", "Bodyweight agility & speed balance drills", "Beginner martial arts forms & posture control"] },
    { daysPerWeek: 3, monthlyPriceUSD: 50, monthlyPriceINR: 3999, label: "3 Days / Week", badge: "MOST POPULAR", activeStatus: true, curriculum: ["Intermediate kids Kung-Fu animal stances", "Light sparring footwork & blocking techniques", "Confidence building & youth character development"] },
    { daysPerWeek: 4, monthlyPriceUSD: 65, monthlyPriceINR: 5199, label: "4 Days / Week", badge: null, activeStatus: true, curriculum: ["Advanced kids martial arts combos & forms", "Speed kicking drills & rapid reflex games", "Belts graduation syllabus preparation"] },
    { daysPerWeek: 5, monthlyPriceUSD: 80, monthlyPriceINR: 6399, label: "5 Days / Week", badge: "BEST VALUE", activeStatus: true, curriculum: ["Junior master syllabus & full form perfection", "1-on-1 instructor form correction for kids", "Comprehensive belt ranking evaluation"] },
  ],
};

// 2. MMA - ADULTS MIX
export const DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: [
    { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Tuesday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Wednesday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Friday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Saturday", selectable: true, restDay: false, activeStatus: true },
  ],
  batchTimings: [
    { id: "mma-adults-b1", batchName: "1st Batch", startTime: "01:00 PM", endTime: "02:00 PM", timezone: "GMT (UTC+0)", displayLabel: "01:00 PM – 02:00 PM", activeStatus: true },
    { id: "mma-adults-b2", batchName: "2nd Batch", startTime: "02:30 PM", endTime: "03:30 PM", timezone: "GMT (UTC+0)", displayLabel: "02:30 PM – 03:30 PM", activeStatus: true },
    { id: "mma-adults-b3", batchName: "3rd Batch", startTime: "06:00 PM", endTime: "07:00 PM", timezone: "GMT (UTC+0)", displayLabel: "06:00 PM – 07:00 PM", activeStatus: true },
  ],
  membershipPlans: [
    { daysPerWeek: 1, monthlyPriceUSD: 25, monthlyPriceINR: 1999, label: "1 Day / Week", badge: null, activeStatus: true, curriculum: ["Breathing & meditation exercises for beginners", "Warm-up & full joint flexibility routines", "Martial arts fundamental stances & posture balance", "Basic blocks, punches, and bodyweight alignment"] },
    { daysPerWeek: 2, monthlyPriceUSD: 40, monthlyPriceINR: 3199, label: "2 Days / Week", badge: null, activeStatus: true, curriculum: ["Intermediate breathing exercises & dynamic warm-up", "Basic martial arts movements, punches & front kicks", "Defensive blocks, counter-strikes & footwork", "Core strength conditioning & flexibility drills"] },
    { daysPerWeek: 3, monthlyPriceUSD: 55, monthlyPriceINR: 4399, label: "3 Days / Week", badge: "MOST POPULAR", activeStatus: true, curriculum: ["Advanced meditation, breath control & focus", "5-minute high-intensity cardio workout routine", "Kung-Fu animal stances (Tiger, Eagle, Crane)", "Complex catches, blocks, counter-attacks & combat drills"] },
    { daysPerWeek: 4, monthlyPriceUSD: 70, monthlyPriceINR: 5599, label: "4 Days / Week", badge: null, activeStatus: true, curriculum: ["Master level breathwork & internal power focus", "10-minute stamina cardio & explosive leg conditioning", "Animal stances, rapid combo attacks & takedown defense", "Advanced martial arts fighting combinations & weapon basics"] },
    { daysPerWeek: 5, monthlyPriceUSD: 85, monthlyPriceINR: 6799, label: "5 Days / Week", badge: "BEST VALUE", activeStatus: true, curriculum: ["Master level meditation, mind-body alignment & breathing", "High-volume fat burning, strength & endurance conditioning", "Full animal forms (Tiger, Eagle, Snake) & precision striking", "Advanced self-defense maneuvers & full syllabus mastery", "1-on-1 personalized instructor feedback & skills evaluation"] },
  ],
};

// 3. MMA - LADIES ONLY
export const DEFAULT_MMA_LADIES_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: [
    { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Tuesday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Wednesday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Friday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Saturday", selectable: true, restDay: false, activeStatus: true },
  ],
  batchTimings: [
    { id: "mma-ladies-b1", batchName: "Ladies Morning Batch", startTime: "10:00 AM", endTime: "10:45 AM", timezone: "GMT (UTC+0)", displayLabel: "10:00 AM – 10:45 AM", activeStatus: true },
    { id: "mma-ladies-b2", batchName: "Ladies Evening Batch", startTime: "04:30 PM", endTime: "05:15 PM", timezone: "GMT (UTC+0)", displayLabel: "04:30 PM – 05:15 PM", activeStatus: true },
  ],
  membershipPlans: [
    { daysPerWeek: 1, monthlyPriceUSD: 25, monthlyPriceINR: 1999, label: "1 Day / Week", badge: null, activeStatus: true, curriculum: ["Female self-defense fundamental escapes & wrist releases", "Warm-up flexibility & core toning for women", "Basic martial arts stances & situational awareness"] },
    { daysPerWeek: 2, monthlyPriceUSD: 40, monthlyPriceINR: 3199, label: "2 Days / Week", badge: null, activeStatus: true, curriculum: ["Empowerment self-defense counter strikes & elbow strikes", "Pelvic floor & core stabilization drills", "Dynamic cardio warm-up & waist sculpting"] },
    { daysPerWeek: 3, monthlyPriceUSD: 55, monthlyPriceINR: 4399, label: "3 Days / Week", badge: "MOST POPULAR", activeStatus: true, curriculum: ["Practical street safety & defense against grabs/chokes", "High-energy martial arts cardio burner", "Animal forms for flexibility & upper body toning"] },
    { daysPerWeek: 4, monthlyPriceUSD: 70, monthlyPriceINR: 5599, label: "4 Days / Week", badge: null, activeStatus: true, curriculum: ["Advanced female combat techniques & ground escape drills", "Full body endurance & fat burning circuits", "Martial arts combo striking & precision kicks"] },
    { daysPerWeek: 5, monthlyPriceUSD: 85, monthlyPriceINR: 6799, label: "5 Days / Week", badge: "BEST VALUE", activeStatus: true, curriculum: ["Complete female martial arts & self-defense mastery", "Personalized female instructor feedback & coaching", "Full syllabus evaluation & certification"] },
  ],
};

// 4. FITNESS - KIDS
export const DEFAULT_FITNESS_KIDS_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: [
    { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Tuesday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Wednesday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Friday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Saturday", selectable: false, restDay: true, activeStatus: true },
  ],
  batchTimings: [
    { id: "fit-kids-b1", batchName: "Kids Fitness Batch 1", startTime: "03:30 PM", endTime: "04:15 PM", timezone: "GMT (UTC+0)", displayLabel: "03:30 PM – 04:15 PM", activeStatus: true },
    { id: "fit-kids-b2", batchName: "Kids Fitness Batch 2", startTime: "04:30 PM", endTime: "05:15 PM", timezone: "GMT (UTC+0)", displayLabel: "04:30 PM – 05:15 PM", activeStatus: true },
  ],
  membershipPlans: [
    { daysPerWeek: 1, monthlyPriceUSD: 20, monthlyPriceINR: 1599, label: "1 Day / Week", badge: null, activeStatus: true, curriculum: ["Youth agility games & fun cardiovascular warm-up", "Kid-friendly calisthenics & bodyweight strength", "Postural alignment & active stretching for growth"] },
    { daysPerWeek: 2, monthlyPriceUSD: 35, monthlyPriceINR: 2799, label: "2 Days / Week", badge: null, activeStatus: true, curriculum: ["Stamina building & fun endurance circuits", "Bodyweight squats, jumps, & coordination drills", "Healthy habit building & hydration guidance for kids"] },
    { daysPerWeek: 3, monthlyPriceUSD: 50, monthlyPriceINR: 3999, label: "3 Days / Week", badge: "MOST POPULAR", activeStatus: true, curriculum: ["High-energy youth obstacle conditioning", "Core stability & balance games for young athletes", "Speed & reaction time conditioning"] },
    { daysPerWeek: 4, monthlyPriceUSD: 65, monthlyPriceINR: 5199, label: "4 Days / Week", badge: null, activeStatus: true, curriculum: ["Advanced youth athletic conditioning", "Flexibility mastery & dynamic body control", "Team workout challenges & stamina building"] },
    { daysPerWeek: 5, monthlyPriceUSD: 80, monthlyPriceINR: 6399, label: "5 Days / Week", badge: "BEST VALUE", activeStatus: true, curriculum: ["Complete youth physical fitness transformation", "Personalized fitness tracking for kids", "Youth agility certificate & achievement badge"] },
  ],
};

// 5. FITNESS - ADULTS MIX
export const DEFAULT_FITNESS_ADULTS_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: [
    { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Tuesday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Wednesday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Friday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Saturday", selectable: false, restDay: true, activeStatus: true },
  ],
  batchTimings: [
    { id: "fit-adults-b1", batchName: "Morning HIIT Batch", startTime: "07:00 AM", endTime: "08:00 AM", timezone: "GMT (UTC+0)", displayLabel: "07:00 AM – 08:00 AM", activeStatus: true },
    { id: "fit-adults-b2", batchName: "Afternoon Shred Batch", startTime: "01:30 PM", endTime: "02:30 PM", timezone: "GMT (UTC+0)", displayLabel: "01:30 PM – 02:30 PM", activeStatus: true },
    { id: "fit-adults-b3", batchName: "Evening Burn Batch", startTime: "05:00 PM", endTime: "06:00 PM", timezone: "GMT (UTC+0)", displayLabel: "05:00 PM – 06:00 PM", activeStatus: true },
  ],
  membershipPlans: [
    { daysPerWeek: 1, monthlyPriceUSD: 20, monthlyPriceINR: 1599, label: "1 Day / Week", badge: null, activeStatus: true, curriculum: ["Introduction to HIIT cardio & fat burning basics", "Dynamic bodyweight stretching & warm-up", "Core stabilization & posture correction", "Guided hydration & basic nutrition guidelines"] },
    { daysPerWeek: 2, monthlyPriceUSD: 35, monthlyPriceINR: 2799, label: "2 Days / Week", badge: null, activeStatus: true, curriculum: ["Full body fat loss & metabolic conditioning", "Calisthenics & bodyweight strength circuits", "Targeted abdominal & core sculpting drills", "Stamina building & cardiovascular endurance"] },
    { daysPerWeek: 3, monthlyPriceUSD: 50, monthlyPriceINR: 3999, label: "3 Days / Week", badge: "MOST POPULAR", activeStatus: true, curriculum: ["High-intensity interval training (HIIT) burner", "Lower body toning & leg endurance workouts", "Upper body strength & arm toning routines", "Agility, speed & flexibility conditioning"] },
    { daysPerWeek: 4, monthlyPriceUSD: 65, monthlyPriceINR: 5199, label: "4 Days / Week", badge: null, activeStatus: true, curriculum: ["Advanced tabata & high-volume calorie torching", "Plyometric explosive movement circuits", "Full body muscle toning & posture realignment", "Customized recovery & mobility routines"] },
    { daysPerWeek: 5, monthlyPriceUSD: 80, monthlyPriceINR: 6399, label: "5 Days / Week", badge: "BEST VALUE", activeStatus: true, curriculum: ["Extreme weight loss & physique transformation challenge", "Daily progressive overload & conditioning mastery", "Core power, waist slimming & athletic agility", "Personalized 1-on-1 diet & fitness evaluation", "Full body transformation tracking & feedback"] },
  ],
};

// 6. FITNESS - LADIES ONLY
export const DEFAULT_FITNESS_LADIES_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: [
    { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Tuesday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Wednesday", selectable: false, restDay: true, activeStatus: true },
    { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Friday", selectable: true, restDay: false, activeStatus: true },
    { dayName: "Saturday", selectable: false, restDay: true, activeStatus: true },
  ],
  batchTimings: [
    { id: "fit-ladies-b1", batchName: "Ladies Morning Shred", startTime: "09:30 AM", endTime: "10:15 AM", timezone: "GMT (UTC+0)", displayLabel: "09:30 AM – 10:15 AM", activeStatus: true },
    { id: "fit-ladies-b2", batchName: "Ladies Evening Burn", startTime: "05:30 PM", endTime: "06:15 PM", timezone: "GMT (UTC+0)", displayLabel: "05:30 PM – 06:15 PM", activeStatus: true },
  ],
  membershipPlans: [
    { daysPerWeek: 1, monthlyPriceUSD: 20, monthlyPriceINR: 1599, label: "1 Day / Week", badge: null, activeStatus: true, curriculum: ["Female-focused waist slimming & core stabilization", "Dynamic hip mobility & pelvic alignment warm-up", "Low-impact fat loss cardio for women"] },
    { daysPerWeek: 2, monthlyPriceUSD: 35, monthlyPriceINR: 2799, label: "2 Days / Week", badge: null, activeStatus: true, curriculum: ["Glutes & thigh toning HIIT circuits", "Upper body arm sculpting without bulk", "Postural correction & core tightness exercises"] },
    { daysPerWeek: 3, monthlyPriceUSD: 50, monthlyPriceINR: 3999, label: "3 Days / Week", badge: "MOST POPULAR", activeStatus: true, curriculum: ["High-intensity female calorie burner & tabata", "Abdominal sculpting & waist cinching routines", "Flexibility, balance & stress relief cooldown"] },
    { daysPerWeek: 4, monthlyPriceUSD: 65, monthlyPriceINR: 5199, label: "4 Days / Week", badge: null, activeStatus: true, curriculum: ["Advanced female weight management & body reshaping", "Plyometric leg & booty burn workout", "Personalized hydration & metabolic wellness guidance"] },
    { daysPerWeek: 5, monthlyPriceUSD: 80, monthlyPriceINR: 6399, label: "5 Days / Week", badge: "BEST VALUE", activeStatus: true, curriculum: ["Ultimate female physique transformation challenge", "Daily metabolic conditioning & body toning", "1-on-1 female trainer feedback & progress evaluation"] },
  ],
};

// Aliases for legacy compatibility
export const DEFAULT_TRAINING_DAYS = DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG.trainingDays;
export const DEFAULT_BATCH_TIMINGS = DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG.batchTimings;
export const DEFAULT_MEMBERSHIP_PLANS = DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG.membershipPlans;
export const DEFAULT_CENTRAL_SCHEDULE_CONFIG = DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG;

export type CategoryKey = "mma" | "fitness";
export type GroupKey = "kids" | "adults" | "ladies";

export function normalizeCategoryKey(category?: string): CategoryKey {
  if (!category) return "mma";
  const c = category.toLowerCase().trim();
  if (
    c.includes("fitness") ||
    c.includes("hiit") ||
    c.includes("weight") ||
    c === "fitness-weight-management"
  ) {
    return "fitness";
  }
  return "mma";
}

export function normalizeGroupKey(group?: string): GroupKey {
  if (!group) return "adults";
  const g = group.toLowerCase().trim();
  if (g.includes("kid") || g === "kids") return "kids";
  if (g.includes("lad") || g === "ladies") return "ladies";
  return "adults";
}

export function getCompositeDbKey(category?: string, group?: string): string {
  const cat = normalizeCategoryKey(category);
  const grp = normalizeGroupKey(group);
  return `schedule_pricing_config_${cat}_${grp}`;
}

export function getDefaultScheduleConfig(category?: string, group?: string): CentralScheduleConfig {
  const cat = normalizeCategoryKey(category);
  const grp = normalizeGroupKey(group);

  if (cat === "fitness") {
    if (grp === "kids") return DEFAULT_FITNESS_KIDS_SCHEDULE_CONFIG;
    if (grp === "ladies") return DEFAULT_FITNESS_LADIES_SCHEDULE_CONFIG;
    return DEFAULT_FITNESS_ADULTS_SCHEDULE_CONFIG;
  } else {
    if (grp === "kids") return DEFAULT_MMA_KIDS_SCHEDULE_CONFIG;
    if (grp === "ladies") return DEFAULT_MMA_LADIES_SCHEDULE_CONFIG;
    return DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG;
  }
}

export function calculateMonthlyPrice(
  daysPerWeek: number,
  plansConfig: MembershipPlanConfig[] = DEFAULT_MEMBERSHIP_PLANS
) {
  const plan = plansConfig.find((p) => p.daysPerWeek === daysPerWeek && p.activeStatus !== false);
  if (plan) {
    return {
      priceUSD: plan.monthlyPriceUSD,
      priceINR: plan.monthlyPriceINR,
      badge: plan.badge,
      label: plan.label,
    };
  }
  const defaults: Record<number, { priceUSD: number; priceINR: number; badge: string | null }> = {
    1: { priceUSD: 25, priceINR: 1999, badge: null },
    2: { priceUSD: 40, priceINR: 3199, badge: null },
    3: { priceUSD: 55, priceINR: 4399, badge: "MOST POPULAR" },
    4: { priceUSD: 70, priceINR: 5599, badge: null },
    5: { priceUSD: 85, priceINR: 6799, badge: "BEST VALUE" },
  };
  return defaults[daysPerWeek] || { priceUSD: 55, priceINR: 4399, badge: "MOST POPULAR", label: `${daysPerWeek} Days / Week` };
}

export function validateScheduleSelection(
  daysPerWeek: number,
  selectedDays: string[],
  selectedBatch: string | null,
  config: CentralScheduleConfig = DEFAULT_CENTRAL_SCHEDULE_CONFIG
): { valid: boolean; error?: string } {
  if (daysPerWeek < 1 || daysPerWeek > 5) {
    return { valid: false, error: "Weekly frequency must be between 1 and 5 days per week." };
  }

  const restDays = config.trainingDays
    .filter((d) => d.restDay || !d.selectable)
    .map((d) => d.dayName.toLowerCase());

  const invalidDaysSelected = selectedDays.filter((day) =>
    restDays.includes(day.toLowerCase())
  );

  if (invalidDaysSelected.length > 0) {
    return {
      valid: false,
      error: `Rest Days (${invalidDaysSelected.join(", ")}) cannot be selected for training.`,
    };
  }

  if (selectedDays.length !== daysPerWeek) {
    return {
      valid: false,
      error: `Please select exactly ${daysPerWeek} training day${daysPerWeek > 1 ? "s" : ""}. Currently selected: ${selectedDays.length}.`,
    };
  }

  if (!selectedBatch) {
    return { valid: false, error: "Please select a preferred batch timing." };
  }

  return { valid: true };
}
