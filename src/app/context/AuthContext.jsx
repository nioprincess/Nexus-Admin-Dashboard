// context/AuthContext.jsx
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabId] = useState(() => Math.random().toString(36).substring(2, 15)); // Unique ID for this tab

  useEffect(() => {
    // Set persistence to session instead of local
    // This allows different tabs to have different sessions
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Get additional user data from Firestore
              const userDoc = await getDoc(doc(db, 'normal_users', firebaseUser.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Store tab-specific user data in sessionStorage
                const sessionUserData = {
                  ...userData,
                  tabId: tabId,
                  lastActive: Date.now()
                };
                
                sessionStorage.setItem(`firebaseUser_${tabId}`, JSON.stringify(sessionUserData));
                sessionStorage.setItem('currentTabId', tabId);
                
                setUser(firebaseUser);
                setUserData(userData);
              } else {
                // User document doesn't exist, sign them out
                await signOut(auth);
                setUser(null);
                setUserData(null);
                sessionStorage.removeItem(`firebaseUser_${tabId}`);
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUser(null);
              setUserData(null);
              sessionStorage.removeItem(`firebaseUser_${tabId}`);
            }
          } else {
            setUser(null);
            setUserData(null);
            sessionStorage.removeItem(`firebaseUser_${tabId}`);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
        setLoading(false);
      });
  }, [tabId]);

  // Listen for storage events (changes in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authLogoutEvent' || e.key === 'authLoginEvent') {
        // Another tab has changed auth state, reload to sync
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signOutAndNotify = async () => {
    try {
      // Notify other tabs about logout
      localStorage.setItem('authLogoutEvent', Date.now().toString());
      localStorage.removeItem('authLogoutEvent'); // Clear immediately
      
      await signOut(auth);
      sessionStorage.removeItem(`firebaseUser_${tabId}`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    userData,
    loading,
    signOut: signOutAndNotify
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};