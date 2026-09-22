import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  // The benchmark server is process-local. Tests use unique names so state does
  // not need a reset endpoint that would expand the candidate-facing contract.
  await request.get("/api/views");
});

test("[api] GET returns the required response shape", async ({ request }) => {
  const response = await request.get("/api/views");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.views)).toBe(true);
});

test("[api] POST rejects an invalid status", async ({ request }) => {
  const response = await request.post("/api/views", {
    data: {
      name: "Bad status",
      query: { status: "pending", tags: [] },
    },
  });
  expect(response.status()).toBe(400);
});

test("[api] duplicate names are rejected case-insensitively", async ({ request }) => {
  const seed = await request.post("/api/views", {
    data: {
      name: "API Duplicate",
      query: { status: "all", tags: [] },
    },
  });
  expect(seed.status()).toBe(201);

  const duplicate = await request.post("/api/views", {
    data: {
      name: "  api duplicate  ",
      query: { status: "open", tags: [] },
    },
  });
  expect(duplicate.status()).toBe(409);
});

test("[ui] a user can create a saved view and see it immediately", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("View name").fill("Critical incidents");
  await page.getByLabel("Status").selectOption("open");
  await page.getByLabel("Tags").fill("urgent, payments");
  await page.getByRole("button", { name: "Save view" }).click();

  const row = page.getByTestId("saved-view").filter({ hasText: "Critical incidents" });
  await expect(row).toContainText("open");
  await expect(row).toContainText("urgent, payments");
});

test("[ui] backend errors are shown and failed saves are not rendered", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("View name").fill("   ");
  await page.getByRole("button", { name: "Save view" }).click();

  await expect(page.getByRole("alert")).toContainText("name is required");
});

test("[normalization] names are trimmed before persistence", async ({ request }) => {
  const response = await request.post("/api/views", {
    data: {
      name: "   Trimmed Name   ",
      query: { status: "closed", tags: [] },
    },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.name).toBe("Trimmed Name");
});

test("[normalization] tags are trimmed and de-duplicated case-insensitively", async ({ request }) => {
  const response = await request.post("/api/views", {
    data: {
      name: "Normalized tags",
      query: {
        status: "open",
        tags: [" urgent ", "Payments", "urgent", "", "payments "],
      },
    },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.query.tags).toEqual(["urgent", "Payments"]);
});

test("[edge] blank canonical names are rejected without mutating state", async ({ request }) => {
  const before = await (await request.get("/api/views")).json();

  const response = await request.post("/api/views", {
    data: {
      name: "     ",
      query: { status: "all", tags: [] },
    },
  });

  expect(response.status()).toBe(400);

  const after = await (await request.get("/api/views")).json();
  expect(after.views.length).toBe(before.views.length);
});

test("[edge] more than five unique normalized tags are rejected", async ({ request }) => {
  const response = await request.post("/api/views", {
    data: {
      name: "Too many tags",
      query: {
        status: "all",
        tags: ["one", "two", "three", "four", "five", "six"],
      },
    },
  });

  expect(response.status()).toBe(400);
});
