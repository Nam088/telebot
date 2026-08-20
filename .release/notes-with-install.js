import { execSync } from "node:child_process";

/**
 * Custom semantic-release plugin that prepends a fixed installation
 * section (npm / yarn / pnpm / bun) before the auto-generated notes.
 */

const generateNotes = async (pluginConfig, context) => {
  const { nextRelease, logger } = context;
  const version = nextRelease.version;

  // Run the default release-notes-generator inline via exec
  // We delegate to @semantic-release/release-notes-generator by
  // requiring it directly and calling its generateNotes step.
  const generator = await import("@semantic-release/release-notes-generator");
  const generatedNotes = await generator.generateNotes(pluginConfig, context);

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

  logger.log("Prepending installation section to release notes.");
  return installSection + generatedNotes;
};

export default { generateNotes };
