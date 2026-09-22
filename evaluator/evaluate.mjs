import { spawnSync } from "node:child_process";

const categoryWeights = {
  api: 35,
  ui: 30,
  normalization: 25,
  edge: 10,
};

const run = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["playwright", "test", "--reporter=json"],
  { encoding: "utf8" },
);

if (!run.stdout.trim()) {
  process.stderr.write(run.stderr || "Playwright produced no JSON output.\n");
  process.exit(run.status ?? 1);
}

let report;
try {
  report = JSON.parse(run.stdout);
} catch {
  process.stderr.write("Could not parse Playwright JSON report.\n");
  process.stderr.write(run.stdout);
  process.exit(1);
}

const results = [];

function walkSuites(suites = []) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      const title = spec.title ?? "";
      const match = title.match(/^\[(api|ui|normalization|edge)\]/);
      if (!match) continue;

      const tests = spec.tests ?? [];
      const passed = tests.some((test) =>
        (test.results ?? []).some((result) => result.status === "passed"),
      );

      results.push({ category: match[1], title, passed });
    }

    walkSuites(suite.suites ?? []);
  }
}

walkSuites(report.suites);

let total = 0;
const summary = {};

for (const category of Object.keys(categoryWeights)) {
  const tests = results.filter((result) => result.category === category);
  const passed = tests.filter((result) => result.passed).length;
  const possible = categoryWeights[category];
  const earned = tests.length === 0 ? 0 : (passed / tests.length) * possible;

  total += earned;
  summary[category] = {
    passed,
    total: tests.length,
    earned: Number(earned.toFixed(1)),
    possible,
  };
}

console.log(JSON.stringify(
  {
    score: Number(total.toFixed(1)),
    outOf: 100,
    categories: summary,
    tests: results,
  },
  null,
  2,
));

process.exit(run.status ?? 0);
