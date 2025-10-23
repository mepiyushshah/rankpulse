import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RankPulse - AI SEO Content Automation",
  description: "Pulse Your Content to the Top",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
