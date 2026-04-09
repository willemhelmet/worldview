import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorldView — AI Depth to 3D World",
  description:
    "Transform any photo into an interactive 3D world using AI depth estimation. Built by the studio at the intersection of World Models and XR.",
  openGraph: {
    title: "WorldView — AI Depth to 3D World",
    description: "Transform any photo into an interactive 3D world using AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
