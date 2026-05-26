import type { ReactNode } from "react";

export const metadata = {
  title: "bumidb example",
  description: "Demonstrates @bumidb/admin (server) + @bumidb/client (browser)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: 24,
          maxWidth: 960,
          marginInline: "auto",
        }}
      >
        {children}
      </body>
    </html>
  );
}
