import { Editor } from "@/components/Editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <Editor tenantId={tenantId} />;
}
