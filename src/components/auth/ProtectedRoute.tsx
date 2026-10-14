import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppRoute } from '../../types';
import { LoadingScreen } from '../common/LoadingScreen';

interface ProtectedRouteProps {
  currentRoute: AppRoute;
  onRedirectToSignIn: (requestedPath: AppRoute) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentRoute,
  onRedirectToSignIn,
  children
}) => {
  const { user, session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !session)) {
      onRedirectToSignIn(currentRoute);
    }
  }, [user, session, isLoading, currentRoute, onRedirectToSignIn]);

  if (isLoading) {
    return <LoadingScreen message="Verifying student authorization..." />;
  }

  if (!user || !session) {
    return <LoadingScreen message="Redirecting to secure sign-in..." />;
  }

  return <>{children}</>;
};
