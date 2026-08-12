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
  // Allow user pinch-zoom on the page for accessibility.
  // The editor canvas has touch-action: none so its pinch is still captured.
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "HH Goa 2026 PFP Generator",
  description:
    "Create your Hacker House Goa 2026 profile picture and share your builder identity. Upload a photo, get a branded PFP in seconds.",
  keywords: [
    "Hacker House Goa",
    "HH Goa 2026",
    "PFP",
    "frame",
    "builder",
    "developer",
    "FrameGoa",
  ],
  authors: [{ name: "Hacker House Goa 2026" }],
  openGraph: {
    title: "HH Goa 2026 PFP Generator",
    description:
      "Create your Hacker House Goa 2026 profile picture. Upload → Frame → Share.",
    type: "website",
    locale: "en_US",
    siteName: "HH Goa 2026 PFP",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 PFP Generator",
    description:
      "Create your Hacker House Goa 2026 profile picture. Upload → Frame → Share.",
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