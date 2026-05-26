import { BumiAdmin } from "@bumidb/admin";

let cached: BumiAdmin | null = null;

export function getAdminClient(): BumiAdmin {
  if (cached) return cached;
  const apiKey = process.env.BUMI_API_KEY;
  if (!apiKey) {
    throw new Error("BUMI_API_KEY env var is required for the admin API routes");
  }
  cached = new BumiAdmin({ apiKey });
  return cached;
}
