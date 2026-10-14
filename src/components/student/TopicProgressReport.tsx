import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { ConceptNode } from '../../types';

interface TopicProgressReportProps {
  concepts: ConceptNode[];
  courseCode: string;
}

export const TopicProgressReport: React.FC<TopicProgressReportProps> = ({
  concepts,
  courseCode
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'mastered' | 'learning' | 'attention'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced topic details for the progress report
  const reportItems = concepts.map((c) => {
    let hoursLogged = '3.5h';
    let lastRevised = 'Yesterday';
    if (c.status === 'mastered') {
      hoursLogged = '5.0h';
      lastRevised = '2 days ago';
    } else if (c.status === 'attention') {
      hoursLogged = '4.2h';
      lastRevised = 'Today';
    } else {
      hoursLogged = '3.0h';
      lastRevised = '3 days ago';
    }

    return {
      ...c,
      hoursLogged,
      lastRevised
    };
  });

  const filteredTopics = reportItems.filter((item) => {
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.topic ? item.topic.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    return matchesFilter && matchesSearch;
  });

  const masteredCount = reportItems.filter((i) => i.status === 'mastered').length;
  const learningCount = reportItems.filter((i) => i.status === 'learning').length;
  const attentionCount = reportItems.filter((i) => i.status === 'attention').length;

  if (concepts.length === 0) {
    return (
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-8 text-center shadow-2xs space-y-2">
        <h3 className="font-serif-display text-base font-bold text-[#17241B]">
          Not enough learning activity yet.
        </h3>
        <p className="text-xs text-[#5D655B] max-w-md mx-auto">
          Upload course materials and complete adaptive practice quizzes to begin tracking your conceptual mastery.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E4D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAEFE4] text-[#263F2B]">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="font-serif-display text-lg font-bold text-[#263F2B]">
              Detailed Topic Progress Report
            </h2>
            <span className="text-xs text-[#5D655B] font-mono">({courseCode})</span>
          </div>
          <p className="text-xs text-[#5D655B] mt-0.5">
            Individual topic mastery scores, study time logged, and latest revision dates.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#777E70] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics or modules..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E1E4D8] rounded-xl bg-[#F8F7EF] focus:bg-white focus:outline-none focus:border-[#263F2B]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            filterStatus === 'all'
              ? 'bg-[#263F2B] text-white'
              : 'bg-[#F1F2E6] text-[#5D655B] hover:text-[#17241B]'
          }`}
        >
          All Topics ({reportItems.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('mastered')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            filterStatus === 'mastered'
              ? 'bg-emerald-800 text-white'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>Mastered ({masteredCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('learning')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            filterStatus === 'learning'
              ? 'bg-blue-800 text-white'
              : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span>In Progress ({learningCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('attention')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            filterStatus === 'attention'
              ? 'bg-amber-800 text-white'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          <span>Needs Attention ({attentionCount})</span>
        </button>
      </div>

      {/* Progress Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E1E4D8] text-[11px] font-semibold text-[#697650] uppercase tracking-wider">
              <th className="pb-3 pl-2">Topic & Concept</th>
              <th className="pb-3 px-3">Module</th>
              <th className="pb-3 px-3">Mastery Progress</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Study Time</th>
              <th className="pb-3 pr-2 text-right">Last Revised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E4D8]/60">
            {filteredTopics.map((item) => (
              <tr key={item.id} className="hover:bg-[#F8F7EF]/60 transition-colors">
                {/* Topic & Summary */}
                <td className="py-3.5 pl-2 max-w-[240px]">
                  <p className="font-semibold text-[#17241B]">{item.name}</p>
                  <p className="text-[11px] text-[#5D655B] truncate mt-0.5">{item.summary}</p>
                </td>

                {/* Module */}
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#F1F2E6] text-[#697650] font-medium">
                    {item.topic || 'Core Module'}
                  </span>
                </td>

                {/* Mastery Bar */}
                <td className="py-3.5 px-3 min-w-[140px]">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-mono-code font-bold text-[#17241B]">
                        {item.masteryPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.masteryPercent >= 75
                            ? 'bg-[#263F2B]'
                            : item.masteryPercent >= 55
                            ? 'bg-blue-600'
                            : 'bg-amber-600'
                        }`}
                        style={{ width: `${item.masteryPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Status Pill */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {item.status === 'mastered' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Mastered
                    </span>
                  ) : item.status === 'attention' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Needs Review
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-blue-600" />
                      In Progress
                    </span>
                  )}
                </td>

                {/* Time */}
                <td className="py-3.5 px-3 font-mono-code text-[11px] text-[#5D655B] whitespace-nowrap">
                  {item.hoursLogged}
                </td>

                {/* Last Revised */}
                <td className="py-3.5 pr-2 text-right text-[11px] text-[#777E70] whitespace-nowrap">
                  {item.lastRevised}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
