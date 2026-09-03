/**
 * Electron-builder beforeBuild hook.
 * Returning false skips native dependency installation/rebuilding and prevents
 * electron-builder from executing 'npm install --production' in monorepo workspaces.
 */
module.exports = async function beforeBuild(context) {
  return false;
};
