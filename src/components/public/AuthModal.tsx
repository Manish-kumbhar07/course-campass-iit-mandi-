import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, UserCheck, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterAsDemoStudent: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onEnterAsDemoStudent
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('ananya.sharma@collegemail.edu');
  const [password, setPassword] = useState('••••••••••••');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnterAsDemoStudent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white border border-[#E1E4D8] rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F7EF] border-b border-[#E1E4D8]">
          <div className="flex items-center gap-2">
            <span className="font-serif-display text-lg font-bold text-[#263F2B]">
              CourseCompass
            </span>
            <span className="text-xs text-[#5D655B]">· Student Portal</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5D655B] hover:text-[#17241B] hover:bg-[#E1E4D8]/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* 1-Click Demo Profile Banner */}
          <div className="p-4 rounded-lg bg-[#F1F2E6] border border-[#DCE5CE] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#263F2B]">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#697650]" />
                Demo Student Sandbox
              </span>
              <span className="text-[#697650]">CS 204 Preloaded</span>
            </div>
            <p className="text-xs text-[#5D655B] leading-relaxed">
              Explore the full interactive platform immediately as second-year student <strong>Ananya Sharma</strong> preparing for her Data Structures examination.
            </p>
            <button
              onClick={() => {
                onEnterAsDemoStudent();
                onClose();
              }}
              className="w-full mt-2 py-2.5 px-4 bg-[#263F2B] hover:bg-[#1b2d1f] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Launch Demo as Ananya Sharma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E1E4D8]"></div>
            <span className="absolute px-3 bg-white text-[11px] text-[#777E70] uppercase tracking-wider">
              Or university email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#17241B] mb-1">
                Institutional Email (.edu)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E1E4D8] rounded-lg focus:outline-none focus:border-[#263F2B] bg-[#F8F7EF]/50"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#17241B] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E1E4D8] rounded-lg focus:outline-none focus:border-[#263F2B] bg-[#F8F7EF]/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {mode === 'signin' ? 'Sign In to Student Workspace' : 'Create Student Account'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="flex items-center justify-between text-xs text-[#5D655B] pt-1">
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="hover:text-[#17241B] underline underline-offset-4"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
            </button>
            <span className="text-[11px] text-[#777E70] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#697650]" /> FERPA Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
