import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
  hypothesesCount: number;
}

interface ProjectStats {
  totalProjects: number;
  totalAnalyses: number;
  totalEvidence: number;
  totalHypotheses: number;
}

interface ProjectContextType {
  projects: ResearchProject[];
  stats: ProjectStats;
  createProject: (title: string, description?: string, tags?: string[]) => ResearchProject;
  updateProject: (id: string, updates: Partial<ResearchProject>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => ResearchProject | undefined;
}

const LOCAL_STORAGE_PROJECTS_KEY = 'junscience_desktop_projects_v1';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ResearchProject[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects]);

  const createProject = (title: string, description = '', tags: string[] = ['Biomedical']): ResearchProject => {
    const newProj: ResearchProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim() || 'Untitled Scientific Exploration',
      description,
      tags,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidenceCount: 0,
      hypothesesCount: 1,
    };

    setProjects((prev) => [newProj, ...prev]);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<ResearchProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const stats: ProjectStats = {
    totalProjects: projects.length,
    totalAnalyses: projects.reduce((acc, p) => acc + (p.hypothesesCount || 0), 0),
    totalEvidence: projects.reduce((acc, p) => acc + (p.evidenceCount || 0), 0),
    totalHypotheses: projects.reduce((acc, p) => acc + (p.hypothesesCount || 0), 0),
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        stats,
        createProject,
        updateProject,
        deleteProject,
        getProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
