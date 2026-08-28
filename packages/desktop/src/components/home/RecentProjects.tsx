import React from 'react';
import { mockProjects } from '../../data/mockProjects';
import { useAgent } from '../../context/AgentContext';
import { useNav } from '../../context/NavContext';

export const RecentProjects: React.FC = () => {
  const { openProject } = useAgent();
  const { setActiveSection } = useNav();

  const recentFour = mockProjects.slice(0, 4);

  return (
    <section className="mt-8 select-none">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold tracking-tight text-text-primary">
          Recent Projects
        </h3>
        <button
          onClick={() => setActiveSection('my-projects')}
          className="text-[12px] font-medium text-accent hover:underline transition-colors"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recentFour.map((project) => (
          <div
            key={project.id}
            onClick={() => openProject(project.id, project.title)}
            className="group flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border hover:border-accent/40 hover:bg-bg-hover cursor-pointer transition-all shadow-sm"
          >
            <div>
              <h4 className="text-[13px] font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                {project.title}
              </h4>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-text-muted">
              <span>{project.timeAgo}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent text-[11px]">
                Open →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
