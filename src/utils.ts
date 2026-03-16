import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, isSameDay, parseISO, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStreak(completionDates: string[]): { current: number; longest: number } {
  if (completionDates.length === 0) return { current: 0, longest: 0 };

  const sortedDates = [...new Set(completionDates)]
    .map(d => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check current streak
  let lastDate = today;
  let foundToday = false;
  let foundYesterday = false;

  const dateStrings = new Set(completionDates);
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  if (dateStrings.has(todayStr)) {
    foundToday = true;
    currentStreak = 1;
    let checkDate = subDays(today, 1);
    while (dateStrings.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (dateStrings.has(yesterdayStr)) {
    foundYesterday = true;
    currentStreak = 1;
    let checkDate = subDays(today, 2);
    while (dateStrings.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Calculate longest streak
  const ascendingDates = [...sortedDates].sort((a, b) => a.getTime() - b.getTime());
  if (ascendingDates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < ascendingDates.length; i++) {
      const diff = differenceInDays(ascendingDates[i], ascendingDates[i - 1]);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

export function getDaysOfWeek(anchorDate: Date = new Date()) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(subDays(anchorDate, i));
  }
  return days;
}
