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

export const DEFAULT_TRAINING_DAYS: TrainingDayConfig[] = [
  { dayName: "Sunday", selectable: true, restDay: false, activeStatus: true },
  { dayName: "Monday", selectable: true, restDay: false, activeStatus: true },
  { dayName: "Tuesday", selectable: false, restDay: true, activeStatus: true },
  { dayName: "Wednesday", selectable: true, restDay: false, activeStatus: true },
  { dayName: "Thursday", selectable: true, restDay: false, activeStatus: true },
  { dayName: "Friday", selectable: false, restDay: true, activeStatus: true },
  { dayName: "Saturday", selectable: true, restDay: false, activeStatus: true },
];

export const DEFAULT_BATCH_TIMINGS: BatchTimingConfig[] = [
  {
    id: "batch-1",
    batchName: "1st Batch",
    startTime: "01:00 PM",
    endTime: "02:00 PM",
    timezone: "GMT (UTC+0)",
    displayLabel: "01:00 PM – 02:00 PM",
    activeStatus: true,
  },
  {
    id: "batch-2",
    batchName: "2nd Batch",
    startTime: "02:30 PM",
    endTime: "03:30 PM",
    timezone: "GMT (UTC+0)",
    displayLabel: "02:30 PM – 03:30 PM",
    activeStatus: true,
  },
  {
    id: "batch-3",
    batchName: "3rd Batch",
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    timezone: "GMT (UTC+0)",
    displayLabel: "04:00 PM – 05:00 PM",
    activeStatus: true,
  },
];

export const DEFAULT_MEMBERSHIP_PLANS: MembershipPlanConfig[] = [
  {
    daysPerWeek: 1,
    monthlyPriceUSD: 25,
    monthlyPriceINR: 1999,
    label: "1 Day / Week",
    badge: null,
    activeStatus: true,
    curriculum: [
      "Breathing & meditation exercises for beginners",
      "Warm-up & full joint flexibility routines",
      "Martial arts fundamental stances & posture balance",
      "Basic blocks, punches, and bodyweight alignment",
    ],
  },
  {
    daysPerWeek: 2,
    monthlyPriceUSD: 40,
    monthlyPriceINR: 3199,
    label: "2 Days / Week",
    badge: null,
    activeStatus: true,
    curriculum: [
      "Intermediate breathing exercises & dynamic warm-up",
      "Basic martial arts movements, punches & front kicks",
      "Defensive blocks, counter-strikes & footwork",
      "Core strength conditioning & flexibility drills",
    ],
  },
  {
    daysPerWeek: 3,
    monthlyPriceUSD: 55,
    monthlyPriceINR: 4399,
    label: "3 Days / Week",
    badge: "MOST POPULAR",
    activeStatus: true,
    curriculum: [
      "Advanced meditation, breath control & focus",
      "5-minute high-intensity cardio workout routine",
      "Kung-Fu animal stances (Tiger, Eagle, Crane)",
      "Complex catches, blocks, counter-attacks & combat drills",
    ],
  },
  {
    daysPerWeek: 4,
    monthlyPriceUSD: 70,
    monthlyPriceINR: 5599,
    label: "4 Days / Week",
    badge: null,
    activeStatus: true,
    curriculum: [
      "Master level breathwork & internal power focus",
      "10-minute stamina cardio & explosive leg conditioning",
      "Animal stances, rapid combo attacks & takedown defense",
      "Advanced martial arts fighting combinations & weapon basics",
    ],
  },
  {
    daysPerWeek: 5,
    monthlyPriceUSD: 85,
    monthlyPriceINR: 6799,
    label: "5 Days / Week",
    badge: "BEST VALUE",
    activeStatus: true,
    curriculum: [
      "Master level meditation, mind-body alignment & breathing",
      "High-volume fat burning, strength & endurance conditioning",
      "Full animal forms (Tiger, Eagle, Snake) & precision striking",
      "Advanced self-defense maneuvers & full syllabus mastery",
      "1-on-1 personalized instructor feedback & skills evaluation",
    ],
  },
];

export const DEFAULT_CENTRAL_SCHEDULE_CONFIG: CentralScheduleConfig = {
  trainingDays: DEFAULT_TRAINING_DAYS,
  batchTimings: DEFAULT_BATCH_TIMINGS,
  membershipPlans: DEFAULT_MEMBERSHIP_PLANS,
};

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
  // Fallback defaults
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

  // Check for rest days
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
