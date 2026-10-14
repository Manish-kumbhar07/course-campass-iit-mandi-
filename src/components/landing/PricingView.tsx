import React, { useState } from 'react';
import {
  Check,
  Shield,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap,
  GraduationCap,
  Building2,
  CheckCircle2,
  Lock,
  ChevronDown,
  Info
} from 'lucide-react';
import { AppRoute } from '../../types';

interface PricingViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'term'>('term');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const pricingFaqs = [
    {
      q: 'Is CourseCompass truly free for individual college students?',
      a: 'Yes. Our Student Starter tier is 100% free forever. You can upload lecture notes, textbook chapters, slide decks, ask source-grounded questions, take diagnostic quizzes, and generate prerequisite maps without ever entering a credit card.'
    },
    {
      q: 'What is included in the Student Pro / Exam Pass?',
      a: 'Student Pro unlocks unlimited video lecture ingestion with millisecond-precision scrubbing, unlimited courses, personalized daily 45-minute exam cram sprints, LaTeX formula exports, and priority response speed from the Socratic tutor.'
    },
    {
      q: 'Do you offer student discounts or financial assistance?',
      a: 'Yes! When you sign up with a valid .edu or university domain, the annual term pass is automatically discounted by 35%. Students who demonstrate financial need can also request a free 1-year Pro grant by contacting support.'
    },
    {
      q: 'Are my uploaded materials private?',
      a: 'Strictly private. We operate with a strict FERPA-aligned mindset. Your course syllabi, lecture recordings, and study notes are never sold, never shared, and never used to train public foundation models.'
    },
    {
      q: 'Can I cancel or downgrade anytime?',
      a: 'Yes. There are no lock-in contracts or cancellation penalties. You can cancel with a single click from your account settings and retain full access until the end of your billing cycle.'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B4D3E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Academic Pricing</span>
        </div>

        <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight">
          Invest in Deep Mastery, Not Distractions.
        </h1>
        
        <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
          Start free with your university email. Upgrade to Exam Pass when preparing for intensive midterms and finals.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 text-xs">
          <span className={`font-medium ${billingCycle === 'monthly' ? 'text-[#1D1D1F] font-semibold' : 'text-[#86868B]'}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'term' : 'monthly')}
            className="w-13 h-7 bg-[#142417] rounded-full p-1 relative transition-colors focus:outline-none"
            aria-label="Toggle billing interval"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform transform ${
                billingCycle === 'term' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`font-medium ${billingCycle === 'term' ? 'text-[#1D1D1F] font-semibold' : 'text-[#86868B]'}`}>
              Annual Term Pass
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
              Save 35%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        
        {/* Tier 1: Student Starter */}
        <div className="bg-white border border-[#E5E5EA] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Free Tier
                </span>
                <h3 className="font-serif-display font-bold text-xl text-[#1D1D1F]">
                  Student Starter
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] text-[#142417] flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              Essential source-grounded tutoring for individual college students studying for class.
            </p>

            <div className="flex items-baseline gap-1">
              <span className="font-serif-display text-4xl font-bold text-[#1D1D1F]">$0</span>
              <span className="text-xs text-[#86868B]">/ free forever</span>
            </div>

            <div className="space-y-3 pt-5 border-t border-[#E5E5EA] text-xs">
              <span className="font-semibold text-[#1D1D1F] block text-[11px] uppercase tracking-wider">
                What's Included:
              </span>
              <ul className="space-y-2.5 text-[#515154]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Up to 3 active courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>PDF, slide, and notes upload (up to 50 MB / course)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Source-grounded Socratic tutor with citations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automatic prerequisite concept graph</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Adaptive diagnostic quizzes with misconceptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>FERPA-aligned private workspace</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('/sign-up')}
              className="w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#E5E5EA] text-[#1D1D1F] rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-center text-[#86868B] mt-2">
              No credit card required
            </p>
          </div>
        </div>

        {/* Tier 2: Student Pro / Exam Pass (Highlighted) */}
        <div className="bg-white border-2 border-[#142417] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative transform lg:-translate-y-2">
          {/* Top Tag */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#142417] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
            <Zap className="w-3 h-3 fill-current text-emerald-400" />
            <span>Recommended for Exams</span>
          </div>

          <div className="space-y-6 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B4D3E]">
                  Exam Pass
                </span>
                <h3 className="font-serif-display font-bold text-xl text-[#1D1D1F]">
                  Student Pro
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#142417] text-white flex items-center justify-center shadow-sm">
                <Zap className="w-4.5 h-4.5" />
              </div>
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              Designed for exam crunch times with full video ingestion, automated sprint plans, and deep recall drills.
            </p>

            <div className="flex items-baseline gap-1">
              <span className="font-serif-display text-4xl font-bold text-[#1D1D1F]">
                {billingCycle === 'term' ? '$3.25' : '$4.99'}
              </span>
              <span className="text-xs text-[#86868B]">
                {billingCycle === 'term' ? '/ month (billed $39/yr)' : '/ month'}
              </span>
            </div>

            <div className="space-y-3 pt-5 border-t border-[#E5E5EA] text-xs">
              <span className="font-semibold text-[#1D1D1F] block text-[11px] uppercase tracking-wider">
                Everything in Starter, plus:
              </span>
              <ul className="space-y-2.5 text-[#1D1D1F]">
                <li className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unlimited courses &amp; document storage</span>
                </li>
                <li className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Video lecture recordings with millisecond citations</span>
                </li>
                <li className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Audio office hours &amp; spoken lecture transcription</span>
                </li>
                <li className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Personalized 45-min daily exam prep schedules</span>
                </li>
                <li className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>LaTeX formula sheet &amp; PDF summary export</span>
                </li>
                <li className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority Socratic AI speed &amp; deep reasoning</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('/sign-up')}
              className="w-full py-3 bg-[#142417] hover:bg-[#0B150D] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-95"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-center text-[#86868B] mt-2">
              Cancel anytime with 1 click · Zero penalty
            </p>
          </div>
        </div>

        {/* Tier 3: Department / Campus Pass */}
        <div className="bg-white border border-[#E5E5EA] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Institutional
                </span>
                <h3 className="font-serif-display font-bold text-xl text-[#1D1D1F]">
                  Campus Pass
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] text-[#142417] flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              Designed for university academic departments, tutoring centers, and faculty course cohorts.
            </p>

            <div className="flex items-baseline gap-1">
              <span className="font-serif-display text-4xl font-bold text-[#1D1D1F]">Custom</span>
              <span className="text-xs text-[#86868B]">/ department billing</span>
            </div>

            <div className="space-y-3 pt-5 border-t border-[#E5E5EA] text-xs">
              <span className="font-semibold text-[#1D1D1F] block text-[11px] uppercase tracking-wider">
                Institutional Features:
              </span>
              <ul className="space-y-2.5 text-[#515154]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Campus-wide LMS integration (Canvas, Blackboard, Moodle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Department syllabus repository syncing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cohort misconception telemetry for professors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>FERPA &amp; SOC2 compliance agreements</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated academic success coordinator</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('/contact')}
              className="w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#E5E5EA] text-[#1D1D1F] rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <span>Contact Campus Licensing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-center text-[#86868B] mt-2">
              Pilots available for fall/spring semesters
            </p>
          </div>
        </div>
      </div>

      {/* Pricing FAQs Accordion */}
      <div className="max-w-3xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1B4D3E]">
            Frequently Asked Questions
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
            Transparent Answers for College Students
          </h2>
        </div>

        <div className="space-y-3">
          {pricingFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5E5EA] rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#1D1D1F]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868B] transition-transform ${
                      isOpen ? 'rotate-180 text-[#1B4D3E]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#515154] leading-relaxed border-t border-[#F5F5F7]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Guarantee Banner */}
      <div className="p-6 rounded-3xl bg-[#F5F5F7] border border-[#E5E5EA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#515154]">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#142417] shrink-0" />
          <div>
            <span className="font-semibold text-sm text-[#1D1D1F] block">
              100% Academic Trust Guarantee
            </span>
            <p className="text-xs text-[#86868B]">
              Your course files are never sold and never used to train public foundation models.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('/sign-up')}
          className="px-6 py-2.5 bg-[#142417] hover:bg-[#0B150D] text-white rounded-full font-semibold text-xs transition-colors shrink-0"
        >
          Start Free Today
        </button>
      </div>
    </div>
  );
};
