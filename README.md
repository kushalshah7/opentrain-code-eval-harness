# AI Code Evaluation Harness

A compact, reproducible full-stack benchmark for evaluating AI-generated software changes.

This repository demonstrates the workflow behind high-quality coding evaluations:

1. define an unambiguous engineering task,
2. provide a correct reference implementation,
3. validate behavior through browser and API acceptance tests,
4. score submissions deterministically,
5. separate functional correctness from subjective code review.

The benchmark is intentionally small enough to audit end-to-end while still crossing the browser, frontend, API, validation, and application-state boundaries.

> Independent portfolio project. Not an OpenTrain product or official benchmark.

## Benchmark scenario

The sample task is a **Saved Views** feature for a lightweight operations dashboard.

A user can create a named view containing:

- a workflow status filter,
- zero or more tags.

The implementation must enforce the same contract in the UI and API, normalize user input consistently, and reject duplicate view names case-insensitively.

## Stack

- React + TypeScript
- Express + TypeScript
- Vite
- Playwright
- deterministic Node.js evaluator

## Repository layout

```text
.
├── task_spec.md              # candidate-facing specification
├── rubric.md                 # deterministic scoring contract
├── src/
│   ├── server.ts             # reference backend
│   ├── App.tsx               # reference frontend
│   └── main.tsx
├── tests/
│   └── saved-views.spec.ts   # browser + API acceptance tests
├── evaluator/
│   └── evaluate.mjs          # converts test results into a weighted score
└── .github/workflows/ci.yml
```

## Run locally

```bash
npm install
npx playwright install chromium
npm run evaluate
```

The evaluator starts the reference application through Playwright's `webServer` configuration, runs the acceptance suite, and prints a score out of 100.

## Why this benchmark is useful

The task is designed to catch common AI-generated implementation failures:

- UI validation that disagrees with backend validation,
- case-sensitive duplicate checks,
- incomplete whitespace normalization,
- tag duplication after normalization,
- invalid enum values accepted at the API boundary,
- failure to propagate backend errors to the user,
- implementations that only satisfy the happy path.

See [task_spec.md](./task_spec.md) for the exact contract and [rubric.md](./rubric.md) for the scoring model.
