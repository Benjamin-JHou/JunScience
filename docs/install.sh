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
echo -e "Scientific AI Workstation & Autonomous Research Engine (v1.4.0)"
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

# Check npm & git
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi

if ! command -v git >/dev/null 2>&1; then
    echo -e "${RED}Error: git is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}==>${NC} Setting up JunScience CLI Workstation..."

INSTALL_DIR="${HOME}/.junscience-cli-runtime"

if [ -d "${INSTALL_DIR}/.git" ]; then
    echo -e "Updating existing runtime at ${INSTALL_DIR}..."
    (cd "${INSTALL_DIR}" && git fetch --depth=1 origin main && git reset --hard origin/main) || true
else
    echo -e "Cloning latest JunScience repository..."
    rm -rf "${INSTALL_DIR}"
    git clone --depth=1 https://github.com/Benjamin-JHou/JunScience.git "${INSTALL_DIR}"
fi

cd "${INSTALL_DIR}"

echo -e "${GREEN}==>${NC} Installing dependencies and building core runtime..."
npm install --silent
npm run build:core --silent
npm run build:cli --silent

chmod +x "${INSTALL_DIR}/packages/cli/bin/junscience.js"

# Setup binary launchers
mkdir -p "${HOME}/.local/bin"
ln -sf "${INSTALL_DIR}/packages/cli/bin/junscience.js" "${HOME}/.local/bin/junscience"

# Attempt linking into /usr/local/bin if writable
if [ -w "/usr/local/bin" ]; then
    ln -sf "${INSTALL_DIR}/packages/cli/bin/junscience.js" "/usr/local/bin/junscience" 2>/dev/null || true
fi

# Also attempt npm link into global npm prefix
(cd "${INSTALL_DIR}/packages/cli" && npm link --silent 2>/dev/null) || true

# Ensure PATH has ~/.local/bin
PATH_NEEDS_UPDATE=0
if [[ ":$PATH:" != *":${HOME}/.local/bin:"* ]]; then
    PATH_NEEDS_UPDATE=1
    if [ -f "${HOME}/.zshrc" ]; then
        if ! grep -q 'export PATH="${HOME}/.local/bin:${PATH}"' "${HOME}/.zshrc"; then
            echo 'export PATH="${HOME}/.local/bin:${PATH}"' >> "${HOME}/.zshrc"
        fi
    fi
    if [ -f "${HOME}/.bashrc" ]; then
        if ! grep -q 'export PATH="${HOME}/.local/bin:${PATH}"' "${HOME}/.bashrc"; then
            echo 'export PATH="${HOME}/.local/bin:${PATH}"' >> "${HOME}/.bashrc"
        fi
    fi
fi

echo ""
echo -e "${GREEN}✔ Installation complete! (v1.4.0)${NC}"
echo ""

if [ "$PATH_NEEDS_UPDATE" -eq 1 ]; then
    echo -e "${YELLOW}Notice: Added ~/.local/bin to your shell PATH.${NC}"
    echo -e "Please run: ${CYAN}source ~/.zshrc${NC} (or restart terminal)"
    echo ""
fi

echo -e "To start the interactive research agent, run:"
echo -e "  ${CYAN}junscience${NC}"
echo ""
echo -e "To execute a scientific research task directly:"
echo -e "  ${CYAN}junscience research \"Investigate TYK2 JH2 pseudokinase allosteric binding\"${NC}"
echo ""
echo -e "To configure models and API keys:"
echo -e "  ${CYAN}junscience config set --model deepseek-chat --api-key <KEY>${NC}"
echo ""
