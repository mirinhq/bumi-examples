import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { tenant_id?: string };
  if (!body.tenant_id) {
    return NextResponse.json({ error: "tenant_id is required" }, { status: 400 });
  }
  const admin = getAdminClient();
  const res = await admin.createSession({ tenant_id: body.tenant_id });
  return NextResponse.json(res.data);
}
