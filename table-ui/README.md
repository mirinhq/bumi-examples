# bumidb table UI example

A minimal Next.js app that:

1. Talks to bumi's management API from server routes (using a project API key) to **list/create tenants** and **mint per-page session tokens**.
2. Renders the headless `<Table>` from `@bumidb/react` against a live session in `/editor/[tenantId]`.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mirinhq/bumi-examples/table-ui)

## Layout

```
app/
  api/
    tenants/route.ts      # GET (list) + POST (create) — uses @bumidb/admin
    sessions/route.ts     # POST — mints a session token for a tenant
  editor/[tenantId]/
    page.tsx              # server: forwards tenantId to <Editor>
  page.tsx                # home: list/create tenants
  layout.tsx              # imports @bumidb/react/styles.css

components/
  TenantsList.tsx         # client: form + tenant list + link to editor
  Editor.tsx              # client: createSession → BumiClient → BumiProvider → <Table>

lib/
  admin.ts                # singleton BumiAdmin (server-only)
```

## The flow at a glance

1. **Home** (`app/page.tsx`) — calls `GET /api/tenants`, lists them, "Create" form `POST`s to the same route.
2. **Editor** (`app/editor/[tenantId]/page.tsx`) — when mounted, the client calls `POST /api/sessions { tenant_id }`, gets back a short-lived session token, news up a `BumiClient`, and wraps the tree in `<BumiProvider client={...}>`.
3. **Inside the provider** — `useBumiTables()` for the schema list, `useTableActions(activeTableId)` for `addRow` / `addColumn`, and `<Table tableId={...} />` for the grid itself.

## Run

```bash
cp .env.local.example .env.local
# fill BUMI_API_KEY from the bumi dashboard

pnpm install
pnpm dev
# open http://localhost:5179
```
