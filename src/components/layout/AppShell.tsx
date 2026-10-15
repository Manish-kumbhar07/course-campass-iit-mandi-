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
  CheckCircle2,
  BarChart3,
  Sparkles,
  MessageSquarePlus,
  Info
} from 'lucide-react';

export type AuthenticatedTab =
  | 'overview'
  | 'materials'
  | 'tutor'
  | 'map'
  | 'practice'
  | 'revision'
  | 'mastery'
  | 'weekly-report'
  | 'settings'
  | 'help'
  | 'dashboard'
  | 'courses'
  | 'sprint'
  | 'study-plan';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Grouped Navigation Items matching the exact IA specification
  const learnNavItems = [
    { id: 'overview' as AuthenticatedTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'materials' as AuthenticatedTab, label: 'Study material', icon: UploadCloud },
    { id: 'tutor' as AuthenticatedTab, label: 'AI tutor', icon: Bot },
    { id: 'map' as AuthenticatedTab, label: 'Course map', icon: Network },
    { id: 'practice' as AuthenticatedTab, label: 'Practice', icon: HelpCircle },
    { id: 'revision' as AuthenticatedTab, label: 'Revision', icon: Layers }
  ];

  const progressNavItems = [
    { id: 'mastery' as AuthenticatedTab, label: 'Mastery', icon: TrendingUp },
    { id: 'weekly-report' as AuthenticatedTab, label: 'Weekly report', icon: BarChart3 }
  ];

  const bottomNavItems = [
    { id: 'settings' as AuthenticatedTab, label: 'Settings', icon: Settings }
  ];

  const handleTabClick = (tabId: AuthenticatedTab) => {
    onNavigateTab(tabId);
    setMobileMenuOpen(false);
  };

  const isTabActive = (tabId: AuthenticatedTab) => {
    if (tabId === 'overview') {
      return currentTab === 'overview' || currentTab === 'dashboard';
    }
    return currentTab === tabId;
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
              onClick={() => onNavigateTab('overview')}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <Logo size="sm" showWordmark={false} />
              <span className="font-serif-display font-bold text-lg text-[#263F2B] hidden sm:inline-block">
                CourseCompass
              </span>
            </button>

            {/* Topbar Course Selector Dropdown */}
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
                  <span className="font-semibold text-[#263F2B]">Select Course</span>
                )}
                <ChevronDown className="w-3 h-3 text-[#5D655B]" />
              </button>

              {courseDropdownOpen && (
                <div className="absolute left-3 top-full mt-2 w-72 bg-white border border-[#E1E4D8] rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 border-b border-[#E1E4D8] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650]">
                      Current & Enrolled Courses
                    </span>
                    <span className="text-[10px] text-[#777E70]">
                      {profile.enrolledSubjects?.length || 0} Courses
                    </span>
                  </div>

                  <div className="py-1 max-h-56 overflow-y-auto">
                    {(profile.enrolledSubjects || []).length === 0 ? (
                      <div className="px-3 py-3 text-center text-xs text-[#5D655B]">
                        No courses created yet
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
                            className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
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
                      <span>+ New Course</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search / Quick Jump */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#777E70] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onNavigateTab('materials');
                  }
                }}
                placeholder="Search concepts, lectures, slides, citations... (Enter to jump)"
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F1F2E6]/60 focus:outline-none focus:border-[#263F2B]"
              />
            </div>
          </div>

          {/* Right: Ask Tutor + Add Material + Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Ask Tutor Button */}
            <button
              type="button"
              onClick={() => onNavigateTab('tutor')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F2E6] hover:bg-[#EAEFE4] border border-[#E1E4D8] text-xs font-semibold text-[#263F2B] transition-colors cursor-pointer"
              title="Ask AI Tutor a question"
            >
              <Bot className="w-3.5 h-3.5 text-[#263F2B]" />
              <span>Ask Tutor</span>
            </button>

            {/* + Add Study Material Button */}
            <button
              type="button"
              onClick={() => onNavigateTab('materials')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#263F2B] hover:bg-[#1e3222] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Add PDF, Video, Slides, Audio, or YouTube lesson"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Material</span>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg border border-[#E1E4D8] bg-white hover:bg-[#F8F7EF] text-[#5D655B] hover:text-[#17241B] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D71935]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E1E4D8] rounded-xl shadow-xl p-3 z-50 text-xs animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E1E4D8]">
                    <span className="font-semibold text-[#17241B]">Notifications</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">1 new</span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div className="p-2 rounded-lg bg-[#F8F7EF] space-y-1">
                      <p className="font-medium text-[#17241B]">Study Sprint Ready</p>
                      <p className="text-[11px] text-[#5D655B]">
                        Your personalized revision cards and adaptive practice questions are ready for {profile.currentCourse || 'your course'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
              <span className="hidden xl:inline">{focusMode ? 'Exit Focus' : 'Focus'}</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#E1E4D8]/60 transition-colors text-xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#263F2B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user.name.charAt(0).toUpperCase()}
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
                    className="w-full text-left px-4 py-2 hover:bg-[#F8F7EF] text-[#17241B] flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#697650]" />
                    <span>Settings & Privacy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowHelpModal(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8F7EF] text-[#17241B] flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[#697650]" />
                    <span>Help & Knowledge Base</span>
                  </button>

                  <div className="border-t border-[#E1E4D8] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-[#D71935] flex items-center gap-2 cursor-pointer"
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
              sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
          >
            <div className="space-y-6">
              {/* SECTION 1: CURRENT COURSE */}
              {!sidebarCollapsed && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650] px-1">
                    Current Course
                  </span>
                  <div className="p-3 bg-white border border-[#E1E4D8] rounded-xl shadow-2xs space-y-2">
                    <div className="truncate">
                      <span className="font-mono text-[10px] font-bold text-[#697650] block">
                        {profile.courseCode || 'GENERAL'}
                      </span>
                      <span className="font-bold text-xs text-[#263F2B] truncate block">
                        {profile.currentCourse || 'No active course'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onNewCourse}
                      className="w-full py-1.5 px-2 bg-[#F1F2E6] hover:bg-[#EAEFE4] border border-[#E1E4D8] text-[#263F2B] text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ New Course</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 2: LEARN */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650] px-1 block mb-1">
                    Learn
                  </span>
                )}
                {learnNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-[#263F2B] font-bold shadow-2xs'
                          : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#263F2B]' : 'text-[#697650]'}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>

              {/* SECTION 3: PROGRESS */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650] px-1 block mb-1">
                    Progress
                  </span>
                )}
                {progressNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-[#263F2B] font-bold shadow-2xs'
                          : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#263F2B]' : 'text-[#697650]'}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>

              {/* SECTION 4: BOTTOM */}
              <div className="space-y-1 pt-4 border-t border-[#E1E4D8]">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-[#263F2B] font-bold shadow-2xs'
                          : 'text-[#5D655B] hover:text-[#17241B] hover:bg-white/50'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#263F2B]' : 'text-[#697650]'}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#5D655B] hover:text-[#17241B] hover:bg-white/50 transition-colors cursor-pointer"
                  title="Help & Knowledge Base"
                >
                  <HelpCircle className="w-4 h-4 shrink-0 text-[#697650]" />
                  {!sidebarCollapsed && <span>Help</span>}
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#D71935] hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Sign out</span>}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#17241B]/50 backdrop-blur-xs flex">
            <div className="w-72 bg-[#F8F7EF] h-full p-5 space-y-5 shadow-xl overflow-y-auto">
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

              {/* Current Course */}
              <div className="p-3 bg-white border border-[#E1E4D8] rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650] block">
                  Current Course
                </span>
                <span className="font-bold text-xs text-[#263F2B] block">
                  {profile.courseCode}: {profile.currentCourse || 'No active course'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNewCourse();
                  }}
                  className="w-full py-1.5 px-2 bg-[#263F2B] text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ New Course</span>
                </button>
              </div>

              {/* Learn */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650] px-1 block mb-1">
                  Learn
                </span>
                {learnNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
                        active
                          ? 'bg-white text-[#263F2B] font-bold shadow-2xs'
                          : 'text-[#5D655B] hover:text-[#17241B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#697650] px-1 block mb-1">
                  Progress
                </span>
                {progressNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
                        active
                          ? 'bg-white text-[#263F2B] font-bold shadow-2xs'
                          : 'text-[#5D655B] hover:text-[#17241B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom */}
              <div className="space-y-1 pt-4 border-t border-[#E1E4D8]">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
                        active
                          ? 'bg-white text-[#263F2B] font-bold shadow-2xs'
                          : 'text-[#5D655B] hover:text-[#17241B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#D71935] hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#E1E4D8]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#263F2B]" />
                <h3 className="text-base font-bold font-serif-display text-[#263F2B]">
                  CourseCompass Guide & Help
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#777E70] hover:text-[#17241B] p-1.5 rounded-lg cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5D655B] leading-relaxed">
              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-1">
                <span className="font-bold text-[#17241B] block">1. Adding Study Materials</span>
                <p>
                  Upload PDFs, lecture videos, PowerPoint decks, audio, or paste a YouTube URL in <strong>Study Material</strong>. Our pipeline indexes key concepts and structures timestamps.
                </p>
              </div>

              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-1">
                <span className="font-bold text-[#17241B] block">2. Asking the AI Tutor</span>
                <p>
                  Every answer includes exact page citations, video timestamps, and evidence status (Supported, Partially supported, or Not found).
                </p>
              </div>

              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-1">
                <span className="font-bold text-[#17241B] block">3. Prerequisite Knowledge Map</span>
                <p>
                  Explore the 3D interactive dependency graph under <strong>Course map</strong> to trace which foundational concepts unlock advanced topics.
                </p>
              </div>

              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-1">
                <span className="font-bold text-[#17241B] block">4. Practice & Mastery Tracking</span>
                <p>
                  Take diagnostic quizzes in <strong>Practice</strong> to update your concept mastery scores deterministically.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
