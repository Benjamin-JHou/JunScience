import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { globalSkillRegistry } from './SkillRegistry.js';

export interface SkillViolation {
  ruleId: string;
  ruleCategory: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  file: string;
  line: number;
  message: string;
  matchedSnippet: string;
}

export interface SkillCapabilitySummary {
  skillId: string;
  name: string;
  version: string;
  author: string;
  description: string;
  requiredTools: string[];
  helperScripts: { filename: string; lineCount: number; sha256: string }[];
  networkPolicy: string;
  filesystemScope: string;
}

export interface SkillAuditReport {
  passed: boolean;
  totalFilesAudited: number;
  violations: SkillViolation[];
  capabilitySummary?: SkillCapabilitySummary;
}

export interface SkillInstallResult {
  success: boolean;
  message: string;
  auditReport: SkillAuditReport;
  installedPath?: string;
}

export class SkillInstaller {
  private userSkillsDir: string;

  constructor(userSkillsDir?: string) {
    const baseHome = process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience');
    this.userSkillsDir = userSkillsDir || path.join(baseHome, 'skills');
    if (!fs.existsSync(this.userSkillsDir)) {
      fs.mkdirSync(this.userSkillsDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Static Security Auditing Engine (Rulebook Implementation)
   */
  public auditSkillDirectory(stagingDir: string): SkillAuditReport {
    const violations: SkillViolation[] = [];
    const files = this.getAllFiles(stagingDir);

    if (files.length === 0) {
      return {
        passed: false,
        totalFilesAudited: 0,
        violations: [
          {
            ruleId: 'SEC-VAL-01',
            ruleCategory: 'Validation',
            severity: 'CRITICAL',
            file: 'N/A',
            line: 0,
            message: 'Staging directory is empty or invalid.',
            matchedSnippet: '',
          },
        ],
      };
    }

    // Check for required SKILL.md
    const skillMdPath = path.join(stagingDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      violations.push({
        ruleId: 'SEC-VAL-02',
        ruleCategory: 'Validation',
        severity: 'CRITICAL',
        file: 'SKILL.md',
        line: 0,
        message: 'Missing mandatory SKILL.md specification file in skill repository.',
        matchedSnippet: '',
      });
    }

    // Audit each file against the security rulebook
    for (const filePath of files) {
      const relPath = path.relative(stagingDir, filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        const lineNum = i + 1;

        // Rule SEC-RCE-01: Suspicious Remote Code Execution / Reverse Shells
        if (
          /curl\s+[^\|]+\|\s*(?:bash|sh|zsh)/i.test(lineContent) ||
          /wget\s+[^\|]+\|\s*(?:bash|sh|zsh)/i.test(lineContent) ||
          /nc\s+(?:-[a-zA-Z]*e\s+|\d+\.\d+\.\d+\.\d+)/i.test(lineContent) ||
          /\/dev\/tcp\/\d+\.\d+\.\d+\.\d+/i.test(lineContent)
        ) {
          violations.push({
            ruleId: 'SEC-RCE-01',
            ruleCategory: 'Remote Command Execution',
            severity: 'CRITICAL',
            file: relPath,
            line: lineNum,
            message: 'Detected suspicious remote shell piping or reverse shell command.',
            matchedSnippet: lineContent.trim(),
          });
        }

        // Rule SEC-RCE-02: Code Obfuscation & Dangerous Reflection
        if (
          /eval\s*\(\s*(?:base64|b64decode|__import__)/i.test(lineContent) ||
          /exec\s*\(\s*(?:base64|b64decode|decode\()/i.test(lineContent) ||
          /pickle\.loads\s*\(/i.test(lineContent) ||
          /subprocess\.(?:Popen|call|run)\s*\([^)]*shell\s*=\s*True/i.test(lineContent)
        ) {
          violations.push({
            ruleId: 'SEC-RCE-02',
            ruleCategory: 'Malicious Obfuscation / Insecure Shell',
            severity: 'CRITICAL',
            file: relPath,
            line: lineNum,
            message: 'Detected obfuscated dynamic evaluation (eval/exec) or unverified shell=True subprocess execution.',
            matchedSnippet: lineContent.trim(),
          });
        }

        // Rule SEC-ESC-01: Path Traversal & Sensitive Host Credential Probing
        if (
          /\.\.\/\.\.\//.test(lineContent) ||
          /(?:~|\/home\/[^\/]+|\/Users\/[^\/]+)\/\.(?:ssh|aws|gnupg|bashrc|zshrc)/.test(lineContent) ||
          /\/etc\/(?:shadow|passwd|sudoers)/.test(lineContent) ||
          /[Cc]:\\(?:Windows|System32)/.test(lineContent)
        ) {
          violations.push({
            ruleId: 'SEC-ESC-01',
            ruleCategory: 'Filesystem Traversal & Host Credential Probing',
            severity: 'CRITICAL',
            file: relPath,
            line: lineNum,
            message: 'Detected path traversal (../../) or access attempt to sensitive host credential files (~/.ssh, ~/.aws, /etc/shadow).',
            matchedSnippet: lineContent.trim(),
          });
        }

        // Rule SEC-ESC-02: Sandbox Policy Tampering
        if (
          /\/tmp\/seatbelt\.sb/.test(lineContent) ||
          /bwrap\s+.*--dev-bind\s+\/\s+\//.test(lineContent)
        ) {
          violations.push({
            ruleId: 'SEC-ESC-02',
            ruleCategory: 'Sandbox Policy Tampering',
            severity: 'HIGH',
            file: relPath,
            line: lineNum,
            message: 'Detected attempt to probe or tamper with kernel sandbox configuration.',
            matchedSnippet: lineContent.trim(),
          });
        }

        // Rule SEC-GATE-01: JunScience Mandatory Hook & Gate Tampering
        if (
          /unregister\s*\(\s*['"](?:clinical-data-gate|evidence-verifier|secret-redaction)['"]\s*\)/.test(lineContent) ||
          /disableHook\s*\(\s*['"](?:clinical-data-gate|evidence-verifier|secret-redaction)['"]\s*\)/.test(lineContent) ||
          /globalHookRegistry\.unregister/.test(lineContent)
        ) {
          violations.push({
            ruleId: 'SEC-GATE-01',
            ruleCategory: 'Mandatory Hook Bypass',
            severity: 'CRITICAL',
            file: relPath,
            line: lineNum,
            message: 'Detected illegal attempt to disable or unregister mandatory security/privacy hooks.',
            matchedSnippet: lineContent.trim(),
          });
        }

        // Rule SEC-NET-01: Credential Exfiltration / Token Snooping
        if (
          /(?:process\.env|os\.environ)\s*\[\s*['"](?:OPENAI|ANTHROPIC|DEEPSEEK|AWS)_.*KEY['"]\s*\]/i.test(lineContent) &&
          /(?:requests\.post|fetch|axios\.post|http\.request)/i.test(lineContent)
        ) {
          violations.push({
            ruleId: 'SEC-NET-01',
            ruleCategory: 'Credential Snooping & Exfiltration',
            severity: 'CRITICAL',
            file: relPath,
            line: lineNum,
            message: 'Detected pattern reading API credentials from environment combined with remote outbound POST transmission.',
            matchedSnippet: lineContent.trim(),
          });
        }
      }
    }

    const passed = violations.length === 0;
    let capabilitySummary: SkillCapabilitySummary | undefined;

    if (passed && fs.existsSync(skillMdPath)) {
      capabilitySummary = this.extractCapabilitySummary(stagingDir, skillMdPath, files);
    }

    return {
      passed,
      totalFilesAudited: files.length,
      violations,
      capabilitySummary,
    };
  }

  private extractCapabilitySummary(
    stagingDir: string,
    skillMdPath: string,
    files: string[]
  ): SkillCapabilitySummary {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const folderName = path.basename(stagingDir);
    const lines = content.split('\n');

    let name = folderName;
    let version = '1.0.0';
    let author = 'Third-Party Contributor';
    let description = 'Custom Scientific Skill';
    const requiredTools: string[] = [];

    let inTools = false;
    for (const line of lines) {
      if (line.startsWith('name:')) name = line.replace('name:', '').trim();
      if (line.startsWith('version:')) version = line.replace('version:', '').trim();
      if (line.startsWith('author:')) author = line.replace('author:', '').trim();
      if (line.startsWith('description:')) description = line.replace('description:', '').trim();
      if (line.startsWith('requiredTools:')) {
        inTools = true;
        continue;
      }
      if (inTools) {
        const trimmed = line.trim();
        if (trimmed.startsWith('-')) {
          const tool = trimmed.replace(/^-\s*/, '').trim();
          if (tool && tool !== '--') {
            requiredTools.push(tool);
          }
        } else if (trimmed !== '' && !line.startsWith(' ') && !line.startsWith('\t')) {
          inTools = false;
        }
      }
    }

    const helperScripts: { filename: string; lineCount: number; sha256: string }[] = [];
    for (const f of files) {
      if (f.endsWith('.py') || f.endsWith('.sh') || f.endsWith('.js') || f.endsWith('.ts')) {
        const fileContent = fs.readFileSync(f);
        const rel = path.relative(stagingDir, f);
        const sha256 = crypto.createHash('sha256').update(fileContent).digest('hex');
        helperScripts.push({
          filename: rel,
          lineCount: fileContent.toString('utf-8').split('\n').length,
          sha256,
        });
      }
    }

    const skillId = name ? name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : folderName;

    return {
      skillId,
      name,
      version,
      author,
      description,
      requiredTools: requiredTools.length > 0 ? requiredTools : ['python_runner'],
      helperScripts,
      networkPolicy: 'AIR-GAPPED (No outbound network access permitted)',
      filesystemScope: 'Strictly confined to ~/.junscience/workspace/<sessionId>/',
    };
  }

  /**
   * Install a Skill from local directory or Git repository
   */
  public async installSkill(
    sourceUrlOrPath: string,
    autoConfirm: boolean = false
  ): Promise<SkillInstallResult> {
    const tempStagingDir = path.join(os.tmpdir(), `junscience-skill-${Date.now()}`);

    try {
      // 1. Staging preparation
      if (fs.existsSync(sourceUrlOrPath)) {
        // Local path
        this.copyRecursive(sourceUrlOrPath, tempStagingDir);
      } else if (sourceUrlOrPath.startsWith('http://') || sourceUrlOrPath.startsWith('https://') || sourceUrlOrPath.startsWith('git@')) {
        // Git Clone
        execSync(`git clone --depth 1 "${sourceUrlOrPath}" "${tempStagingDir}"`, { stdio: 'ignore' });
      } else {
        return {
          success: false,
          message: `Invalid source path or URL: '${sourceUrlOrPath}' (Local directory does not exist and URL is invalid).`,
          auditReport: { passed: false, totalFilesAudited: 0, violations: [] },
        };
      }

      // 2. Perform Static Security Audit
      const auditReport = this.auditSkillDirectory(tempStagingDir);
      if (!auditReport.passed) {
        return {
          success: false,
          message: `Security Audit REJECTED: Skill contains ${auditReport.violations.length} critical security violation(s). Installation aborted.`,
          auditReport,
        };
      }

      const summary = auditReport.capabilitySummary!;
      const targetInstallDir = path.join(this.userSkillsDir, summary.skillId);

      // 3. Auto-Confirm or require caller authorization
      if (autoConfirm) {
        if (fs.existsSync(targetInstallDir)) {
          fs.rmSync(targetInstallDir, { recursive: true, force: true });
        }
        this.copyRecursive(tempStagingDir, targetInstallDir);
        globalSkillRegistry.loadUserInstalledSkills();

        return {
          success: true,
          message: `Skill '${summary.name}' (ID: ${summary.skillId}) installed successfully to ${targetInstallDir}`,
          auditReport,
          installedPath: targetInstallDir,
        };
      }

      return {
        success: true,
        message: 'Security Audit PASSED. Awaiting user confirmation to proceed with installation.',
        auditReport,
        installedPath: targetInstallDir,
      };
    } finally {
      // Clean up staging directory
      try {
        if (fs.existsSync(tempStagingDir)) {
          fs.rmSync(tempStagingDir, { recursive: true, force: true });
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Commit confirmed installation
   */
  public commitInstallation(stagingDir: string, skillId: string): string {
    const targetInstallDir = path.join(this.userSkillsDir, skillId);
    if (fs.existsSync(targetInstallDir)) {
      fs.rmSync(targetInstallDir, { recursive: true, force: true });
    }
    this.copyRecursive(stagingDir, targetInstallDir);
    globalSkillRegistry.loadUserInstalledSkills();
    return targetInstallDir;
  }

  /**
   * Uninstall a user-installed Skill
   */
  public uninstallSkill(skillId: string): boolean {
    const targetInstallDir = path.join(this.userSkillsDir, skillId);
    if (fs.existsSync(targetInstallDir)) {
      fs.rmSync(targetInstallDir, { recursive: true, force: true });
      globalSkillRegistry.loadUserInstalledSkills();
      return true;
    }
    return false;
  }

  /**
   * List all user-installed skills
   */
  public listInstalledSkills(): { skillId: string; name: string; path: string }[] {
    if (!fs.existsSync(this.userSkillsDir)) return [];
    const entries = fs.readdirSync(this.userSkillsDir, { withFileTypes: true });
    const result: { skillId: string; name: string; path: string }[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(this.userSkillsDir, entry.name);
      result.push({
        skillId: entry.name,
        name: entry.name,
        path: skillPath,
      });
    }
    return result;
  }

  private getAllFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === '.git') continue;
      if (entry.isDirectory()) {
        results.push(...this.getAllFiles(fullPath));
      } else {
        results.push(fullPath);
      }
    }
    return results;
  }

  private copyRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true, mode: 0o700 });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git') continue;
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        this.copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

export const globalSkillInstaller = new SkillInstaller();
