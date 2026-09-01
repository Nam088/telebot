/**
 * Resolves the next release version and tag for a specified package in the monorepo
 * based on conventional commits touching that package since its last tag.
 *
 * Usage:
 *   node scripts/resolve-release-version.mjs --package go
 *   node scripts/resolve-release-version.mjs --package python --tag packages/python/v1.7.0
 *   node scripts/resolve-release-version.mjs --package python --version 1.7.1 --output-file "$GITHUB_OUTPUT"
 *
 * @module
 */

import { execSync } from "node:child_process";
import fs from "node:fs";

export function parseArgs(args = process.argv.slice(2)) {
  const options = {
    package: "",
    tag: "",
    version: "",
    outputFile: "",
    defaultVersion: "0.1.0",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--package" && i + 1 < args.length) {
      options.package = args[++i];
    } else if (arg === "--tag" && i + 1 < args.length) {
      options.tag = args[++i];
    } else if (arg === "--version" && i + 1 < args.length) {
      options.version = args[++i];
    } else if (arg === "--output-file" && i + 1 < args.length) {
      options.outputFile = args[++i];
    } else if (arg === "--default-version" && i + 1 < args.length) {
      options.defaultVersion = args[++i];
    }
  }

  return options;
}

export function parseSemVer(versionStr) {
  const clean = versionStr.replace(/^v/, "").trim();
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) {
    return null;
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || "",
    raw: clean,
  };
}

export function bumpVersion(semver, bumpType) {
  if (bumpType === "major") {
    return `${semver.major + 1}.0.0`;
  }
  if (bumpType === "minor") {
    return `${semver.major}.${semver.minor + 1}.0`;
  }
  if (bumpType === "patch") {
    return `${semver.major}.${semver.minor}.${semver.patch + 1}`;
  }
  return semver.raw;
}

export function analyzeCommits(commits) {
  let bumpType = "none";

  for (const msg of commits) {
    const line = msg.trim();
    if (!line) continue;

    // Check for breaking changes
    if (
      line.includes("BREAKING CHANGE:") ||
      line.includes("BREAKING-CHANGE:") ||
      /^(\w+)(\([^)]+\))?!:/.test(line)
    ) {
      return "major";
    }

    // Check for feat
    if (/^feat(\([^)]+\))?:/.test(line)) {
      if (bumpType !== "major") {
        bumpType = "minor";
      }
    } else if (
      /^fix(\([^)]+\))?:/.test(line) ||
      /^perf(\([^)]+\))?:/.test(line) ||
      /^refactor(\([^)]+\))?:/.test(line) ||
      /^docs(\([^)]+\))?:/.test(line)
    ) {
      if (bumpType === "none") {
        bumpType = "patch";
      }
    }
  }

  return bumpType;
}

export function getLatestTag(pkg, cwd = process.cwd()) {
  const prefix = `packages/${pkg}/v`;
  try {
    const output = execSync(`git tag -l "${prefix}*" --sort=-v:refname`, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const tags = output
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.startsWith(prefix));
    if (tags[0]) return tags[0];

    // Fallback for legacy node vX.Y.Z tags
    if (pkg === "node") {
      const legacyOutput = execSync(`git tag -l "v[0-9]*" --sort=-v:refname`, {
        cwd,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const legacyTags = legacyOutput
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => /^v\d+\.\d+\.\d+/.test(t));
      return legacyTags[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function getCommitsSince(tag, pkg, cwd = process.cwd()) {
  try {
    const pathFilter = pkg === "node" ? "packages/node" : `packages/${pkg}`;
    const range = tag ? `${tag}..HEAD` : "HEAD";
    const output = execSync(`git log ${range} --oneline -- ${pathFilter}`, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output
      .split("\n")
      .map((line) => line.replace(/^[a-f0-9]+\s+/, "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function resolveRelease(options, cwd = process.cwd()) {
  const pkg = options.package;
  if (!pkg) {
    throw new Error("--package is required (node, go, python)");
  }

  const prefix = `packages/${pkg}/v`;

  // Case 1: Explicit version provided via CLI input
  if (options.version) {
    const parsed = parseSemVer(options.version);
    if (!parsed) {
      throw new Error(`Invalid version format: ${options.version}`);
    }
    return {
      package: pkg,
      version: parsed.raw,
      tag: `${prefix}${parsed.raw}`,
      should_release: true,
      bump_type: "custom",
      previous_tag: getLatestTag(pkg, cwd) || "",
    };
  }

  // Case 2: Tag provided via GITHUB_REF_NAME (e.g. packages/go/v1.7.0)
  if (options.tag) {
    const tagVersion = options.tag.startsWith(prefix)
      ? options.tag.slice(prefix.length)
      : options.tag.replace(/^v/, "");
    const parsed = parseSemVer(tagVersion);
    if (!parsed) {
      throw new Error(`Invalid tag version: ${options.tag}`);
    }
    return {
      package: pkg,
      version: parsed.raw,
      tag: `${prefix}${parsed.raw}`,
      should_release: true,
      bump_type: "tag",
      previous_tag: getLatestTag(pkg, cwd) || "",
    };
  }

  // Case 3: Automatic conventional commit detection since latest tag
  const latestTag = getLatestTag(pkg, cwd);
  const commits = getCommitsSince(latestTag, pkg, cwd);
  const bumpType = analyzeCommits(commits);

  if (!latestTag) {
    const baseVersion = options.defaultVersion || "0.1.0";
    return {
      package: pkg,
      version: baseVersion,
      tag: `${prefix}${baseVersion}`,
      should_release: commits.length > 0,
      bump_type: bumpType !== "none" ? bumpType : "initial",
      previous_tag: "",
      commits_count: commits.length,
    };
  }

  const currentVersionStr = latestTag.slice(prefix.length);
  const currentSemver = parseSemVer(currentVersionStr);

  if (!currentSemver || bumpType === "none") {
    return {
      package: pkg,
      version: currentSemver ? currentSemver.raw : currentVersionStr,
      tag: latestTag,
      should_release: false,
      bump_type: "none",
      previous_tag: latestTag,
      commits_count: commits.length,
    };
  }

  const nextVersion = bumpVersion(currentSemver, bumpType);
  return {
    package: pkg,
    version: nextVersion,
    tag: `${prefix}${nextVersion}`,
    should_release: true,
    bump_type: bumpType,
    previous_tag: latestTag,
    commits_count: commits.length,
  };
}

export function main() {
  const options = parseArgs();
  const result = resolveRelease(options);

  console.log(JSON.stringify(result, null, 2));

  if (options.outputFile) {
    const lines = [
      `version=${result.version}`,
      `tag=${result.tag}`,
      `should_release=${result.should_release}`,
      `bump_type=${result.bump_type}`,
      `previous_tag=${result.previous_tag || ""}`,
    ];
    fs.appendFileSync(options.outputFile, lines.join("\n") + "\n", "utf-8");
  }
}

if (process.argv[1] && process.argv[1].endsWith("resolve-release-version.mjs")) {
  main();
}
