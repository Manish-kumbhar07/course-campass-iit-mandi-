import React, { useState } from 'react';
import { Flame, CheckCircle2, Award, Zap, Shield, Sparkles, ChevronRight, Clock, Plus } from 'lucide-react';
import { StudentProfile } from '../../types';

interface StudyStreakProps {
  profile: StudentProfile;
  onOpenSprint?: () => void;
  onStartQuiz?: () => void;
}

export const StudyStreak: React.FC<StudyStreakProps> = ({
  profile,
  onOpenSprint,
  onStartQuiz
}) => {
  const [bonusMinutes, setBonusMinutes] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const streakDays = profile.studyStreakDays || 7;
  const longestStreak = profile.longestStreakDays || 14;
  const dailyTargetMinutes = profile.dailyStudyMinutes || 45;
  const currentMinutes = (profile.todayMinutesCompleted || 45) + bonusMinutes;
  const isGoalMet = currentMinutes >= dailyTargetMinutes;
  const progressPct = Math.min(100, Math.round((currentMinutes / dailyTargetMinutes) * 100));

  const weekHistory = profile.last7DaysStreak || [
    { day: 'Wed', date: 'Oct 08', completed: true, minutes: 50 },
    { day: 'Thu', date: 'Oct 09', completed: true, minutes: 45 },
    { day: 'Fri', date: 'Oct 10', completed: true, minutes: 60 },
    { day: 'Sat', date: 'Oct 11', completed: true, minutes: 45 },
    { day: 'Sun', date: 'Oct 12', completed: true, minutes: 55 },
    { day: 'Mon', date: 'Oct 13', completed: true, minutes: 45 },
    { day: 'Today', date: 'Oct 14', completed: true, minutes: currentMinutes }
  ];

  const handleAddBonus = () => {
    setBonusMinutes((prev) => prev + 15);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-emerald-50/50 border border-[#E9DFCE] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden text-[#17241B]">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Flex / Grid */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Animated Flame & Streak Milestone */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Encouraging Flame Visual Indicator */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105 duration-300">
              <Flame className="w-8 h-8 animate-pulse text-amber-100" />
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              ✓
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-600" />
                Study Streak Active
              </span>
              <span className="text-xs font-medium text-[#687563]">
                Daily Goal Hit
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17241B] flex items-center gap-2">
              <span>{streakDays} Days in a Row!</span>
              <span className="text-base font-normal text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-mono">
                Top 5% Consistency
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#556150] max-w-xl leading-relaxed">
              You've hit your <strong className="text-[#17241B]">{dailyTargetMinutes}-minute</strong> daily study goal for <strong className="text-[#17241B]">{streakDays} consecutive days</strong>. Consistent recall reinforces memory retention for your upcoming exam.
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action & Goal Status */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
          <div className="bg-white/80 backdrop-blur-xs border border-[#E2DCce] rounded-xl px-4 py-2.5 text-center shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A8674]">
              Personal Best
            </span>
            <span className="text-base font-bold font-mono text-[#17241B]">
              {longestStreak} Days
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-[#E2DCce] rounded-xl px-4 py-2.5 text-center shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Shield
            </span>
            <span className="text-base font-bold font-mono text-emerald-700">
              1 Active
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddBonus}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F7F9F4] border border-[#D5DFCF] text-[#1E3B27] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>+15m Sprint</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: 7-Day Visual Activity Strip & Daily Progress Bar */}
      <div className="mt-5 pt-4 border-t border-[#E8DFC8] grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* 7-Day History Capsules */}
        <div className="md:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#5A6653] uppercase tracking-wider">
              Last 7 Days Activity
            </span>
            <span className="text-emerald-800 font-medium">
              7 / 7 Target Goals Achieved
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekHistory.map((item, index) => {
              const isToday = item.day === 'Today' || index === weekHistory.length - 1;
              return (
                <div
                  key={index}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isToday
                      ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                      : 'bg-white border-[#E1E5D8] text-[#17241B]'
                  }`}
                >
                  <span
                    className={`block text-[10px] font-semibold uppercase tracking-wider ${
                      isToday ? 'text-orange-100' : 'text-[#7D8877]'
                    }`}
                  >
                    {item.day}
                  </span>
                  <div className="my-1 flex items-center justify-center">
                    {isToday ? (
                      <Flame className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <span
                    className={`block font-mono text-[10px] font-bold ${
                      isToday ? 'text-white' : 'text-[#3E4A38]'
                    }`}
                  >
                    {isToday ? `${currentMinutes}m` : `${item.minutes}m`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Target Goal Progress Bar */}
        <div className="md:col-span-5 bg-white/90 border border-[#E3E8DC] rounded-xl p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#17241B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Today's Daily Target</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-800">
              {currentMinutes} / {dailyTargetMinutes} min ({progressPct}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#E8ECE3] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalMet
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {isGoalMet ? 'Daily Goal Met! Keep the streak burning.' : 'Almost there! 10m remaining.'}
            </span>
            {showCelebration && (
              <span className="text-orange-600 font-bold animate-pulse text-[11px]">
                🎉 +15m added!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Encouraging Motivation Strip */}
      <div className="mt-4 pt-3.5 border-t border-[#E8DFC8]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white/50 rounded-xl p-3 border border-[#EBE4D5]">
        <div className="flex items-center gap-2 text-[#465342]">
          <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">
            ★
          </span>
          <p className="text-[11px] leading-relaxed">
            <strong className="text-[#17241B]">Milestone Track:</strong> Reach <span className="font-semibold text-orange-800">10 consecutive days</span> (3 days left) to unlock the permanent <span className="font-semibold text-[#17241B]">"Distinction Shield"</span> exam boost badge.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onStartQuiz}
            className="px-3 py-1 rounded-lg bg-[#263F2B] hover:bg-[#1E3322] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Practice 5-Min Drill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
