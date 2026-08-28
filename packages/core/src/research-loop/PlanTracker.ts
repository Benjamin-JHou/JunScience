import { EventBus, globalEventBus } from '../core/EventBus.js';

export type TaskCategory = 'literature' | 'databases' | 'computation' | 'clinical' | 'synthesis';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface PlanTask {
  id: string; // e.g. 'task-1'
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  evidenceIds: string[];
  startTime?: string;
  endTime?: string;
  resultNote?: string;
}

export interface ResearchPlan {
  id: string;
  sessionId: string;
  inquiry: string;
  tasks: PlanTask[];
  createdAt: string;
  updatedAt: string;
}

export class PlanTracker {
  private plans: Map<string, ResearchPlan> = new Map(); // Keyed by sessionId
  private eventBus: EventBus;

  constructor(eventBus: EventBus = globalEventBus) {
    this.eventBus = eventBus;
  }

  public createPlan(sessionId: string, inquiry: string, customTasks?: PlanTask[]): ResearchPlan {
    const planId = `plan-${Date.now()}`;
    const defaultTasks: PlanTask[] = customTasks || this.generateDefaultTasks(inquiry);

    const plan: ResearchPlan = {
      id: planId,
      sessionId,
      inquiry,
      tasks: defaultTasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.plans.set(sessionId, plan);

    this.eventBus.emit({
      type: 'plan.created',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: {
        planId,
        inquiry,
        tasks: plan.tasks,
      },
    });

    return plan;
  }

  public getPlan(sessionId: string): ResearchPlan | undefined {
    return this.plans.get(sessionId);
  }

  public startTask(sessionId: string, taskId: string): void {
    const plan = this.plans.get(sessionId);
    if (!plan) return;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (task && task.status !== 'completed') {
      task.status = 'in_progress';
      task.startTime = new Date().toISOString();
      plan.updatedAt = new Date().toISOString();

      this.eventBus.emit({
        type: 'plan.task.updated',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          planId: plan.id,
          taskId,
          status: 'in_progress',
          task,
        },
      });
    }
  }

  public completeTask(
    sessionId: string,
    taskId: string,
    evidenceIds: string[] = [],
    resultNote?: string
  ): void {
    const plan = this.plans.get(sessionId);
    if (!plan) return;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.endTime = new Date().toISOString();
      task.evidenceIds = [...new Set([...task.evidenceIds, ...evidenceIds])];
      task.resultNote = resultNote;
      plan.updatedAt = new Date().toISOString();

      this.eventBus.emit({
        type: 'plan.task.completed',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          planId: plan.id,
          taskId,
          evidenceIds: task.evidenceIds,
          resultNote,
        },
      });

      this.eventBus.emit({
        type: 'plan.task.updated',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          planId: plan.id,
          taskId,
          status: 'completed',
          task,
        },
      });
    }
  }

  public failTask(sessionId: string, taskId: string, reason: string): void {
    const plan = this.plans.get(sessionId);
    if (!plan) return;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'failed';
      task.endTime = new Date().toISOString();
      task.resultNote = `Failed: ${reason}`;
      plan.updatedAt = new Date().toISOString();

      this.eventBus.emit({
        type: 'plan.task.updated',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          planId: plan.id,
          taskId,
          status: 'failed',
          task,
        },
      });
    }
  }

  public formatPlanChecklist(sessionId: string): string {
    const plan = this.plans.get(sessionId);
    if (!plan || plan.tasks.length === 0) {
      return '';
    }

    let out = `### 📋 Explicit Scientific Research Plan & Progress Checklist\n\n`;
    out += `| Task | Status | Action Item | Verified Evidence Anchors | Duration / Outcome |\n`;
    out += `| :--- | :--- | :--- | :--- | :--- |\n`;

    for (const t of plan.tasks) {
      const icon =
        t.status === 'completed'
          ? '✔ Completed'
          : t.status === 'in_progress'
          ? '⏳ In Progress'
          : t.status === 'failed'
          ? '✖ Failed'
          : 'Pending';

      const evStr = t.evidenceIds.length > 0 ? t.evidenceIds.join(', ') : '-';
      const noteStr = t.resultNote ? t.resultNote.slice(0, 60) : '-';

      out += `| **${t.id.toUpperCase()}** | ${icon} | **[${t.category}]** ${t.title} | ${evStr} | ${noteStr} |\n`;
    }

    return out;
  }

  private generateDefaultTasks(inquiry: string): PlanTask[] {
    return [
      {
        id: 'task-1',
        title: 'Retrieve Canonical Target Sequences, 3D Structures & Domain Topology',
        category: 'databases',
        status: 'pending',
        evidenceIds: [],
      },
      {
        id: 'task-2',
        title: 'Explore Bioactivity (IC50/Ki), Selectivity & Literature Associations',
        category: 'databases',
        status: 'pending',
        evidenceIds: [],
      },
      {
        id: 'task-3',
        title: 'Perform Local Sandbox Statistical Analysis, Radiomics or Clinical NLP',
        category: 'computation',
        status: 'pending',
        evidenceIds: [],
      },
      {
        id: 'task-4',
        title: 'Validate Clinical Trial Endpoints, Safety Signals & Critique Gate Check',
        category: 'clinical',
        status: 'pending',
        evidenceIds: [],
      },
      {
        id: 'task-5',
        title: 'Synthesize Evidence-Anchored Scientific Report & Traceability Index',
        category: 'synthesis',
        status: 'pending',
        evidenceIds: [],
      },
    ];
  }
}

export const globalPlanTracker = new PlanTracker();
