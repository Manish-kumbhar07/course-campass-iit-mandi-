import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { StudentProfile } from '../../types';

interface StudentProgressChartsProps {
  profile: StudentProfile;
}

export const StudentProgressCharts: React.FC<StudentProgressChartsProps> = ({ profile }) => {
  const [activeChartTab, setActiveChartTab] = useState<'weekly' | 'retention'>('weekly');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Weekly study data
  const weeklyData = profile.last7DaysStreak || [
    { day: 'Mon', date: 'Oct 08', completed: true, minutes: 50 },
    { day: 'Tue', date: 'Oct 09', completed: true, minutes: 45 },
    { day: 'Wed', date: 'Oct 10', completed: true, minutes: 60 },
    { day: 'Thu', date: 'Oct 11', completed: true, minutes: 45 },
    { day: 'Fri', date: 'Oct 12', completed: true, minutes: 55 },
    { day: 'Sat', date: 'Oct 13', completed: true, minutes: 45 },
    { day: 'Sun', date: 'Oct 14', completed: true, minutes: 45 }
  ];

  const targetMinutes = profile.dailyStudyMinutes || 45;
  const totalMinutesThisWeek = weeklyData.reduce((acc, d) => acc + d.minutes, 0);
  const totalHoursFormatted = (totalMinutesThisWeek / 60).toFixed(1);
  const maxMinutesInWeek = Math.max(...weeklyData.map((d) => d.minutes), 65);

  // 4-Week Mastery trajectory
  const masteryHistory = [
    { week: 'W1 (Sep 23)', mastery: 36, label: 'Initial Baseline' },
    { week: 'W2 (Sep 30)', mastery: 48, label: 'Asymptotics Clear' },
    { week: 'W3 (Oct 07)', mastery: 62, label: 'Recursion Drill' },
    { week: 'W4 (Current)', mastery: profile.overallMastery || 74, label: 'Exam Readiness' },
    { week: 'Exam (Target)', mastery: 90, label: 'Projected Target' }
  ];

  // Syllabus domain progress breakdown
  const domainReadiness = [
    { domain: 'Asymptotic Analysis & Big-O', mastery: 92, status: 'Mastered', hours: '4.2h' },
    { domain: 'Recursion & Call Stacks', mastery: 74, status: 'On Track', hours: '5.8h' },
    { domain: 'Dynamic Programming & Memo', mastery: 78, status: 'Mastered', hours: '3.6h' },
    { domain: 'Graph Traversal (DFS & BFS)', mastery: 58, status: 'In Progress', hours: '4.9h' }
  ];

  return (
    <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E4D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAEFE4] text-[#263F2B]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="font-serif-display text-lg font-bold text-[#263F2B]">
              Student Progress Analytics & Charts
            </h2>
          </div>
          <p className="text-xs text-[#5D655B] mt-0.5">
            Verified study hours, daily goal completions, and syllabus mastery trajectory.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[#F1F2E6] border border-[#E1E4D8] text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveChartTab('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'weekly'
                ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            Weekly Study Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('retention')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'retention'
                ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            Mastery Growth Trend
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      {activeChartTab === 'weekly' ? (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8]">
              <span className="text-[11px] text-[#5D655B] block font-medium">Weekly Study Time</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono-code text-xl font-bold text-[#263F2B]">{totalHoursFormatted}</span>
                <span className="text-xs text-[#5D655B]">hours</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +18% vs last week
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8]">
              <span className="text-[11px] text-[#5D655B] block font-medium">Daily Goals Hit</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                  {weeklyData.filter((d) => d.completed).length} / {weeklyData.length}
                </span>
                <span className="text-xs text-[#5D655B]">days</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-1">
                <CheckCircle2 className="w-3 h-3" /> 100% Consistency
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8]">
              <span className="text-[11px] text-[#5D655B] block font-medium">Daily Target</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono-code text-xl font-bold text-[#263F2B]">{targetMinutes}</span>
                <span className="text-xs text-[#5D655B]">min / day</span>
              </div>
              <span className="text-[10px] text-[#697650] block mt-1">Standard Target</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8]">
              <span className="text-[11px] text-[#5D655B] block font-medium">Study Pace</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono-code text-xl font-bold text-emerald-700">Optimal</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-medium block mt-1">Ahead of exam plan</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8] space-y-4">
            <div className="flex items-center justify-between text-xs text-[#5D655B]">
              <span className="font-semibold text-[#17241B]">Daily Minutes Studied (Last 7 Days)</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#263F2B]"></span>
                  <span>Goal Reached</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-500 border-dashed"></span>
                  <span>Target ({targetMinutes}m)</span>
                </div>
              </div>
            </div>

            {/* Bars container */}
            <div className="relative pt-6 pb-2">
              {/* Target Line */}
              <div
                className="absolute left-0 right-0 border-b-2 border-dashed border-amber-400/80 z-10 pointer-events-none"
                style={{
                  bottom: `${((targetMinutes / maxMinutesInWeek) * 160) + 24}px`
                }}
              >
                <span className="absolute right-0 -top-4 text-[10px] font-mono text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                  Target: {targetMinutes}m
                </span>
              </div>

              {/* Bars Row */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 h-44 items-end">
                {weeklyData.map((dayItem, index) => {
                  const barHeightPercent = Math.min(100, Math.round((dayItem.minutes / maxMinutesInWeek) * 100));
                  const isHovered = hoveredDayIndex === index;

                  return (
                    <div
                      key={dayItem.day + index}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredDayIndex(index)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                    >
                      {/* Tooltip on hover */}
                      <div
                        className={`transition-all duration-150 mb-1 text-[11px] font-mono font-bold text-center ${
                          isHovered ? 'opacity-100 scale-105 text-[#263F2B]' : 'opacity-0 text-transparent'
                        }`}
                      >
                        {dayItem.minutes}m
                      </div>

                      {/* Bar */}
                      <div className="w-full max-w-[48px] bg-[#E5E9DC] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all group-hover:bg-[#D4DCC9]">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            dayItem.completed
                              ? 'bg-gradient-to-t from-[#263F2B] to-[#3D5E43] shadow-xs'
                              : 'bg-[#A8B594]'
                          }`}
                          style={{ height: `${barHeightPercent}%` }}
                        ></div>
                      </div>

                      {/* Day Label */}
                      <div className="mt-2 text-center">
                        <span className="block text-xs font-semibold text-[#17241B]">{dayItem.day}</span>
                        <span className="text-[10px] text-[#777E70] block">{dayItem.date.split(' ')[1]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Retention & Mastery Growth Curve */
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8] space-y-4">
            <div className="flex items-center justify-between text-xs text-[#5D655B]">
              <div>
                <span className="font-semibold text-[#17241B] block">Mastery & Retention Trajectory</span>
                <span className="text-[11px] text-[#5D655B]">Calculated across verified concept reviews</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>+38% Growth This Month</span>
              </div>
            </div>

            {/* SVG Progress Curve */}
            <div className="py-4 px-2">
              <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
                <defs>
                  <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#263F2B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#263F2B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal guidelines */}
                <line x1="20" y1="20" x2="480" y2="20" stroke="#E1E4D8" strokeDasharray="3 3" />
                <line x1="20" y1="60" x2="480" y2="60" stroke="#E1E4D8" strokeDasharray="3 3" />
                <line x1="20" y1="100" x2="480" y2="100" stroke="#E1E4D8" strokeDasharray="3 3" />
                <line x1="20" y1="140" x2="480" y2="140" stroke="#E1E4D8" />

                {/* Y-axis labels */}
                <text x="10" y="24" fontSize="9" fill="#777E70" textAnchor="end">90%</text>
                <text x="10" y="64" fontSize="9" fill="#777E70" textAnchor="end">70%</text>
                <text x="10" y="104" fontSize="9" fill="#777E70" textAnchor="end">50%</text>
                <text x="10" y="144" fontSize="9" fill="#777E70" textAnchor="end">30%</text>

                {/* Shaded Area under Curve */}
                <path
                  d="M 50 130 Q 150 100, 250 65 T 380 40 L 460 25 L 460 140 L 50 140 Z"
                  fill="url(#masteryGradient)"
                />

                {/* The Trend Line */}
                <path
                  d="M 50 130 Q 150 100, 250 65 T 380 40"
                  fill="none"
                  stroke="#263F2B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Projected Line */}
                <path
                  d="M 380 40 L 460 25"
                  fill="none"
                  stroke="#697650"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />

                {/* Data Points */}
                {/* W1 */}
                <circle cx="50" cy="130" r="5" fill="#263F2B" stroke="#ffffff" strokeWidth="2" />
                <text x="50" y="155" fontSize="10" fill="#17241B" textAnchor="middle" fontWeight="bold">W1 (36%)</text>

                {/* W2 */}
                <circle cx="150" cy="100" r="5" fill="#263F2B" stroke="#ffffff" strokeWidth="2" />
                <text x="150" y="155" fontSize="10" fill="#17241B" textAnchor="middle" fontWeight="bold">W2 (48%)</text>

                {/* W3 */}
                <circle cx="260" cy="65" r="5" fill="#263F2B" stroke="#ffffff" strokeWidth="2" />
                <text x="260" y="155" fontSize="10" fill="#17241B" textAnchor="middle" fontWeight="bold">W3 (62%)</text>

                {/* Current */}
                <circle cx="380" cy="40" r="7" fill="#263F2B" stroke="#DCE5CE" strokeWidth="3" />
                <text x="380" y="155" fontSize="10" fill="#263F2B" textAnchor="middle" fontWeight="bold">Today ({profile.overallMastery || 74}%)</text>

                {/* Target */}
                <circle cx="460" cy="25" r="5" fill="#697650" stroke="#ffffff" strokeWidth="2" />
                <text x="460" y="155" fontSize="10" fill="#5D655B" textAnchor="middle">Exam Target (90%)</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Domain Readiness Summary Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#17241B] uppercase tracking-wider">
            Syllabus Domain Progress Breakdown
          </span>
          <span className="text-xs text-[#5D655B]">
            Active Course: <strong className="text-[#263F2B]">{profile.courseCode}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {domainReadiness.map((d) => (
            <div
              key={d.domain}
              className="p-3.5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#17241B] truncate">{d.domain}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.mastery >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : d.mastery >= 60
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {d.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-[#E1E4D8] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.mastery >= 75
                        ? 'bg-[#263F2B]'
                        : d.mastery >= 60
                        ? 'bg-blue-700'
                        : 'bg-amber-600'
                    }`}
                    style={{ width: `${d.mastery}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#5D655B]">
                  <span>Study time: {d.hours}</span>
                  <span className="font-mono-code font-bold text-[#17241B]">{d.mastery}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
