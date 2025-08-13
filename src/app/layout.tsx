import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starweaver Productivity Dashboard",
  description: "Productivity dashboard for video editors and content creators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
