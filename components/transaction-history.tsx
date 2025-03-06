"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy } from "lucide-react"

// Mock transaction data
const mockTransactions = [
  {
    id: "tx_7f9e2d1a3b5c8d7e",
    recipient: "kaspa:qr3f5x...",
    amount: "125.5",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    status: "completed",
  },
  {
    id: "tx_2c4d6e8f1a3b5c7d",
    recipient: "kaspa:qz8g7y...",
    amount: "50",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: "completed",
  },
  {
    id: "tx_9a8b7c6d5e4f3g2h",
    recipient: "kaspa:qp5j2k...",
    amount: "10.75",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "completed",
  },
  {
    id: "tx_1h2g3f4e5d6c7b8a",
    recipient: "kaspa:qm3n4p...",
    amount: "200",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "completed",
  },
]

export function TransactionHistory() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-4">
      {mockTransactions.length === 0 ? (
        <p className="text-center text-teal-600 py-4">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="rounded-lg border border-teal-100 bg-teal-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <span className="font-medium text-teal-800">{tx.amount} KAS</span>
                </div>
                <span className="text-xs text-teal-600">{formatTime(tx.timestamp)}</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-teal-700 truncate max-w-[150px]">To: {tx.recipient}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-teal-600 hover:text-teal-800 hover:bg-teal-100"
                  onClick={() => copyToClipboard(tx.id)}
                >
                  {copiedId === tx.id ? (
                    <span className="flex items-center gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs">
                      <Copy className="h-3 w-3" /> {tx.id.substring(0, 8)}...
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800">
        View All Transactions
      </Button>
    </div>
  )
}

