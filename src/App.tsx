/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Check, 
  Flame, 
  Trophy, 
  Calendar, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Settings2,
  X
} from 'lucide-react';
import { format, isSameDay, startOfToday, subDays, addDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Habit, Completion, HabitWithStats } from './types';
import { cn, getStreak, getDaysOfWeek } from './utils';

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
];

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [completions, setCompletions] = useState<Completion[]>(() => {
    const saved = localStorage.getItem('completions');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  const habitsWithStats = useMemo(() => {
    return habits.map(habit => {
      const habitCompletions = completions
        .filter(c => c.habitId === habit.id)
        .map(c => c.date);
      
      const { current, longest } = getStreak(habitCompletions);
      
      return {
        ...habit,
        currentStreak: current,
        longestStreak: longest,
        totalCompletions: habitCompletions.length,
        completions: habitCompletions
      } as HabitWithStats;
    });
  }, [habits, completions]);

  const toggleCompletion = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const exists = completions.find(c => c.habitId === habitId && c.date === dateStr);

    if (exists) {
      setCompletions(completions.filter(c => !(c.habitId === habitId && c.date === dateStr)));
    } else {
      setCompletions([...completions, { habitId, date: dateStr }]);
    }
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      color: selectedColor,
      createdAt: Date.now(),
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setIsAddModalOpen(false);
  };

  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
    setCompletions(completions.filter(c => c.habitId !== id));
    setHabitToDelete(null);
  };

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(subDays(viewDate, i));
    }
    return days;
  }, [viewDate]);

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = completions.filter(c => c.date === dateStr).length;
      return {
        date: format(date, 'MMM dd'),
        completions: count,
      };
    });
    return last30Days;
  }, [completions]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Check size={24} strokeWidth={3} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">HabitFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95 shadow-md shadow-indigo-100"
            >
              <Plus size={20} />
              <span>New Habit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Streaks</p>
              <p className="text-2xl font-bold">
                {habitsWithStats.reduce((acc, h) => acc + h.currentStreak, 0)}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Completions</p>
              <p className="text-2xl font-bold">{completions.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Habits</p>
              <p className="text-2xl font-bold">{habits.length}</p>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        {completions.length > 0 && (
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Activity (Last 30 Days)</h2>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completions" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorComp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Habits List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">My Habits</h2>
            <div className="flex items-center bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setViewDate(subDays(viewDate, 7))}
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 text-sm font-semibold text-gray-600">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
              </span>
              <button 
                onClick={() => setViewDate(addDays(viewDate, 7))}
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {habitsWithStats.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <Calendar size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">No habits yet</h3>
                  <p className="text-gray-500">Start your journey by adding your first habit.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Create a habit now
                </button>
              </div>
            ) : (
              habitsWithStats.map((habit) => (
                <motion.div 
                  layout
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div 
                        className="w-3 h-10 rounded-full" 
                        style={{ backgroundColor: habit.color }} 
                      />
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{habit.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-orange-500 text-sm font-bold">
                            <Flame size={14} />
                            <span>{habit.currentStreak} day streak</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                            <Trophy size={14} />
                            <span>Best: {habit.longestStreak}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                      {weekDays.map((day) => {
                        const isCompleted = habit.completions.includes(format(day, 'yyyy-MM-dd'));
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <div key={day.toString()} className="flex flex-col items-center gap-2">
                            <span className={cn(
                              "text-[10px] uppercase tracking-wider font-bold",
                              isToday ? "text-indigo-600" : "text-gray-400"
                            )}>
                              {format(day, 'EEE')}
                            </span>
                            <button
                              onClick={() => toggleCompletion(habit.id, day)}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90",
                                isCompleted 
                                  ? "text-white shadow-lg" 
                                  : "bg-gray-50 text-transparent hover:bg-gray-100 border border-gray-100"
                              )}
                              style={{ 
                                backgroundColor: isCompleted ? habit.color : undefined,
                                boxShadow: isCompleted ? `0 8px 16px -4px ${habit.color}40` : undefined
                              }}
                            >
                              <Check size={20} strokeWidth={3} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-300">
                              {format(day, 'd')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      onClick={() => setHabitToDelete(habit.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHabitToDelete(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Habit?</h2>
              <p className="text-gray-500 mb-8">
                This action cannot be undone. All your progress and streaks for this habit will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setHabitToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteHabit(habitToDelete)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">New Habit</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addHabit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Habit Name
                  </label>
                  <input 
                    autoFocus
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Morning Meditation"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Choose Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-full transition-all active:scale-90 border-4",
                          selectedColor === color ? "border-gray-200 scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Create Habit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-5xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400 text-sm font-medium">
          Consistency is the key to mastery. Keep flowing.
        </p>
      </footer>
    </div>
  );
}
