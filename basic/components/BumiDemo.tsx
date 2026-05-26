"use client";

import { useEffect, useState } from "react";
import { BumiClient } from "@bumidb/client";

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
};

type LogEntry = { ts: string; label: string; value: unknown };

export default function BumiDemo() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeClient, setActiveClient] = useState<BumiClient | null>(null);
  const [activeTenant, setActiveTenant] = useState<string | null>(null);

  const log = (label: string, value: unknown) =>
    setLogs((prev) => [{ ts: new Date().toISOString(), label, value }, ...prev]);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/tenants");
      const json = (await res.json()) as { tenants: Tenant[] };
      setTenants(json.tenants ?? []);
    } catch (err) {
      log("listTenants error", String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onCreate() {
    if (!newName.trim()) return;
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const json = await res.json();
    log("createTenant", json);
    setNewName("");
    await refresh();
  }

  async function onConnect(tenantId: string) {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
    const session = (await res.json()) as { token?: string; error?: string };
    if (!session.token) {
      log("createSession error", session);
      return;
    }
    log("createSession", { tenant_id: tenantId, expires_at: (session as { expires_at?: string }).expires_at });

    const client = new BumiClient({ sessionToken: session.token });
    client.subscribe((event) => log("commit", { source: event.source, ops: event.ops.length }));

    try {
      await client.ready();
      const tables = await client.listTables();
      log("listTables", tables.map((t) => ({ id: t.id, name: t.name })));
      setActiveClient(client);
      setActiveTenant(tenantId);
    } catch (err) {
      log("client error", err instanceof Error ? err.message : String(err));
    }
  }

  async function onCreateTable() {
    if (!activeClient) return;
    const name = `demo_${Date.now()}`;
    try {
      const tableId = await activeClient.createTable({ name });
      log("createTable", { id: tableId, name });
    } catch (err) {
      log("createTable error", err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main>
      <h1>bumidb example</h1>
      <p>
        Server routes use <code>@bumidb/admin</code>; the client widget below uses{" "}
        <code>@bumidb/client</code>.
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>Tenants</h2>
        <button onClick={refresh} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
        <ul>
          {tenants.map((t) => (
            <li key={t.id}>
              <strong>{t.name}</strong> ({t.slug ?? t.id.slice(0, 8)}){" "}
              <button onClick={() => onConnect(t.id)}>Connect</button>
              {activeTenant === t.id && <span> ← active</span>}
            </li>
          ))}
          {tenants.length === 0 && !loading && <li>(no tenants yet)</li>}
        </ul>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="new tenant name"
          />
          <button onClick={onCreate} disabled={!newName.trim()}>
            Create tenant
          </button>
        </div>
      </section>

      {activeClient && (
        <section style={{ marginTop: 24 }}>
          <h2>Client actions ({activeTenant?.slice(0, 8)})</h2>
          <button onClick={onCreateTable}>Create demo table</button>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Log</h2>
        <pre
          style={{
            background: "#111",
            color: "#eee",
            padding: 12,
            borderRadius: 4,
            maxHeight: 400,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {logs.length === 0
            ? "(empty)"
            : logs
                .map((l) => `[${l.ts}] ${l.label}\n${JSON.stringify(l.value, null, 2)}`)
                .join("\n\n")}
        </pre>
      </section>
    </main>
  );
}
