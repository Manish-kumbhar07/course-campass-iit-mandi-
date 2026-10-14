import React, { useState } from 'react';
import { User, StudentProfile } from '../../types';
import {
  User as UserIcon,
  Shield,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Globe,
  Bell,
  HardDrive
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onDeleteCourse: () => void;
  onDeleteAccount: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  profile,
  onUpdateProfile,
  onDeleteCourse,
  onDeleteAccount
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'security'>('profile');

  // Form states
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyStudyMinutes);
  const [explanationLevel, setExplanationLevel] = useState('Rigorous & Exam-Focused');
  const [language, setLanguage] = useState('English');
  const [savedNotice, setSavedNotice] = useState(false);

  // Destructive confirmation modals
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      dailyStudyMinutes: dailyMinutes
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportData = () => {
    const exportBlob = new Blob(
      [
        JSON.stringify(
          {
            user,
            profile,
            exportedAt: new Date().toISOString(),
            note: 'CourseCompass Private Academic Data Export'
          },
          null,
          2
        )
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coursecompass-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[#E1E4D8]">
        <h1 className="font-serif-display text-2xl font-bold text-[#263F2B]">
          Workspace Settings & Academic Privacy
        </h1>
        <p className="text-xs text-[#5D655B]">
          Manage your personal profile, explanation preferences, and private data retention.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F1F2E6] border border-[#E1E4D8] rounded-xl text-xs font-medium w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
              : 'text-[#5D655B] hover:text-[#17241B]'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'preferences'
              ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
              : 'text-[#5D655B] hover:text-[#17241B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
              : 'text-[#5D655B] hover:text-[#17241B]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy & Data</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-white text-[#263F2B] font-semibold shadow-2xs'
              : 'text-[#5D655B] hover:text-[#17241B]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Settings successfully updated.</span>
        </div>
      )}

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#17241B] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#17241B] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F1F2E6] text-[#777E70] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#17241B] mb-1">Academic Level</label>
              <input
                type="text"
                value={profile.academicLevel}
                disabled
                className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F1F2E6] text-[#777E70]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#17241B] mb-1">University / Department</label>
              <input
                type="text"
                value={profile.university}
                disabled
                className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F1F2E6] text-[#777E70]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-semibold shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-5 text-xs">
          <div>
            <label className="block font-medium text-[#17241B] mb-2">
              Daily Study Budget: {dailyMinutes} Minutes
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDailyMinutes(m)}
                  className={`py-2 rounded-lg border text-center transition-colors ${
                    dailyMinutes === m
                      ? 'border-[#263F2B] bg-[#263F2B] text-white font-semibold'
                      : 'border-[#E1E4D8] bg-[#F8F7EF] text-[#5D655B]'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#17241B] mb-1">
              AI Tutor Pedagogy & Explanation Depth
            </label>
            <select
              value={explanationLevel}
              onChange={(e) => setExplanationLevel(e.target.value)}
              className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF]"
            >
              <option value="Introductory">Introductory (Intuitive analogies & simplified call stacks)</option>
              <option value="Rigorous & Exam-Focused">Rigorous & Exam-Focused (Formal proofs, invariants, stack frames)</option>
              <option value="Quick Recall">Quick Recall (Bullet-point definitions & formula verification)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#17241B] mb-1">
              Response Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF]"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY & DATA MANAGEMENT */}
      {activeTab === 'privacy' && (
        <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-6 text-xs">
          <div className="p-4 rounded-xl bg-[#F1F2E6] border border-[#DCE5CE] space-y-1.5">
            <span className="font-semibold text-[#263F2B] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#697650]" /> FERPA Compliance & Private Data Boundary
            </span>
            <p className="text-[#5D655B] leading-relaxed">
              Your uploaded course materials, video lectures, and quiz results are encrypted and restricted to your authenticated workspace. No student materials are fed to public AI foundation training sets.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E1E4D8] bg-[#F8F7EF]">
              <div>
                <p className="font-semibold text-[#17241B]">Export Your Learning Archive</p>
                <p className="text-[11px] text-[#5D655B]">Download all quiz records, concept mastery states, and notes as JSON.</p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-2 bg-white hover:bg-[#DCE5CE] border border-[#E1E4D8] text-[#263F2B] rounded-lg font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#F8E2E3] bg-[#FFF8F8]">
              <div>
                <p className="font-semibold text-[#D71935]">Delete Current Course Workspace</p>
                <p className="text-[11px] text-[#5D655B]">Permanently remove {profile.courseCode} documents, transcripts, and quiz history.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteCourseModal(true)}
                className="px-3.5 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Course</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#F8E2E3] bg-[#FFF8F8]">
              <div>
                <p className="font-semibold text-[#D71935]">Delete Account & Purge Data</p>
                <p className="text-[11px] text-[#5D655B]">Irrevocably erase your student profile, enrolled courses, and login session.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-3.5 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
            <div>
              <p className="font-semibold text-[#17241B]">Active Session Authorization</p>
              <p className="text-[11px] text-[#5D655B]">Token-authenticated session expiring in 8 hours</p>
            </div>
            <span className="text-emerald-800 font-mono-code bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] text-[11px] text-[#5D655B] space-y-1">
            <span className="font-semibold text-[#17241B]">Security Reminder:</span>
            <p>
              Always sign out when using shared computer lab terminals. CourseCompass clears all cached tokens from the browser upon sign out.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modals for Destructive Actions */}
      {showDeleteCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#D71935] font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Course Deletion</span>
            </div>
            <p className="text-[#5D655B] leading-relaxed">
              Are you sure you want to delete <strong>{profile.currentCourse}</strong>? All indexed lecture transcripts, slide extracts, and diagnostic quiz mastery scores will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E1E4D8]">
              <button
                type="button"
                onClick={() => setShowDeleteCourseModal(false)}
                className="px-3.5 py-2 bg-[#F8F7EF] hover:bg-[#E1E4D8] text-[#17241B] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteCourseModal(false);
                  onDeleteCourse();
                }}
                className="px-4 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#D71935] font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Account Deletion</span>
            </div>
            <p className="text-[#5D655B] leading-relaxed">
              This action is irreversible. All enrolled courses, personal notes, study plans, and profile records for <strong>{user.email}</strong> will be erased immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E1E4D8]">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-3.5 py-2 bg-[#F8F7EF] hover:bg-[#E1E4D8] text-[#17241B] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  onDeleteAccount();
                }}
                className="px-4 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-semibold"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
