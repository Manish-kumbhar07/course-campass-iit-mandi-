import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '../types';
import { AuthService } from '../services/auth-service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password?: string, isDemo?: boolean) => Promise<Session>;
  signUp: (name: string, email: string, password?: string) => Promise<Session>;
  signOut: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    // Check existing session
    AuthService.getSession().then((stored) => {
      setSession(stored);
      setIsLoading(false);
    });

    const unsubscribe = AuthService.subscribe((updatedSession) => {
      if (!updatedSession && session) {
        setSessionExpired(true);
      }
      setSession(updatedSession);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password = '', isDemo = false) => {
    setIsLoading(true);
    try {
      const res = await AuthService.signIn(email, password, isDemo);
      setSession(res);
      setSessionExpired(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password = '') => {
    setIsLoading(true);
    try {
      const res = await AuthService.signUp(name, email, password);
      setSession(res);
      setSessionExpired(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isLoading,
        sessionExpired,
        signIn,
        signUp,
        signOut,
        clearSessionExpired: () => setSessionExpired(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
