import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { AppRoute, PublicTab } from '../../types';
import { ArrowRight, Menu, X } from 'lucide-react';

interface PublicNavbarProps {
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onNavigate: (route: AppRoute) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentTab,
  onSelectTab,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: PublicTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const navLinks: { tab: PublicTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'features', label: 'Features' },
    { tab: 'how-it-works', label: 'Curriculum' },
    { tab: 'security', label: 'Resources' },
    { tab: 'pricing', label: 'Pricing' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E5E5EA]">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Apple-clean) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
            aria-label="CourseCompass home"
          >
            <Logo size="md" />
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean Apple typography) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.tab;
            return (
              <button
                key={link.tab}
                type="button"
                onClick={() => handleTabClick(link.tab)}
                className={`whitespace-nowrap transition-colors py-1 text-xs sm:text-sm ${
                  isActive
                    ? 'text-[#1D1D1F] font-semibold'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Sign In and Start Learning) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/sign-in')}
            className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-[#1D1D1F] hover:text-[#1B4D3E] py-2 px-3 transition-colors whitespace-nowrap"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('/sign-up')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-[#142417] hover:bg-[#0B150D] rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Start Learning</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1D1D1F] hover:text-[#1B4D3E] rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5EA] bg-white p-4 space-y-3 shadow-lg">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.tab}
                type="button"
                onClick={() => handleTabClick(link.tab)}
                className={`text-left py-2 px-3 rounded-lg transition-colors ${
                  currentTab === link.tab
                    ? 'bg-[#F5F5F7] text-[#1D1D1F] font-semibold'
                    : 'text-[#86868B] hover:bg-[#F5F5F7]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
