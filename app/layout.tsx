import type { Metadata } from "next";
import "../src/styles.css";

export const metadata: Metadata = {
  title: "GapFinder AI — Study smarter",
  description: "Turn your learning materials into a clearer picture of what you know and what to focus on next.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
