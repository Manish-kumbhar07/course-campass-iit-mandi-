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
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface SignInPageProps {
  onNavigate: (route: AppRoute) => void;
  redirectPath?: AppRoute;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onNavigate,
  redirectPath = '/app/dashboard'
}) => {
  const { signIn, sessionExpired, clearSessionExpired } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid academic or personal email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const session = await signIn(trimmedEmail, password, false);
      if (session.user.isNewUser) {
        onNavigate('/onboarding');
      } else {
        onNavigate(redirectPath);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn('ananya.sharma@collegemail.edu', 'demo1234', true);
      onNavigate(redirectPath);
    } catch (err: unknown) {
      setError('Failed to initiate demo session.');
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
          Sign in to your study workspace
        </h1>
        <p className="text-xs text-[#5D655B]">
          Enter your academic credentials to access your private course materials.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E1E4D8] shadow-sm rounded-2xl space-y-6">
          {/* Session Expired Notice */}
          {sessionExpired && (
            <div className="p-3 rounded-lg bg-[#FFF8F8] border border-[#F8E2E3] flex items-start gap-2.5 text-xs text-[#D71935]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Session expired.</span> Please sign in again to continue your session.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-[#FFF8F8] border border-[#F8E2E3] flex items-start gap-2.5 text-xs text-[#D71935]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Quick Demo Mode Switcher */}
          <div className="p-4 rounded-xl bg-[#F1F2E6] border border-[#DCE5CE] space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-[#263F2B]">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#697650]" />
                Demo Mode Access
              </span>
              <span className="font-mono-code text-[11px] text-[#697650]">CS 204</span>
            </div>
            <p className="text-[#5D655B] text-[11px] leading-relaxed">
              Explore the authenticated workspace preloaded as student <strong>Ananya Sharma</strong> (Data Structures & Graphs).
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="w-full mt-1 py-2 px-3 bg-[#263F2B] hover:bg-[#1b2d1f] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Explore as Demo Student (Ananya Sharma)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E1E4D8]"></div>
            <span className="absolute px-3 bg-white text-[11px] text-[#777E70] uppercase tracking-wider font-mono-code">
              Or email credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="email" className="block font-medium text-[#17241B] mb-1">
                Institutional or Personal Email
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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block font-medium text-[#17241B]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="text-[11px] text-[#263F2B] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#5D655B]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#A8B594] text-[#263F2B] focus:ring-[#263F2B]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-2 border-t border-[#E1E4D8] text-center text-xs text-[#5D655B] space-y-2">
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('/sign-up')}
                className="text-[#263F2B] font-semibold hover:underline"
              >
                Create your account
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
