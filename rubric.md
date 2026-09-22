# Evaluation Rubric

The score is generated from acceptance tests. Every scored requirement is observable and deterministic.

| Category | Weight | What it checks |
|---|---:|---|
| API contract | 35 | response shape, status codes, enum validation, duplicate handling |
| UI workflow | 30 | browser creation flow, immediate rendering, visible server errors |
| Normalization | 25 | whitespace, case-insensitive duplicates, tag cleanup and de-duplication |
| Edge cases | 10 | blank names, tag limit, invalid input does not mutate state |
| **Total** | **100** | |

## Test-to-score mapping

Test titles contain a category prefix:

- `[api]` → API contract
- `[ui]` → UI workflow
- `[normalization]` → normalization
- `[edge]` → edge cases

A category's points are divided equally across its tests. Failed tests receive zero for that test. The evaluator rounds the final result to one decimal place.

## Review notes

The numeric score intentionally measures behavior only. A human reviewer may separately comment on:

- readability,
- decomposition,
- security,
- performance,
- maintainability.

Those comments do not change the deterministic score in this demonstration benchmark.
