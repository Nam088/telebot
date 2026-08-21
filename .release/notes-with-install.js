/**
 * Custom semantic-release plugin.
 * - generateNotes: generates standard angular changelog notes
 * - publish: patches the GitHub Release body to prepend the Installation section
 *   via `gh release edit`, so CHANGELOG.md stays clean.
 */

export const generateNotes = async (pluginConfig, context) => {
  const generator = await import("@semantic-release/release-notes-generator");
  const notes = await generator.generateNotes(
    { preset: "angular" },
    context
  );
  return notes;
};

export const success = async (pluginConfig, context) => {
  const { nextRelease, logger } = context;
  const version = nextRelease.version;

  const installSection = `## Installation

\`\`\`bash
# npm
npm install telebot-ts@${version}

# yarn
yarn add telebot-ts@${version}

# pnpm
pnpm add telebot-ts@${version}

# bun
bun add telebot-ts@${version}
\`\`\`

> Requires **Node.js >= 22**. Zero external runtime dependencies.

---

`;

  logger.log("Prepending installation section to GitHub Release via gh CLI...");

  const { execSync } = await import("node:child_process");
  const currentNotes = nextRelease.notes ?? "";
  const fullNotes = installSection + currentNotes;

  // Write to temp file to avoid shell escaping issues
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/gh-release-notes.md", fullNotes, "utf8");

  try {
    execSync(`gh release edit "v${version}" --notes-file /tmp/gh-release-notes.md`, {
      stdio: "inherit",
    });
    logger.log(`GitHub Release v${version} updated with installation section.`);
  } catch (err) {
    logger.error("Failed to edit GitHub release notes:", err);
  }
};
