"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BumiClient } from "@bumidb/client";
import {
  BumiProvider,
  Table,
  useBumiClient,
  useBumiTables,
  useTableActions,
} from "@bumidb/react";

interface Props {
  tenantId: string;
}

export function Editor({ tenantId }: Props) {
  const [client, setClient] = useState<BumiClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let activeClient: BumiClient | null = null;

    (async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant_id: tenantId }),
        });
        const session = (await res.json()) as { token?: string; error?: string };
        if (session.error || !session.token) {
          throw new Error(session.error ?? "createSession returned no token");
        }
        if (cancelled) return;
        const c = new BumiClient({ sessionToken: session.token });
        activeClient = c;
        await c.ready();
        if (cancelled) return;
        setClient(c);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      activeClient?.destroy();
    };
  }, [tenantId]);

  if (error) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <Link href="/">← Back</Link>
        <h1>Failed to open</h1>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </main>
    );
  }

  if (!client) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <Link href="/">← Back</Link>
        <p>Connecting…</p>
      </main>
    );
  }

  return (
    <BumiProvider client={client}>
      <EditorInner />
    </BumiProvider>
  );
}

function EditorInner() {
  const client = useBumiClient();
  const tables = useBumiTables();
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const actions = useTableActions(activeTableId);

  useEffect(() => {
    if (!tables) return;
    if (activeTableId && tables.some((t) => t.id === activeTableId)) return;
    setActiveTableId(tables[0]?.id ?? null);
  }, [tables, activeTableId]);

  async function onCreateTable() {
    try {
      await client.createTable({ name: `Table ${Date.now()}` });
    } catch (err) {
      console.error("createTable failed", err);
    }
  }

  async function onAddColumn() {
    if (!activeTableId) return;
    const name = window.prompt("Column name?", "new_column");
    if (!name) return;
    try {
      await actions.addColumn({
        name,
        nullable: true,
        definition: { type: "text" },
      });
    } catch (err) {
      console.error("addColumn failed", err);
    }
  }

  async function onAddRow() {
    if (!activeTableId) return;
    try {
      await actions.addRow();
    } catch (err) {
      console.error("addRow failed", err);
    }
  }

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Link href="/" style={{ fontSize: 13, color: "#374151" }}>
          ← Back
        </Link>

        <div style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto" }}>
          {tables?.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTableId(t.id)}
              style={{
                padding: "4px 12px",
                background: activeTableId === t.id ? "#1f2937" : "transparent",
                color: activeTableId === t.id ? "#fff" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {t.name}
            </button>
          ))}
          <button
            onClick={onCreateTable}
            style={{
              padding: "4px 10px",
              border: "1px dashed #9ca3af",
              borderRadius: 4,
              background: "transparent",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Table
          </button>
        </div>

        {activeTableId && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onAddColumn} style={{ padding: "4px 10px", fontSize: 13 }}>
              + Column
            </button>
            <button onClick={onAddRow} style={{ padding: "4px 10px", fontSize: 13 }}>
              + Row
            </button>
          </div>
        )}
      </header>

      <section style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {tables == null ? (
          <Centered>Loading schema…</Centered>
        ) : tables.length === 0 ? (
          <Centered>
            <p>No tables yet.</p>
            <button onClick={onCreateTable}>Create your first table</button>
          </Centered>
        ) : activeTableId == null ? (
          <Centered>No table selected.</Centered>
        ) : (
          <Table tableId={activeTableId} />
        )}
      </section>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
      }}
    >
      {children}
    </div>
  );
}
