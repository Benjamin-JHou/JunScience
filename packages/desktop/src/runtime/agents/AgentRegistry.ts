import { AgentId } from '../types/runtime';
import { AgentConfig, builtInAgents } from './BaseAgent';
import { globalSkillRegistry } from '../skills/SkillRegistry';
import { globalToolRegistry } from '../tools/ToolRegistry';
import { ToolDefinition } from '../types/tools';

export class AgentRegistry {
  private agents: Map<AgentId, AgentConfig> = new Map();

  constructor() {
    builtInAgents.forEach((agent) => this.agents.set(agent.id, agent));
  }

  public get(id: AgentId): AgentConfig | undefined {
    return this.agents.get(id);
  }

  public list(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  public getScopedTools(agentId: AgentId): ToolDefinition[] {
    const agent = this.get(agentId) || this.get('research')!;
    return globalToolRegistry.list().filter((tool) =>
      agent.allowedToolCategories.includes(tool.category)
    );
  }

  public assembleSystemPrompt(agentId: AgentId, userQuery: string): string {
    const agent = this.get(agentId) || this.get('research')!;
    
    // Discover relevant skills for query
    const relevantSkills = globalSkillRegistry.discover(userQuery, 3);

    let prompt = `${agent.systemPrompt}\n\n`;

    if (relevantSkills.length > 0) {
      prompt += `### Active Scientific Skills:\n`;
      relevantSkills.forEach((skill) => {
        prompt += `\n**[Skill: ${skill.displayName}]**\n${skill.instructions}\n`;
      });
    }

    return prompt;
  }
}

export const globalAgentRegistry = new AgentRegistry();
