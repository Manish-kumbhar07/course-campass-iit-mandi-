import React, { useState } from 'react';
import { User, StudentProfile, EnrolledSubject } from '../../types';
import { Logo } from '../common/Logo';
import {
  Compass,
  Calendar,
  Network,
  Bot,
  HelpCircle,
  TrendingUp,
  Layers,
  UploadCloud,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Maximize2,
  Minimize2,
  Menu,
  X,
  BookOpen,
  Plus,
  Flame,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';

export type AuthenticatedTab =
  | 'dashboard'
  | 'overview'
  | 'courses'
  | 'tutor'
  | 'map'
  | 'practice'
  | 'mastery'
  | 'study-plan'
  | 'sprint'
  | 'revision'
  | 'materials'
  | 'settings';

interface AppShellProps {
  user: User;
  profile: StudentProfile;
  currentTab: AuthenticatedTab;
  onNavigateTab: (tab: AuthenticatedTab) => void;
  onSignOut: () => void;
  onNewCourse: () => void;
  onSwitchSubject?: (subject: EnrolledSubject) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  user,
  profile,
  currentTab,
  onNavigateTab,
  onSignOut,
  onNewCourse,
  onSwitchSubject,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: { id: AuthenticatedTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'map', label: 'Course Map', icon: Network },
    { id: 'practice', label: 'Adaptive Quiz', icon: HelpCircle },
    { id: 'sprint', label: 'Study Sprint', icon: Compass },
    { id: 'mastery', label: 'Mastery Tracker', icon: TrendingUp },
    { id: 'study-plan', label: 'Study Plan', icon: Calendar },
    { id: 'revision', label: 'Revision', icon: Layers },
    { id: 'materials', label: 'Course Files', icon: UploadCloud },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabClick = (tabId: AuthenticatedTab) => {
    onNavigateTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7EF] text-[#17241B] flex flex-col font-sans-body antialiased">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 w-full bg-[#F8F7EF]/95 backdrop-blur-md border-b border-[#E1E4D8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Brand + Course Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#5D655B] hover:text-[#17241B] rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onNavigateTab('dashboard')}
              className="flex items-center gap-2 group"
            >
              <Logo size="sm" showWordmark={false} />
              <span className="font-serif-display font-bold text-lg text-[#263F2B] hidden sm:inline-block">
                CourseCompass
              </span>
            </button>

            {/* Course Selector Dropdown */}
            <div className="relative hidden sm:block pl-3 border-l border-[#E1E4D8] text-xs">
              <button
                type="button"
                onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F1F2E6] hover:bg-[#EAEFE4] border border-[#E1E4D8] font-medium text-[#17241B] transition-colors cursor-pointer"
                title="Switch subject or view enrolled courses"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#697650]" />
                {profile.currentCourse ? (
                  <>
                    <span className="font-semibold text-[#263F2B]">{profile.courseCode}:</span>
                    <span className="truncate max-w-[140px]">{profile.currentCourse}</span>
                  </>
                ) : (
                  <span className="font-semibold text-[#263F2B]">Select or Create Course</span>
                )}
                <ChevronDown className="w-3 h-3 text-[#5D655B]" />
              </button>

              {courseDropdownOpen && (
                <div className="absolute left-3 top-full mt-2 w-72 bg-white border border-[#E1E4D8] rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 border-b border-[#E1E4D8] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650]">
                      My Enrolled Subjects
                    </span>
                    <span className="text-[10px] text-[#777E70]">
                      {profile.enrolledSubjects?.length || 0} Courses
                    </span>
                  </div>

                  <div className="py-1 max-h-56 overflow-y-auto">
                    {(profile.enrolledSubjects || []).length === 0 ? (
                      <div className="px-3 py-3 text-center text-xs text-[#5D655B]">
                        No courses enrolled yet
                      </div>
                    ) : (
                      (profile.enrolledSubjects || []).map((subj) => {
                        const isActive = subj.code === profile.courseCode;
                        return (
                          <button
                            key={subj.id}
                            type="button"
                            onClick={() => {
                              onSwitchSubject?.(subj);
                              setCourseDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                              isActive
                                ? 'bg-[#F1F2E6] text-[#263F2B] font-semibold'
                                : 'hover:bg-[#F8F7EF] text-[#17241B]'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="font-mono text-[11px] font-bold block">{subj.code}</span>
                              <span className="text-[11px] truncate block text-[#5D655B]">{subj.name}</span>
                            </div>
                            {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-[#E1E4D8] pt-1.5 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCourseDropdownOpen(false);
                        onNewCourse();
                      }}
                      className="w-full text-center py-2 px-3 rounded-lg bg-[#263F2B] hover:bg-[#1e3222] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Subject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts, lectures, slides, citations..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F1F2E6]/60 focus:outline-none focus:border-[#263F2B]"
              />
            </div>
          </div>

          {/* Right: Study Streak Badge, Focus Mode, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Encouraging Study Streak Badge */}
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/90 text-orange-800 text-xs font-bold hover:bg-orange-100 transition-all shadow-2xs cursor-pointer group"
              title="Consecutive Days Goal Reached - Click to view Streak & Dashboard"
            >
              <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse group-hover:scale-110 transition-transform" />
              <span>{profile.studyStreakDays || 7}d Streak</span>
              <span className="hidden md:inline text-[10px] bg-orange-200/70 text-orange-900 px-1 rounded font-mono">
                Goal Met
              </span>
            </button>

            {/* Focus Mode Toggle */}
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors hidden sm:flex items-center gap-1.5 ${
                focusMode
                  ? 'bg-[#263F2B] text-white border-[#263F2B]'
                  : 'bg-white border-[#E1E4D8] text-[#5D655B] hover:text-[#17241B]'
              }`}
              title="Toggle calm distraction-free focus mode"
            >
              {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#E1E4D8]/60 transition-colors text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#263F2B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-[#17241B] max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5D655B]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E1E4D8] rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-[#E1E4D8]">
                    <p className="font-semibold text-[#17241B] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#777E70] truncate">{user.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigateTab('settings');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8F7EF] text-[#17241B] flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-[#697650]" />
                    <span>Account & Privacy</span>
                  </button>

                  <div className="border-t border-[#E1E4D8] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-[#D71935] flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex items-start">
        {/* Collapsible Left Sidebar (Hidden in Focus Mode) */}
        {!focusMode && (
          <aside
            className={`hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-[#E1E4D8] bg-[#F8F7EF] p-4 transition-all duration-200 ${
              sidebarCollapsed ? 'w-16' : 'w-60'
            }`}
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentTab === item.id ||
                  (item.id === 'dashboard' && currentTab === 'overview') ||
                  (item.id === 'overview' && currentTab === 'dashboard');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
                        : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#17241B]/50 backdrop-blur-xs flex">
            <div className="w-64 bg-[#F8F7EF] h-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
                <span className="font-serif-display font-bold text-[#263F2B]">Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#5D655B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentTab === item.id ||
                    (item.id === 'dashboard' && currentTab === 'overview') ||
                    (item.id === 'overview' && currentTab === 'dashboard');

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-white text-[#263F2B] font-semibold'
                          : 'text-[#5D655B] hover:text-[#17241B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
