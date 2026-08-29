import { globalSkillRegistry, globalSkillInstaller } from '@junscience/core';
import { colors } from '../ui/banner.js';
import readline from 'node:readline';

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

export async function handleSkillCommand(args: string[]): Promise<void> {
  const c = colors;
  const subCommand = args[0] || 'list';

  switch (subCommand) {
    case 'list':
    case 'ls': {
      const bundled = globalSkillRegistry.listBundled();
      const userInstalled = globalSkillRegistry.listUserInstalled();

      console.log(`\n${c.bold}${c.brightCyan}=== JunScience Scientific Skill Registry ===${c.reset}\n`);

      console.log(`${c.bold}Built-in Bundled Skills (${bundled.length}):${c.reset}`);
      console.log(
        '  ' +
          `${c.bold}${'Skill ID'.padEnd(36)}${'Category'.padEnd(22)}${'Status'.padEnd(14)}Description${c.reset}`
      );
      console.log(`  ${c.gray}${'─'.repeat(105)}${c.reset}`);

      for (const s of bundled) {
        const categoryStr = `${c.brightYellow}${s.category}${c.reset}`;
        const statusStr = `${c.brightGreen}● Core${c.reset}`;
        console.log(
          '  ' +
            `${c.bold}${s.id.padEnd(36)}${c.reset}` +
            categoryStr.padEnd(31) +
            statusStr.padEnd(23) +
            `${c.dim}${s.description.slice(0, 50)}...${c.reset}`
        );
      }

      console.log(`\n${c.bold}User-Installed Skills (${userInstalled.length}):${c.reset}`);
      if (userInstalled.length === 0) {
        console.log(`  ${c.gray}(No user-installed skills found in ~/.junscience/skills/)${c.reset}`);
        console.log(`  ${c.dim}Use "junscience skill install <git-url | local-path>" to securely install third-party skills.${c.reset}\n`);
      } else {
        console.log(
          '  ' +
            `${c.bold}${'Skill ID'.padEnd(36)}${'Author'.padEnd(22)}${'Status'.padEnd(14)}Path${c.reset}`
        );
        console.log(`  ${c.gray}${'─'.repeat(105)}${c.reset}`);

        for (const s of userInstalled) {
          const authorStr = `${c.brightPurple}${s.author || 'User'}${c.reset}`;
          const statusStr = `${c.brightCyan}● Installed${c.reset}`;
          console.log(
            '  ' +
              `${c.bold}${s.id.padEnd(36)}${c.reset}` +
              authorStr.padEnd(31) +
              statusStr.padEnd(23) +
              `${c.dim}~/.junscience/skills/${s.id}${c.reset}`
          );
        }
        console.log();
      }
      break;
    }

    case 'install':
    case 'add': {
      const source = args[1];
      if (!source) {
        console.log(`${c.yellow}Usage: junscience skill install <git-url | local-directory-path> [--yes]${c.reset}`);
        return;
      }

      const autoConfirm = args.includes('--yes') || args.includes('-y');
      console.log(`\n${c.bold}${c.brightCyan}🛡️ JunScience Skill Security Audit Initiated...${c.reset}`);
      console.log(`${c.gray}Target Source: ${source}${c.reset}\n`);

      const result = await globalSkillInstaller.installSkill(source, autoConfirm);

      if (!result.auditReport.passed) {
        console.log(`${c.bold}${c.brightRed}✖ SECURITY AUDIT REJECTED: ${result.auditReport.violations.length} Critical Violation(s) Detected!${c.reset}\n`);
        for (const v of result.auditReport.violations) {
          console.log(`  ${c.brightRed}[${v.ruleId}]${c.reset} ${c.bold}${v.ruleCategory}${c.reset} (Severity: ${c.brightRed}${v.severity}${c.reset})`);
          console.log(`    ${c.gray}File:${c.reset} ${v.file}:${v.line}`);
          console.log(`    ${c.gray}Reason:${c.reset} ${v.message}`);
          if (v.matchedSnippet) {
            console.log(`    ${c.gray}Snippet:${c.reset} ${c.yellow}${v.matchedSnippet}${c.reset}`);
          }
          console.log();
        }
        console.log(`${c.brightRed}Installation aborted to protect local host and clinical privacy.${c.reset}\n`);
        return;
      }

      const cap = result.auditReport.capabilitySummary!;
      console.log(`${c.bold}${c.brightGreen}✔ Static Security Audit Passed (0 violations found across ${result.auditReport.totalFilesAudited} files)${c.reset}`);
      console.log(`  ${c.gray}${'─'.repeat(70)}${c.reset}`);
      console.log(`  ${c.bold}Skill ID:${c.reset}        ${cap.skillId}`);
      console.log(`  ${c.bold}Name:${c.reset}            ${cap.name}`);
      console.log(`  ${c.bold}Version:${c.reset}         ${cap.version}`);
      console.log(`  ${c.bold}Author:${c.reset}          ${cap.author}`);
      console.log(`  ${c.bold}Required Tools:${c.reset}  ${cap.requiredTools.join(', ')}`);
      console.log(`  ${c.bold}Network Policy:${c.reset}  ${c.brightYellow}${cap.networkPolicy}${c.reset}`);
      console.log(`  ${c.bold}Filesystem:${c.reset}      ${cap.filesystemScope}`);
      console.log(`  ${c.bold}Helper Scripts:${c.reset}  ${cap.helperScripts.length} file(s)`);
      for (const h of cap.helperScripts) {
        console.log(`    - ${h.filename} (${h.lineCount} lines, SHA-256: ${h.sha256.slice(0, 16)}...)`);
      }
      console.log(`  ${c.gray}${'─'.repeat(70)}${c.reset}\n`);

      if (autoConfirm) {
        console.log(`${c.brightGreen}✔ Skill '${cap.name}' installed successfully to ${result.installedPath}${c.reset}\n`);
        return;
      }

      const ans = await askQuestion(`${c.bold}? Authorize and install this skill to ~/.junscience/skills/${cap.skillId}? (y/N): ${c.reset}`);
      if (ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes') {
        const installRes = await globalSkillInstaller.installSkill(source, true);
        console.log(`\n${c.brightGreen}✔ Skill '${cap.name}' authorized and installed successfully!${c.reset}\n`);
      } else {
        console.log(`\n${c.yellow}Installation cancelled by user.${c.reset}\n`);
      }
      break;
    }

    case 'remove':
    case 'rm':
    case 'uninstall': {
      const skillId = args[1];
      if (!skillId) {
        console.log(`${c.yellow}Usage: junscience skill remove <skill-id>${c.reset}`);
        return;
      }

      const success = globalSkillInstaller.uninstallSkill(skillId);
      if (success) {
        console.log(`\n${c.brightGreen}✔ User skill '${skillId}' successfully removed from ~/.junscience/skills/${c.reset}\n`);
      } else {
        console.log(`\n${c.yellow}Skill '${skillId}' not found in user-installed skills.${c.reset}\n`);
      }
      break;
    }

    default:
      console.log(`${c.yellow}Unknown skill subcommand: "${subCommand}". Available: "list", "install <source>", "remove <name>"${c.reset}`);
      break;
  }
}
