export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  // Foreground
  green: '\x1b[32m',
  brightGreen: '\x1b[92m',
  blue: '\x1b[34m',
  brightBlue: '\x1b[94m',
  cyan: '\x1b[36m',
  brightCyan: '\x1b[96m',
  yellow: '\x1b[33m',
  brightYellow: '\x1b[93m',
  purple: '\x1b[35m',
  brightPurple: '\x1b[95m',
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

export function renderBanner(version: string = '1.0.0', activeModel?: string, mode: 'plan' | 'act' = 'act'): void {
  const c = colors;
  const modeTag = mode === 'plan' 
    ? `${c.brightPurple}${c.bold}[PLAN MODE]${c.reset}`
    : `${c.brightGreen}${c.bold}[ACT MODE]${c.reset}`;

  console.log(`
${c.brightCyan}${c.bold}    __                  _____                             
   / /_  ______        / ___/_____(_)__  ____  ________  
  / / / / / __ \\______ \\__ \\/ ___/ / _ \\/ __ \\/ ___/ _ \\ 
 / / /_/ / / / /_____/___/ / /__/ /  __/ / / / /__/  __/ 
/_/\\__,_/_/ /_/      /____/\\___/_/\\___/_/ /_/\\___/\\___/  ${c.reset}
${c.gray}── Scientific AI Workstation & Autonomous Research Engine ──${c.reset}
${c.dim}Version: v${version}  •  Model: ${activeModel || 'Demo Mode (Mock)'}  •  Mode: ${modeTag}${c.reset}
${c.gray}Shortcuts: /model (switch model)  •  /plan | /act (switch modes)  •  /help (all commands)${c.reset}
`);
}
