import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starweaver Productivity API",
  description: "Backend API for productivity management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
