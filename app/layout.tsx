import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stateless | Flow Writing App",
  description: "A minimalist writing app designed to force continuous typing and prevent writer's block.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        style={{
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
