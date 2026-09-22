import { FormEvent, useEffect, useState } from "react";

type SavedView = {
  id: string;
  name: string;
  query: {
    status: "all" | "open" | "closed";
    tags: string[];
  };
};

export function App() {
  const [views, setViews] = useState<SavedView[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<SavedView["query"]["status"]>("all");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/views")
      .then((response) => response.json())
      .then((data) => setViews(data.views));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        query: {
          status,
          tags: tags.split(","),
        },
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to save view");
      return;
    }

    setViews((current) => [...current, body]);
    setName("");
    setStatus("all");
    setTags("");
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Saved Views</h1>

      <form onSubmit={submit} aria-label="create saved view">
        <label>
          Name
          <input
            aria-label="View name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          Status
          <select
            aria-label="Status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SavedView["query"]["status"])
            }
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <label>
          Tags
          <input
            aria-label="Tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="urgent, payments"
          />
        </label>

        <button type="submit">Save view</button>
      </form>

      {error && <p role="alert">{error}</p>}

      <section aria-label="saved views">
        <h2>Views</h2>
        {views.length === 0 ? (
          <p>No saved views</p>
        ) : (
          <ul>
            {views.map((view) => (
              <li key={view.id} data-testid="saved-view">
                <strong>{view.name}</strong>
                <span> · {view.query.status}</span>
                {view.query.tags.length > 0 && (
                  <span> · {view.query.tags.join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
