import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/admin";

export async function GET() {
  const admin = getAdminClient();
  const res = await admin.listTenants();
  return NextResponse.json(res.data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string; slug?: string };
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const admin = getAdminClient();
  const res = await admin.createTenant({ name: body.name, slug: body.slug });
  return NextResponse.json(res.data);
}
