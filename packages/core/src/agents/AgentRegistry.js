import { builtInAgents } from './BaseAgent';
import { globalSkillRegistry } from '../skills/SkillRegistry';
import { globalToolRegistry } from '../tools/ToolRegistry';
export class AgentRegistry {
    agents = new Map();
    constructor() {
        builtInAgents.forEach((agent) => this.agents.set(agent.id, agent));
    }
    get(id) {
        return this.agents.get(id);
    }
    list() {
        return Array.from(this.agents.values());
    }
    getScopedTools(agentId) {
        const agent = this.get(agentId) || this.get('research');
        return globalToolRegistry.list().filter((tool) => agent.allowedToolCategories.includes(tool.category));
    }
    assembleSystemPrompt(agentId, userQuery) {
        const agent = this.get(agentId) || this.get('research');
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
//# sourceMappingURL=AgentRegistry.js.map