// hooks/useTabSession.js
"use client";
import { useEffect, useState } from 'react';

export const useTabSession = () => {
  const [tabId] = useState(() => {
    // Generate or retrieve a unique tab ID
    if (typeof window !== 'undefined') {
      let tabId = sessionStorage.getItem('tabId');
      if (!tabId) {
        tabId = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('tabId', tabId);
      }
      return tabId;
    }
    return '';
  });

  const [isActiveTab, setIsActiveTab] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActiveTab(!document.hidden);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'activeTab' && e.newValue !== tabId) {
        // Another tab has claimed to be active
        setIsActiveTab(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    // Claim this tab as active
    localStorage.setItem('activeTab', tabId);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [tabId]);

  return { tabId, isActiveTab };
};