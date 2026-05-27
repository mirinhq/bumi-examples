import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkg = (name, sub) => path.resolve(__dirname, "node_modules", name, sub);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  // Skip Next's build-time type check. We're aliasing @bumidb/* to their
  // built dist/, but tsc still resolves types via the in-tree
  // `types: "./src/index.ts"`, which references source files that aren't
  // in a `file:` install. Runtime is unaffected. Run `pnpm tsc --noEmit`
  // separately if you want stricter checking.
  typescript: { ignoreBuildErrors: true },
  // The browser Turso wasm uses SharedArrayBuffer for its worker thread
  // manager, which the browser only exposes when the page is
  // crossOriginIsolated. That requires COOP=same-origin + COEP=require-corp
  // on the document response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
