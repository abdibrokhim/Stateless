import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stateless | Flow Writing App",
  description: "A minimalist writing app designed to force continuous typing and prevent writer's block.",
  metadataBase: new URL("https://yaps.chat"),
  keywords: ["ai builder", "youtube creator", "open-source builder", "open-source"],
  
  alternates: {
    canonical: "/",
  },

  authors: [
    {
      name: "Ibrohim Abdivokhidov",
      url: "https://github.com/abdibrokhim",
    },
  ],

  openGraph: {
    title: "Stateless | Flow Writing App",
    description: "A minimalist writing app designed to force continuous typing and prevent writer's block.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/stateless.png",
        width: 1200,
        height: 630,
        alt: "Yaps Official Logo",
      },
    ],
  },
  
  icons: {
    icon: '/favicon.ico',
  },

  twitter: {
    card: 'summary_large_image',
    title: "Stateless | Flow Writing App",
    description: "A minimalist writing app designed to force continuous typing and prevent writer's block.",
    images: ['/stateless.png'],
    site: '@abdibrokhim',
    creator: '@abdibrokhim',
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },

  appleWebApp: {
    title: 'abee',
    statusBarStyle: 'black-translucent',
  },
  
  appLinks: {
    web: {
      url: 'https://yaps.chat',
      should_fallback: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased overflow-x-hidden`}
        style={{
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
