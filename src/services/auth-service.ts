/**
 * Authentication Service for CourseCompass
 * Implements the required interface:
 * getSession(), signIn(), signUp(), signOut(), requestPasswordReset(), resetPassword(), verifyEmail(), getCurrentUser()
 */

import { User, Session } from '../types';

const SESSION_STORAGE_KEY = 'coursecompass_auth_session';

type AuthListener = (session: Session | null) => void;
const listeners: Set<AuthListener> = new Set();

export const AuthService = {
  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify(session: Session | null) {
    listeners.forEach((fn) => fn(session));
  },

  async getSession(): Promise<Session | null> {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as Session;

      // Check session expiry
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.signOut();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session ? session.user : null;
  },

  async signIn(email: string, _password: string, isDemoStudent = false): Promise<Session> {
    // Artificial latency for realism
    await new Promise((r) => setTimeout(r, 400));

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid academic or personal email address.');
    }

    const isDemo = isDemoStudent || email.includes('ananya');

    const user: User = isDemo
      ? {
          id: 'usr-ananya-sharma',
          name: 'Ananya Sharma',
          email: 'ananya.sharma@collegemail.edu',
          academicLevel: 'Second-year Undergraduate',
          institution: 'School of Engineering & Applied Sciences',
          isNewUser: false,
          createdAt: '2026-09-01T08:00:00Z'
        }
      : {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' '),
          email,
          academicLevel: 'Undergraduate',
          institution: 'University College',
          isNewUser: true,
          createdAt: new Date().toISOString()
        };

    const session: Session = {
      user,
      token: `cc_sec_tok_${Math.random().toString(36).substring(2)}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      isDemoSession: isDemo
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.notify(session);
    return session;
  },

  async signUp(name: string, email: string, _password: string): Promise<Session> {
    await new Promise((r) => setTimeout(r, 500));

    if (!name.trim()) {
      throw new Error('Please enter your full name.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid university or personal email address.');
    }

    const user: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      academicLevel: 'Undergraduate',
      isNewUser: true,
      createdAt: new Date().toISOString()
    };

    const session: Session = {
      user,
      token: `cc_sec_tok_${Math.random().toString(36).substring(2)}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      isDemoSession: false
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.notify(session);
    return session;
  },

  async signOut(): Promise<void> {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify(null);
  },

  async requestPasswordReset(email: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    // Never reveal whether email exists for privacy/security
    return true;
  },

  async resetPassword(_token: string, _newPassword: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  },

  async verifyEmail(_token: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 300));
    return true;
  }
};
