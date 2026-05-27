import { BumiAdmin } from "@bumidb/admin";

let admin: BumiAdmin | null = null;

export const getAdminClient = () => {
  if (admin != null) {
    return admin;
  }

  admin = new BumiAdmin({
    apiKey: process.env.BUMI_API_KEY ?? "",
  });

  return admin;
};
