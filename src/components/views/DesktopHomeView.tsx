import React from 'react';
import { HomeHero } from '../home/HomeHero';
import { AgentInput } from '../home/AgentInput';
import { QuickActions } from '../home/QuickActions';
import { RecentProjects } from '../home/RecentProjects';
import { ResearchStats } from '../home/ResearchStats';

export const DesktopHomeView: React.FC = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto px-6 sm:px-10 py-6">
      <div className="max-w-[940px] mx-auto flex flex-col justify-center min-h-[calc(100vh-120px)]">
        {/* Main Hero with Title and Scientific Motif */}
        <HomeHero />

        {/* The Central Agent Input */}
        <div className="mt-2">
          <AgentInput autoFocus />
        </div>

        {/* Quick Action Shortcuts */}
        <QuickActions />

        {/* Recent Projects Row */}
        <RecentProjects />

        {/* Secondary Research Metrics Row */}
        <ResearchStats />
      </div>
    </div>
  );
};
