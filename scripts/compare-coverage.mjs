/**
 * compare-coverage.mjs
 *
 * Compares Vitest coverage summary files for each app and package
 * captured at two points, and fails if coverage has regressed.
 *
 * Unlike a percentage comparison, this works on absolute counts of UNCOVERED
 * statements, branches and functions. That makes it immune to formatting
 * changes (e.g. collapsing a multiline JSX expression), and to deletions of
 * well-tested code lowering a project's percentage.
 *
 * Rules
 *   1. Per project (present in both PR and baseline), for each of
 *      statements / branches / functions:
 *        regression  <=>  uncovered(PR) - uncovered(base) > tolerance
 *   2. A per-project regression is waived for a metric if the GLOBAL net change
 *      in uncovered items for that metric (summed over all compared projects,
 *      including new ones) is <= tolerance. This allows code to be moved
 *      between projects. Each metric is judged separately, so a net-zero on
 *      statements never excuses a regression in branches.
 *   3. Projects with no baseline ("new") are not gated individually; their
 *      uncovered items count towards the global total.
 *   4. Projects present in the baseline but not in the PR are reported and
 *      ignored (not credited towards the global total).
 *
 * Usage
 *   node compare-coverage.mjs <pr-dir> <baseline-dir>
 *
 * Environment
 *   COVERAGE_TOLERANCE   non-negative integer: number of additional uncovered
 *                        items allowed per project per metric, and globally
 *                        for the waiver. Default 0.
 *   GITHUB_STEP_SUMMARY  if set, a markdown table is appended to this file.
 *
 * Exit codes
 *   0  no (unwaived) regression
 *   1  coverage regressed
 *   2  script / input error
 */

import fs from "node:fs";
import path from "node:path";

const METRICS = ["statements", "branches", "functions"];

function fatal(message) {
  console.error(message);
  process.exit(2);
}

const [prDir, baseDir] = process.argv.slice(2);
if (!prDir || !baseDir) {
  fatal("Usage: node compare-coverage.mjs <pr-dir> <baseline-dir>");
}

const tolerance = Number(process.env.COVERAGE_TOLERANCE ?? 0);
if (!Number.isInteger(tolerance) || tolerance < 0) {
  fatal(
    `COVERAGE_TOLERANCE must be a non-negative integer, got "${process.env.COVERAGE_TOLERANCE}"`,
  );
}

const fmtDelta = (n) => (n > 0 ? `+${n}` : `${n}`);

function listProjects(dir) {
  if (!fs.existsSync(dir)) fatal(`Directory not found: ${dir}`);
  return new Map(
    fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => [file.replace(/\.json$/, ""), path.join(dir, file)]),
  );
}

/** Reads a coverage-summary.json and returns { metric: { total, covered, uncovered } }. */
function readCounts(file) {
  let total;
  try {
    total = JSON.parse(fs.readFileSync(file, "utf8")).total;
  } catch (err) {
    fatal(`Could not read ${file}: ${err.message}`);
  }

  const counts = {};
  for (const metric of METRICS) {
    const { total: t, covered: c } = total?.[metric] ?? {};
    if (!Number.isInteger(t) || !Number.isInteger(c)) {
      fatal(`${file}: missing or invalid "${metric}" totals`);
    }
    counts[metric] = { total: t, covered: c, uncovered: t - c };
  }
  return counts;
}

const prProjects = listProjects(prDir);
const baseProjects = listProjects(baseDir);

if (prProjects.size === 0) fatal(`No coverage summaries found in ${prDir}`);

const rows = [...prProjects].map(([name, file]) => ({
  name,
  pr: readCounts(file),
  base: baseProjects.has(name) ? readCounts(baseProjects.get(name)) : null,
}));
const baseOnly = [...baseProjects.keys()].filter(
  (name) => !prProjects.has(name),
);

// Change in uncovered items (positive = worse). New projects have an implicit baseline of zero.
const uncoveredDelta = (row, metric) =>
  row.pr[metric].uncovered - (row.base?.[metric].uncovered ?? 0);

const globalDelta = Object.fromEntries(
  METRICS.map((metric) => [
    metric,
    rows.reduce((sum, row) => sum + uncoveredDelta(row, metric), 0),
  ]),
);

const ICON = { ok: "✅", offset: "♻️ ", regressed: "❌", new: "🆕" };
const md = [
  "### Coverage comparison (uncovered items: base → PR)",
  "",
  `| Project | ${METRICS.join(" | ")} |`,
  `|---|${METRICS.map(() => "---").join("|")}|`,
];

let failed = false;

for (const row of rows) {
  console.log(`\nProject: ${row.name}${row.base ? "" : " (new, no baseline)"}`);
  const cells = [];

  for (const metric of METRICS) {
    const delta = uncoveredDelta(row, metric);
    const { total, uncovered } = row.pr[metric];

    let verdict = "ok";
    if (!row.base) verdict = "new";
    else if (delta > tolerance)
      verdict = globalDelta[metric] <= tolerance ? "offset" : "regressed";
    if (verdict === "regressed") failed = true;

    const before = row.base ? `${row.base[metric].uncovered} → ` : "";
    const totalBefore = row.base ? `${row.base[metric].total} → ` : "";
    console.log(
      `  ${ICON[verdict]} ${metric.padEnd(10)} uncovered ${before}${uncovered} (${fmtDelta(delta)})` +
        `   total ${totalBefore}${total}`,
    );
    cells.push(`${before}${uncovered} (${fmtDelta(delta)}) ${ICON[verdict]}`);
  }
  md.push(`| ${row.name} | ${cells.join(" | ")} |`);
}

console.log(
  "\nGlobal (net change in uncovered items across all compared projects, incl. new):",
);
for (const metric of METRICS) {
  console.log(`  ${metric.padEnd(10)} ${fmtDelta(globalDelta[metric])}`);
}
md.push(
  `| **Global (net Δ)** | ${METRICS.map((m) => `**${fmtDelta(globalDelta[m])}**`).join(" | ")} |`,
);

const offsetRows = rows.flatMap((row) =>
  METRICS.filter(
    (m) =>
      row.base &&
      uncoveredDelta(row, m) > tolerance &&
      globalDelta[m] <= tolerance,
  ).map((m) => `${row.name} (${m})`),
);
if (offsetRows.length > 0) {
  console.log(
    `\n♻️  Per-project regressions waived because the global net change did not increase: ${offsetRows.join(", ")}`,
  );
}
if (baseOnly.length > 0) {
  console.log(
    `\n⚠️  In baseline but not in PR (removed, renamed, or coverage script dropped?): ${baseOnly.join(", ")}`,
  );
  md.push("", `⚠️ In baseline but not in PR: ${baseOnly.join(", ")}`);
}

console.log(
  failed ? "\n❌ Coverage regression detected" : "\n✅ No coverage regression",
);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md.join("\n")}\n`);
}

process.exit(failed ? 1 : 0);
