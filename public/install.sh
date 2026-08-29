#!/usr/bin/env bash
set -e

# JunScience CLI Quick Installer
# Developer-first AI agent installer for scientific discovery

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "    __                  _____                             "
echo "   / /_  ______        / ___/_____(_)__  ____  ________  "
echo "  / / / / / __ \______ \__ \/ ___/ / _ \/ __ \/ ___/ _ \ "
echo " / / /_/ / / / /_____/___/ / /__/ /  __/ / / / /__/  __/ "
echo "/_/\__,_/_/ /_/      /____/\___/_/\___/_/ /_/\___/\___/  "
echo -e "${NC}"
echo -e "Scientific AI Workstation & Autonomous Research Engine"
echo "--------------------------------------------------------"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js 20+ (https://nodejs.org) or via nvm/brew."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}Warning: Node.js version $NODE_VERSION detected. Node.js 20+ is recommended.${NC}"
fi

# Check npm
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}==>${NC} Installing JunScience CLI globally via npm..."

# Install @junscience/cli or setup local alias
if npm install -g @junscience/cli 2>/dev/null; then
    echo -e "${GREEN}==>${NC} Successfully installed @junscience/cli!"
else
    echo -e "${YELLOW}Note: Setting up workspace launcher...${NC}"
    git clone https://github.com/Benjamin-JHou/JunScience.git "${HOME}/.junscience" 2>/dev/null || (cd "${HOME}/.junscience" && git pull)
    cd "${HOME}/.junscience"
    npm install
    npm run build:core && npm run build:cli
    mkdir -p "${HOME}/.local/bin"
    ln -sf "${HOME}/.junscience/packages/cli/bin/junscience.js" "${HOME}/.local/bin/junscience"
    export PATH="${HOME}/.local/bin:${PATH}"
fi

echo ""
echo -e "${GREEN}✔ Installation complete!${NC}"
echo ""
echo -e "To start the interactive research agent, run:"
echo -e "  ${CYAN}junscience${NC}"
echo ""
echo -e "To execute a scientific research task directly:"
echo -e "  ${CYAN}junscience research \"Investigate TYK2 JH2 pseudokinase allosteric binding\"${NC}"
echo ""
echo -e "To configure models and API keys:"
echo -e "  ${CYAN}junscience config set --model deepseek-chat --api-key <KEY>${NC}"
echo ""
