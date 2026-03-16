export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completions: string[]; // Array of dates
}
