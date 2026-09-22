# Task Specification — Saved Views

## Context

You are working on a lightweight operations dashboard. Users repeatedly apply the same filters, so the product needs a **Saved Views** feature.

Implement the feature so that behavior is consistent across the browser UI and HTTP API.

## Functional requirements

### 1. Create a saved view

A saved view has this shape:

```ts
type SavedView = {
  id: string;
  name: string;
  query: {
    status: "all" | "open" | "closed";
    tags: string[];
  };
};
```

The UI must let a user enter:

- a view name,
- a status,
- a comma-separated tag list.

After a successful save, the new view must appear in the list without a page reload.

### 2. Name validation

The canonical name is `name.trim()`.

A valid name:

- is not empty after trimming,
- is at most 40 characters after trimming.

Duplicate names are not allowed. Duplicate comparison must be:

- case-insensitive,
- based on the trimmed canonical name.

Example: `" Incidents "` and `"incidents"` are duplicates.

### 3. Status validation

The only valid status values are:

- `all`
- `open`
- `closed`

The API must return HTTP 400 for any other value.

### 4. Tag normalization

The UI sends tags as a comma-separated string.

Before persistence, tags must be:

1. split on commas,
2. trimmed,
3. empty values removed,
4. de-duplicated case-insensitively while preserving the first spelling,
5. limited to at most 5 unique tags.

If more than 5 unique tags remain after normalization, the API must return HTTP 400.

Example:

```text
" urgent, Payments, urgent, , payments "
```

must become:

```json
["urgent", "Payments"]
```

### 5. HTTP contract

#### GET /api/views

Returns:

```json
{ "views": [] }
```

with HTTP 200.

#### POST /api/views

Request:

```json
{
  "name": "Incidents",
  "query": {
    "status": "open",
    "tags": ["urgent"]
  }
}
```

Success:

- HTTP 201
- body contains the created saved view

Errors:

- 400 for invalid name, status, tag shape, or too many tags
- 409 for a duplicate canonical name

### 6. Error feedback

If a save fails, the browser must display the API error message and must not add a view to the rendered list.

## Non-goals

Do not add:

- authentication,
- a database,
- pagination,
- editing or deletion,
- styling frameworks.

The goal is contract correctness and robust validation, not feature breadth.

## Acceptance standard

A correct solution should pass the repository's deterministic Playwright suite without modifying the tests or evaluator.
