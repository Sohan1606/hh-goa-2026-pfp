import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hh-goa-2026-pfp.vercel.app"),
  title: "HH Goa 2026 PFP & Builder ID Generator",
  description:
    "Create your Hacker House Goa 2026 PFP, Builder ID, or Team frame. One generator, three modes. Instant PNG. Share to X with #FrameInGoa.",
  keywords: [
    "Hacker House Goa",
    "HH Goa 2026",
    "PFP",
    "Builder ID",
    "Team frame",
    "FrameInGoa",
    "FrameGoa",
  ],
  authors: [{ name: "Hacker House Goa 2026" }],
  openGraph: {
    title: "HH Goa 2026 PFP & Builder ID Generator",
    description:
      "Create your HH Goa 2026 PFP, Builder ID, or Team frame. Upload → Generate → Share.",
    type: "website",
    locale: "en_US",
    siteName: "HH Goa 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 PFP & Builder ID Generator",
    description:
      "Create your HH Goa 2026 PFP, Builder ID, or Team frame. Upload → Generate → Share.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className={`${inter.variable} font-sans bg-zinc-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}