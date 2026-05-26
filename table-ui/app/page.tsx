import { TenantsList } from "@/components/TenantsList";

export default function Page() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>Databases</h1>
      <p>
        Each &ldquo;database&rdquo; below is a bumi tenant. Create one with the form,
        then open the editor to see <code>&lt;Table&gt;</code> from <code>@bumidb/react</code>{" "}
        in action.
      </p>
      <TenantsList />
    </main>
  );
}
