import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, TextIcon as Telegram, DiscIcon as Discord } from "lucide-react"

export const metadata: Metadata = {
  title: "About KaspaTip",
  description: "Learn more about KaspaTip, a simple and secure way to send Kaspa tokens",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-teal-500">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <header className="mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-teal-100">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </header>

        <main>
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-teal-800 mb-4 md:mb-6">About KaspaTip</h1>

              <div className="prose prose-teal max-w-none">
                <p className="text-base md:text-lg mb-4">
                  KaspaTip is a simple, user-friendly web application designed to make sending Kaspa tokens easy and
                  secure. Built with the Kasware wallet integration, it allows anyone to quickly send KAS to any Kaspa
                  address.
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 mt-5 md:mt-6 mb-2 md:mb-3">
                  Project Goals
                </h2>
                <p>
                  The main goal of KaspaTip is to simplify the process of sending Kaspa tokens. Whether you want to tip
                  content creators, pay for services, or send funds to friends and family, KaspaTip provides a
                  straightforward interface that makes transactions quick and hassle-free.
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 mt-5 md:mt-6 mb-2 md:mb-3">Features</h2>
                <ul className="list-disc pl-5 space-y-1 md:space-y-2">
                  <li>Simple and intuitive user interface</li>
                  <li>Direct integration with Kasware wallet</li>
                  <li>Secure transaction processing</li>
                  <li>Optional message attachment with transactions</li>
                  <li>Transaction history tracking</li>
                  <li>Mobile-friendly design</li>
                </ul>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 mt-5 md:mt-6 mb-2 md:mb-3">
                  About Kaspa
                </h2>
                <p>
                  Kaspa is a proof-of-work cryptocurrency that implements the GHOSTDAG protocol, a generalization of the
                  Nakamoto consensus. It's designed to be fast, secure, and scalable, with block times of just 1 second.
                </p>
                <p className="mt-2">
                  To learn more about Kaspa, visit the{" "}
                  <a
                    href="https://kaspa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 underline"
                  >
                    official Kaspa website
                  </a>
                  .
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 mt-5 md:mt-6 mb-2 md:mb-3">
                  Kasware Wallet
                </h2>
                <p>
                  KaspaTip integrates with Kasware, a browser extension wallet for Kaspa. To use KaspaTip, you'll need
                  to install the Kasware wallet extension.
                </p>
                <p className="mt-2">
                  You can download Kasware from the{" "}
                  <a
                    href="https://www.kasware.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 underline"
                  >
                    Kasware website
                  </a>
                  .
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 mt-5 md:mt-6 mb-2 md:mb-3">
                  Contact & Support
                </h2>
                <p>
                  If you have any questions, suggestions, or need help with KaspaTip, feel free to reach out through the
                  following channels:
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <a
                    href="https://t.me/hereisbanana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#0088cc] text-white px-4 py-2 rounded-lg hover:bg-[#0077b5] transition-colors"
                  >
                    <Telegram className="h-5 w-5" />
                    <span>Telegram Support</span>
                  </a>

                  <a
                    href="https://discord.gg/DRjDD7nAfP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#5865F2] text-white px-4 py-2 rounded-lg hover:bg-[#4752c4] transition-colors"
                  >
                    <Discord className="h-5 w-5" />
                    <span>Discord Community</span>
                  </a>
                </div>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 mt-5 md:mt-6 mb-2 md:mb-3">Disclaimer</h2>
                <p className="text-sm text-gray-600">
                  KaspaTip is an independent project and is not officially affiliated with Kaspa or Kasware. Always
                  verify transaction details before sending funds. The developer is not responsible for any loss of
                  funds due to user error or technical issues beyond our control.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 md:mt-12 text-center text-sm text-teal-100">
          <p>KaspaTip - Send Kaspa tokens easily and securely</p>
          <p className="mt-1">© {new Date().getFullYear()} KaspaTip. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

