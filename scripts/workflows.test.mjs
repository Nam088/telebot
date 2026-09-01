/**
 * Tests for GitHub CI/CD workflows and independent package release automation.
 *
 * Run with: node --test scripts/workflows.test.mjs
 * (or via the repository's `npm run test:scripts` script)
 *
 * @module
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  analyzeCommits,
  bumpVersion,
  parseArgs,
  parseSemVer,
  resolveRelease,
} from "./resolve-release-version.mjs";

/** Simple minimal YAML parser for workflow structure validation */
function parseSimpleYaml(content) {
  const lines = content.split("\n");
  const result = { rawLines: lines };

  let currentKey = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      result[currentKey] = match[2].trim() || true;
    }
  }
  return result;
}

test("CI and Release workflow files exist and are not empty", () => {
  const workflows = [
    ".github/workflows/ci.yml",
    ".github/workflows/release-pipeline.yml",
    ".github/workflows/go-release.yml",
    ".github/workflows/python-release.yml",
  ];

  for (const wf of workflows) {
    assert.ok(fs.existsSync(wf), `Workflow file ${wf} must exist`);
    const stats = fs.statSync(wf);
    assert.ok(stats.size > 100, `Workflow file ${wf} must not be empty`);
  }
});

test("Node release workflow is scoped strictly to packages/node", () => {
  const content = fs.readFileSync(".github/workflows/release-pipeline.yml", "utf-8");
  assert.ok(content.includes("packages/node/**"), "Must trigger on packages/node/** changes");
  assert.equal(
    content.includes("packages/go/**"),
    false,
    "Node release must NOT include packages/go/** path",
  );
  assert.equal(
    content.includes("packages/python/**"),
    false,
    "Node release must NOT include packages/python/** path",
  );
  assert.equal(
    content.includes("Mirror Go tag"),
    false,
    "Node release must NOT mirror tags to Go",
  );
  assert.equal(
    content.includes("Mirror Python tag"),
    false,
    "Node release must NOT mirror tags to Python",
  );
});

test("Go release workflow is scoped strictly to packages/go", () => {
  const content = fs.readFileSync(".github/workflows/go-release.yml", "utf-8");
  assert.ok(content.includes("packages/go/**"), "Must trigger on packages/go/** changes");
  assert.ok(content.includes("packages/go/v*"), "Must trigger on packages/go/v* tags");
  assert.equal(
    content.includes("packages/node/**"),
    false,
    "Go release must NOT include packages/node/** path",
  );
  assert.equal(
    content.includes("packages/python/**"),
    false,
    "Go release must NOT include packages/python/** path",
  );
  assert.ok(content.includes("telebot-go"), "Release title must be for telebot-go");
  assert.ok(content.includes("contents: write"), "Must have contents: write permission");
});

test("Python release workflow is scoped strictly to packages/python with PyPI OIDC", () => {
  const content = fs.readFileSync(".github/workflows/python-release.yml", "utf-8");
  assert.ok(content.includes("packages/python/**"), "Must trigger on packages/python/** changes");
  assert.ok(content.includes("packages/python/v*"), "Must trigger on packages/python/v* tags");
  assert.equal(
    content.includes("packages/node/**"),
    false,
    "Python release must NOT include packages/node/** path",
  );
  assert.equal(
    content.includes("packages/go/**"),
    false,
    "Python release must NOT include packages/go/** path",
  );
  assert.ok(content.includes("environment: pypi"), "Must specify environment: pypi for trusted publishing");
  assert.ok(content.includes("id-token: write"), "Must have id-token: write permission for PyPI OIDC");
  assert.ok(content.includes("gh-action-pypi-publish"), "Must publish via official PyPI action");
});

test("Git-cliff configuration is scoped per package", () => {
  const goCliff = fs.readFileSync("packages/go/cliff.toml", "utf-8");
  assert.ok(goCliff.includes('tag_pattern = "packages/go/v[0-9].*"'), "Go cliff must match packages/go/v* tags");
  assert.ok(goCliff.includes('include_paths = ["packages/go/*"]'), "Go cliff must include only packages/go/* paths");

  const pyCliff = fs.readFileSync("packages/python/cliff.toml", "utf-8");
  assert.ok(pyCliff.includes('tag_pattern = "packages/python/v[0-9].*"'), "Python cliff must match packages/python/v* tags");
  assert.ok(pyCliff.includes('include_paths = ["packages/python/*"]'), "Python cliff must include only packages/python/* paths");
});

test("parseSemVer correctly parses semantic versions", () => {
  assert.deepEqual(parseSemVer("1.5.0"), {
    major: 1,
    minor: 5,
    patch: 0,
    prerelease: "",
    raw: "1.5.0",
  });

  assert.deepEqual(parseSemVer("v2.10.4-beta.1"), {
    major: 2,
    minor: 10,
    patch: 4,
    prerelease: "beta.1",
    raw: "2.10.4-beta.1",
  });

  assert.equal(parseSemVer("invalid"), null);
  assert.equal(parseSemVer("1.2"), null);
});

test("bumpVersion calculates next major, minor, patch versions", () => {
  const semver = parseSemVer("1.5.2");
  assert.equal(bumpVersion(semver, "patch"), "1.5.3");
  assert.equal(bumpVersion(semver, "minor"), "1.6.0");
  assert.equal(bumpVersion(semver, "major"), "2.0.0");
  assert.equal(bumpVersion(semver, "none"), "1.5.2");
});

test("analyzeCommits determines version bump based on conventional commits", () => {
  // Breaking changes
  assert.equal(analyzeCommits(["feat!: drop node 18 support", "fix: minor bug"]), "major");
  assert.equal(analyzeCommits(["fix: change\n\nBREAKING CHANGE: api redesign"]), "major");

  // Minor changes (features)
  assert.equal(analyzeCommits(["feat(go): add new handler", "fix(go): resolve race condition"]), "minor");
  assert.equal(analyzeCommits(["feat: add support for stars"]), "minor");

  // Patch changes (fixes, refactors, perf, docs)
  assert.equal(analyzeCommits(["fix(python): resolve type error", "refactor: clean codebase"]), "patch");
  assert.equal(analyzeCommits(["perf: optimize polling speed"]), "patch");
  assert.equal(analyzeCommits(["docs: update readme examples"]), "patch");

  // None (chores, ci, build)
  assert.equal(analyzeCommits(["chore: update deps", "ci: update github action"]), "none");
  assert.equal(analyzeCommits([]), "none");
});

test("resolveRelease handles explicit version and tag overrides", () => {
  // Custom version override
  const custom = resolveRelease({ package: "go", version: "2.0.0" });
  assert.equal(custom.version, "2.0.0");
  assert.equal(custom.tag, "packages/go/v2.0.0");
  assert.equal(custom.should_release, true);

  // Tag override for Python
  const pyTag = resolveRelease({ package: "python", tag: "packages/python/v1.6.2" });
  assert.equal(pyTag.version, "1.6.2");
  assert.equal(pyTag.tag, "packages/python/v1.6.2");
  assert.equal(pyTag.should_release, true);

  // Missing package throws
  assert.throws(() => resolveRelease({}), /--package is required/);
});

test("parseArgs parses CLI arguments cleanly", () => {
  const args = parseArgs(["--package", "python", "--version", "1.7.0", "--output-file", "/tmp/out.txt"]);
  assert.equal(args.package, "python");
  assert.equal(args.version, "1.7.0");
  assert.equal(args.outputFile, "/tmp/out.txt");
});

test("CI workflow has path filter job to optimize PR execution", () => {
  const content = fs.readFileSync(".github/workflows/ci.yml", "utf-8");
  assert.ok(content.includes("dorny/paths-filter"), "Must use paths-filter to detect modified packages");
  assert.ok(content.includes("needs.changes.outputs.node"), "Node job must depend on changes.outputs.node");
  assert.ok(content.includes("needs.changes.outputs.go"), "Go job must depend on changes.outputs.go");
  assert.ok(content.includes("needs.changes.outputs.python"), "Python job must depend on changes.outputs.python");
  assert.ok(content.includes("needs.changes.outputs.fidelity"), "Fidelity job must depend on changes.outputs.fidelity");
});
