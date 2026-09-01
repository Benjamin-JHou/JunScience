import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  plan: string;
  avatar: string;
  institution?: string;
  specialty?: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  resetUser: () => void;
}

const LOCAL_STORAGE_USER_KEY = 'junscience_user_profile_v1';

const DEFAULT_USER: UserProfile = {
  name: 'Researcher',
  plan: 'Community Edition',
  avatar: 'RE',
  institution: 'Open Science Lab',
  specialty: 'Computational Biology',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        return { ...DEFAULT_USER, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_USER;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      if (updates.name && (!updates.avatar || updates.avatar.trim() === '')) {
        const initials = updates.name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0]?.toUpperCase())
          .join('')
          .slice(0, 2);
        updated.avatar = initials || 'RE';
      }
      return updated;
    });
  };

  const resetUser = () => {
    setUser(DEFAULT_USER);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
