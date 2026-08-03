import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "./providers";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlantiD — Instant plant ID & health diagnostics",
  description:
    "Upload a photo, get expert-level plant identification and disease diagnosis in seconds.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E2" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1712" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <ThemeScript />
        </head>
        <body suppressHydrationWarning>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
