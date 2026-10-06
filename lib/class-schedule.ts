/**
 * Centralized Class Schedule & Upcoming Session Calculator
 * Shared by Student Dashboard and Coach Dashboard to ensure 100% consistent schedule & meeting data.
 */

export interface NextClassSession {
  nextClassDay: string;       // e.g. "Tuesday"
  nextClassDate: string;      // e.g. "Oct 6, 2026"
  nextClassFullDate: string;  // e.g. "Tuesday, Oct 6, 2026"
  relativeLabel: string;      // "Today" | "Tomorrow" | "In 2 days"
  isToday: boolean;
  clockTiming: string;        // e.g. "05:15 PM to 06:00 PM (GMT)"
  timeSlot: string;           // e.g. "Evening"
  dayCombination: string;     // e.g. "5 Days / Week (Monday to Friday)"
  scheduledDays: string[];    // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}

export function parseDayCombinationToDaysList(dcStr: string): string[] {
  if (!dcStr) return ["Monday", "Wednesday", "Friday"];
  const s = dcStr.toLowerCase();
  if (s.includes("monday to friday")) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  if (s.includes("sunday to thursday")) return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  if (s.includes("tuesday to saturday")) return ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (s.includes("sunday & wednesday")) return ["Sunday", "Wednesday"];
  if (s.includes("monday & thursday")) return ["Monday", "Thursday"];
  if (s.includes("saturday & tuesday")) return ["Saturday", "Tuesday"];
  if (s.includes("mon, wed, fri")) return ["Monday", "Wednesday", "Friday"];
  if (s.includes("tue, thu, sat")) return ["Tuesday", "Thursday", "Saturday"];

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const found = weekDays.filter(
    (d) => s.includes(d.toLowerCase()) || s.includes(d.slice(0, 3).toLowerCase())
  );
  return found.length > 0 ? found : ["Monday", "Wednesday", "Friday"];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function calculateNextClassSession(
  dayCombination: string,
  clockTiming?: string | null,
  timeSlot?: string | null,
  referenceDate: Date = new Date()
): NextClassSession {
  const timing = clockTiming || "05:00 PM to 06:00 PM (GMT)";
  const slot = timeSlot || "Evening";
  const daysList = parseDayCombinationToDaysList(dayCombination);

  const matchedDayIndexes = daysList
    .map((dayName) => DAY_NAMES.findIndex((d) => d.toLowerCase() === dayName.toLowerCase()))
    .filter((idx) => idx >= 0);

  const validIndexes = matchedDayIndexes.length > 0 ? matchedDayIndexes : [1, 3, 5];

  const currentDayIndex = referenceDate.getDay();

  // Search forward from today (offset 0) up to 7 days
  for (let offset = 0; offset < 7; offset++) {
    const candidateDayIndex = (currentDayIndex + offset) % 7;
    if (validIndexes.includes(candidateDayIndex)) {
      const targetDate = new Date(referenceDate);
      targetDate.setDate(referenceDate.getDate() + offset);

      const isToday = offset === 0;
      const dayName = DAY_NAMES[candidateDayIndex];
      const dateFormatted = targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const fullDateFormatted = `${dayName}, ${dateFormatted}`;
      const relativeLabel = isToday ? "Today" : offset === 1 ? "Tomorrow" : `In ${offset} days`;

      return {
        nextClassDay: dayName,
        nextClassDate: dateFormatted,
        nextClassFullDate: fullDateFormatted,
        relativeLabel,
        isToday,
        clockTiming: timing,
        timeSlot: slot,
        dayCombination: dayCombination || "Weekly Schedule",
        scheduledDays: daysList,
      };
    }
  }

  // Fallback
  return {
    nextClassDay: "Next Scheduled Day",
    nextClassDate: "Upcoming",
    nextClassFullDate: "Upcoming Class",
    relativeLabel: "Upcoming",
    isToday: false,
    clockTiming: timing,
    timeSlot: slot,
    dayCombination: dayCombination || "Weekly Schedule",
    scheduledDays: daysList,
  };
}
