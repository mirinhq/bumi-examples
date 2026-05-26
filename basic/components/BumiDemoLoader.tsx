"use client";

import dynamic from "next/dynamic";

const BumiDemo = dynamic(() => import("./BumiDemo"), { ssr: false });

export function BumiDemoLoader() {
  return <BumiDemo />;
}
