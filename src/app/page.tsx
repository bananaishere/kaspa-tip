"use client"

import { SendForm } from "@/components/send-form"
import { WalletConnect } from "@/components/wallet-connect"
import { ArrowUpRight, Info, TextIcon as Telegram, DiscIcon as Discord, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-teal-500">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Desktop Header */}
        <header className="mb-8 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white p-1.5">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-color-a6gTLOtFUkyTfto7nuemX26goOL0VS.png"
                alt="Kaspa Logo"
                width={24}
                height={24}
                className="h-6 w-6"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">KaspaTip</h1>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect />
            <Link
              href="/about"
              className="flex items-center gap-1 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link
              href="https://kaspa.org"
              target="_blank"
              className="flex items-center gap-1 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              About Kaspa
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="mb-6 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white p-1.5">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-color-a6gTLOtFUkyTfto7nuemX26goOL0VS.png"
                  alt="Kaspa Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold text-white">KaspaTip</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 bg-teal-600 rounded-lg p-4 flex flex-col gap-3">
              <WalletConnect />
              <Link
                href="/about"
                className="flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
              <Link
                href="https://kaspa.org"
                target="_blank"
                className="flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Kaspa
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </header>

        <main className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-xl bg-white p-4 md:p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-teal-800">Send Kaspa</h2>
              <SendForm />
            </div>
          </div>
        </main>

        <footer className="mt-8 md:mt-12 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <a
              href="https://t.me/hereisbanana"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full text-[#0088cc] hover:bg-teal-50 transition-colors"
              aria-label="Telegram Support"
            >
              <Telegram className="h-6 w-6" />
            </a>
            <a
              href="https://discord.gg/DRjDD7nAfP"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full text-[#5865F2] hover:bg-teal-50 transition-colors"
              aria-label="Discord Community"
            >
              <Discord className="h-6 w-6" />
            </a>
          </div>
          <p className="text-sm text-teal-100">KaspaTip - Send Kaspa tokens easily and securely</p>
          <p className="mt-1 text-sm text-teal-100">© {new Date().getFullYear()} KaspaTip. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

