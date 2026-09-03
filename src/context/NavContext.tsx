import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortalSection } from '../types/navigation';

interface NavContextType {
  activeSection: PortalSection;
  setActiveSection: (section: PortalSection) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

const validSections: PortalSection[] = [
  'home',
  'docs',
  'installation',
  'quickstart',
  'userguide',
  'apireference',
  'examples',
  'cli',
  'architecture',
  'skills',
  'contributing',
  'changelog',
];

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialSection = (): PortalSection => {
    const rawHash = window.location.hash.replace('#', '').toLowerCase();
    if (rawHash === 'usecases') {
      return 'examples';
    }
    const hash = rawHash as PortalSection;
    if (validSections.includes(hash)) {
      return hash;
    }
    return 'home';
  };

  const [activeSection, setActiveSectionState] = useState<PortalSection>(getInitialSection);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setActiveSection = (section: PortalSection) => {
    setActiveSectionState(section);
    if (section === 'home') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.history.replaceState(null, '', `#${section}`);
    }
    // Close mobile sidebar on navigate
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync hash changes (e.g. back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      if (rawHash === 'usecases') {
        setActiveSectionState('examples');
        return;
      }
      const hash = rawHash as PortalSection;
      if (validSections.includes(hash)) {
        setActiveSectionState(hash);
      } else if (!window.location.hash) {
        setActiveSectionState('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut: ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <NavContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </NavContext.Provider>
  );
};

export const useNav = (): NavContextType => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
};
