// components/RouteGuard.jsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { useTabSession } from '../app/hooks/useTabSession';

const RouteGuard = ({ children, requiredRole }) => {
  const { user, userData, loading } = useAuth();
  const { isActiveTab } = useTabSession();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !userData) {
        // No user is signed in, redirect to login
        setShouldRedirect(true);
      } else if (userData.role !== requiredRole) {
        // User doesn't have the required role
        setShouldRedirect(true);
      } else if (!isActiveTab) {
        // This tab is not active, don't allow access
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    }
  }, [user, userData, loading, requiredRole, isActiveTab]);

  useEffect(() => {
    if (shouldRedirect && !loading) {
      if (!user || !userData) {
        router.push('/auth/login');
      } else if (userData.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        switch (userData.role) {
          case 'super_admin':
            router.push('/super_admin');
            break;
          case 'admin':
            router.push('/dashboard');
            break;
          default:
            router.push('/auth/login');
        }
      }
    }
  }, [shouldRedirect, loading, user, userData, requiredRole, router, isActiveTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render children if user has the correct role and this tab is active
  return user && userData && userData.role === requiredRole && isActiveTab ? children : null;
};

export default RouteGuard;