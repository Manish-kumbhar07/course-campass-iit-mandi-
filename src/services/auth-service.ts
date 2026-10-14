/**
 * Authentication Service for CourseCompass
 * Integrates with FastAPI /api/v1/auth endpoints:
 * - /login (credentials)
 * - /demo-login (pre-seeded Ananya Sharma session)
 * - /signup (new account registration)
 * - /logout (token revocation)
 * With graceful offline demo session fallback when server is unreachable.
 */

import { User, Session } from '../types';
import { Api, IS_DEMO_MODE } from './api-client';

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
        await this.signOut();
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

  async signIn(email: string, password = '', isDemoStudent = false): Promise<Session> {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid academic or personal email address.');
    }

    const isDemo = isDemoStudent || email.includes('ananya');

    // If demo requested and not explicitly forcing live mode without demo, call backend demo-login
    try {
      let session: Session;
      if (isDemo) {
        session = await Api.auth.demoLogin();
      } else {
        session = await Api.auth.login(email, password);
      }

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      this.notify(session);
      return session;
    } catch (err) {
      // In demo mode or if server is not reachable, fall back to offline simulation
      if (IS_DEMO_MODE || isDemo) {
        const fallbackUser: User = isDemo
          ? {
              id: 'usr-ananya-sharma',
              name: 'Ananya Sharma',
              email: 'ananya.sharma@collegemail.edu',
              academicLevel: 'Second-year Undergraduate',
              institution: 'School of Engineering & Applied Sciences',
              isNewUser: false,
              createdAt: '2026-09-01T08:00:00Z',
            }
          : {
              id: `usr-${Date.now()}`,
              name: email.split('@')[0].replace(/[._]/g, ' '),
              email,
              academicLevel: 'Undergraduate',
              institution: 'University College',
              isNewUser: true,
              createdAt: new Date().toISOString(),
            };

        const fallbackSession: Session = {
          user: fallbackUser,
          token: `cc_sec_tok_${Math.random().toString(36).substring(2)}`,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          isDemoSession: isDemo,
        };

        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackSession));
        this.notify(fallbackSession);
        return fallbackSession;
      }

      throw err;
    }
  },

  async signUp(name: string, email: string, password = ''): Promise<Session> {
    if (!name.trim()) {
      throw new Error('Please enter your full name.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid university or personal email address.');
    }

    try {
      const session = await Api.auth.signup(name, email, password);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      this.notify(session);
      return session;
    } catch (err) {
      if (IS_DEMO_MODE) {
        const fallbackUser: User = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          academicLevel: 'Undergraduate',
          isNewUser: true,
          createdAt: new Date().toISOString(),
        };

        const fallbackSession: Session = {
          user: fallbackUser,
          token: `cc_sec_tok_${Math.random().toString(36).substring(2)}`,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          isDemoSession: false,
        };

        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackSession));
        this.notify(fallbackSession);
        return fallbackSession;
      }

      throw err;
    }
  },

  async signOut(): Promise<void> {
    await Api.auth.logout();
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify(null);
  },

  async requestPasswordReset(_email: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  },

  async resetPassword(_token: string, _newPassword: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  },

  async verifyEmail(_token: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 300));
    return true;
  },
};
