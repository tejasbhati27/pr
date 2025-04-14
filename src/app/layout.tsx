// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from 'next/script'; // Import Script
import "./globals.css";
import { cn } from "@/lib/utils"; // Assuming you have this from shadcn/ui setup

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern LLM UI",
  description: "AI Features with Puter.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Add the Puter.js script here */}
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-hidden",
          inter.className // Apply font if using next/font
        )}
      >
        <main className="flex min-h-screen flex-col items-center justify-between p-4">
          {children}
        </main>
      </body>
    </html>
  );
}