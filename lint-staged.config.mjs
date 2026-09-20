/** @type {import('lint-staged').Configuration} */

const CHUNK_SIZE = 20;

function quotePath(file) {
  return `"${file.replace(/"/g, '\\"')}"`;
}

function chunkCommands(files, command) {
  if (files.length === 0) return [];

  const commands = [];
  for (let index = 0; index < files.length; index += CHUNK_SIZE) {
    const chunk = files
      .slice(index, index + CHUNK_SIZE)
      .map(quotePath)
      .join(" ");
    commands.push(`${command} ${chunk}`);
  }
  return commands;
}

const lintStagedConfig = {
  "*.{ts,tsx,js,mjs,cjs,json,md,css}": (files) =>
    chunkCommands(files, "prettier --write --ignore-unknown"),
  "*.{ts,tsx}": (files) => chunkCommands(files, "eslint --fix"),
};

export default lintStagedConfig;
