import express from "express";
import { randomUUID } from "node:crypto";

type Status = "all" | "open" | "closed";

type SavedView = {
  id: string;
  name: string;
  query: {
    status: Status;
    tags: string[];
  };
};

const app = express();
app.use(express.json());

const views: SavedView[] = [];
const validStatuses = new Set<Status>(["all", "open", "closed"]);

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string")) {
    throw new Error("query.tags must be an array of strings");
  }

  const result: string[] = [];
  const seen = new Set<string>();

  for (const rawTag of value) {
    const tag = rawTag.trim();
    if (!tag) continue;

    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(tag);
  }

  if (result.length > 5) {
    throw new Error("a saved view may contain at most 5 unique tags");
  }

  return result;
}

app.get("/api/views", (_req, res) => {
  res.status(200).json({ views });
});

app.post("/api/views", (req, res) => {
  const rawName = req.body?.name;
  const rawQuery = req.body?.query;

  if (typeof rawName !== "string") {
    return res.status(400).json({ error: "name must be a string" });
  }

  const name = rawName.trim();
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  if (name.length > 40) {
    return res.status(400).json({ error: "name must be 40 characters or fewer" });
  }

  const duplicate = views.some(
    (view) => view.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (duplicate) {
    return res.status(409).json({ error: "a saved view with this name already exists" });
  }

  if (!rawQuery || typeof rawQuery !== "object") {
    return res.status(400).json({ error: "query is required" });
  }

  const status = rawQuery.status;
  if (typeof status !== "string" || !validStatuses.has(status as Status)) {
    return res.status(400).json({ error: "query.status must be all, open, or closed" });
  }

  let tags: string[];
  try {
    tags = normalizeTags(rawQuery.tags);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "invalid tags",
    });
  }

  const view: SavedView = {
    id: randomUUID(),
    name,
    query: {
      status: status as Status,
      tags,
    },
  };

  views.push(view);
  return res.status(201).json(view);
});

app.listen(3001, "127.0.0.1", () => {
  console.log("API listening on http://127.0.0.1:3001");
});
