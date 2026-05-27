import type { ReactNode } from "react";
import "@bumidb/react/styles.css";

export const metadata = {
  title: "bumidb table UI example",
  description: "Renders @bumidb/react's <Table> against a live bumi session.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
