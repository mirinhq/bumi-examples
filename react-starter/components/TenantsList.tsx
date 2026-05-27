"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
};

export function TenantsList() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/tenants");
      const json = (await res.json()) as { tenants?: Tenant[]; error?: string };
      if (json.error) {
        setError(json.error);
        return;
      }
      setTenants(json.tenants ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const json = (await res.json()) as { error?: string };
      if (json.error) {
        setError(json.error);
        return;
      }
      setNewName("");
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  return (
    <section>
      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New database name"
          style={{ flex: 1, padding: "8px 10px", fontSize: 14 }}
        />
        <button type="submit" disabled={!newName.trim() || creating} style={{ padding: "8px 14px" }}>
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      {error && (
        <p style={{ color: "#b91c1c", fontSize: 13 }}>Error: {error}</p>
      )}

      {tenants == null ? (
        <p>Loading…</p>
      ) : tenants.length === 0 ? (
        <p>No databases yet — create one above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tenants.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <span>
                <strong>{t.name}</strong>{" "}
                <span style={{ color: "#6b7280", fontSize: 12 }}>
                  {t.slug ?? t.id.slice(0, 8)}
                </span>
              </span>
              <Link
                href={`/editor/${t.id}`}
                style={{
                  fontSize: 13,
                  padding: "6px 12px",
                  background: "#1f2937",
                  color: "#fff",
                  borderRadius: 4,
                  textDecoration: "none",
                }}
              >
                Open editor →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
