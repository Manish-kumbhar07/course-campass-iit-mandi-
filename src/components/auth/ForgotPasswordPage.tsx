import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';
import { Compass, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F7EF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 group mb-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#263F2B] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5 text-[#DCE5CE]" />
          </div>
          <span className="font-serif-display text-2xl font-bold tracking-tight text-[#263F2B]">
            CourseCompass
          </span>
        </button>
        <h1 className="font-serif-display text-2xl font-bold text-[#17241B]">
          Reset your password
        </h1>
        <p className="text-xs text-[#5D655B]">
          Enter your university or personal email to receive secure recovery instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E1E4D8] shadow-sm rounded-2xl space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="recovery-email" className="block font-medium text-[#17241B] mb-1">
                  Registered Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{isLoading ? 'Sending Link...' : 'Send Recovery Instructions'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-[#F1F2E6] border border-[#DCE5CE] text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#263F2B] mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#17241B]">Check your inbox</h4>
                <p className="text-xs text-[#5D655B] leading-relaxed">
                  If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched. For privacy, we do not reveal account existence.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#E1E4D8] text-center text-xs">
            <button
              onClick={() => onNavigate('/sign-in')}
              className="text-[#263F2B] font-semibold hover:underline"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
