import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { JsonLd } from "@/components/json-ld"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "KaspaTip - Send Kaspa tokens easily and securely",
    template: "%s | KaspaTip",
  },
  description: "A simple and secure way to send Kaspa tokens to anyone with the Kasware wallet",
  keywords: ["Kaspa", "KAS", "cryptocurrency", "wallet", "blockchain", "token", "transfer", "tip", "Kasware"],
  authors: [{ name: "BananaBOX", url: "https://github.com/bananaishere" }],
  creator: "BananaBOX",
  publisher: "BananaBOX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kaspa-tip.vercel.app/",
    title: "KaspaTip - Send Kaspa tokens easily and securely",
    description: "A simple and secure way to send Kaspa tokens to anyone with the Kasware wallet",
    siteName: "KaspaTip",
    images: [
      {
        url: "https://kaspa-tip.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "KaspaTip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KaspaTip - Send Kaspa tokens easily and securely",
    description: "A simple and secure way to send Kaspa tokens to anyone with the Kasware wallet",
    images: ["https://kaspa-tip.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JsonLd />
        {children}
      </body>
    </html>
  )
}

