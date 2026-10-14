import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';
import {
  Compass,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAgreed) {
      setError('Please agree to the privacy policy and academic terms.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(name, email, password);
      // New user flow: route to onboarding
      onNavigate('/onboarding');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
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
          Build your study path
        </h1>
        <p className="text-xs text-[#5D655B]">
          Create a private study workspace for your upcoming university examinations.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E1E4D8] shadow-sm rounded-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-[#FFF8F8] border border-[#F8E2E3] flex items-start gap-2.5 text-xs text-[#D71935]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="name" className="block font-medium text-[#17241B] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-9 pr-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block font-medium text-[#17241B] mb-1">
                Institutional Email (.edu) or Personal
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  id="email"
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

            <div>
              <label htmlFor="password" className="block font-medium text-[#17241B] mb-1">
                Password (minimum 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#777E70] hover:text-[#17241B]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-medium text-[#17241B] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-[#5D655B] text-[11px] leading-normal">
                <input
                  type="checkbox"
                  required
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#A8B594] text-[#263F2B] focus:ring-[#263F2B]"
                />
                <span>
                  I agree to the academic privacy policy and affirm that uploaded course materials belong to my enrolled university syllabus.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{isLoading ? 'Creating Workspace...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-[#E1E4D8] text-center text-xs text-[#5D655B] space-y-2">
            <p>
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('/sign-in')}
                className="text-[#263F2B] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
            <p>
              <button
                onClick={() => onNavigate('/')}
                className="text-[11px] text-[#777E70] hover:underline"
              >
                ← Back to public homepage
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
