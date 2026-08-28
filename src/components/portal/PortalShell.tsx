import React from 'react';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { PortalHome } from './PortalHome';
import { PortalDocView } from './PortalDocView';
import { SearchModal } from './SearchModal';
import { useNav } from '../../context/NavContext';

export const PortalShell: React.FC = () => {
  const { activeSection } = useNav();

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary antialiased">
      {/* 1. Left Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <PortalSidebar />

      {/* 2. Main Content View Area (Pushed right by sidebar width on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[240px] xl:pl-[250px] transition-all">
        {/* Sticky Top Header */}
        <PortalHeader />

        {/* Scrollable Main Document Body */}
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'home' ? (
            <PortalHome />
          ) : (
            <PortalDocView section={activeSection} />
          )}
        </main>
      </div>

      {/* 3. Global Search Modal (⌘K) */}
      <SearchModal />
    </div>
  );
};
