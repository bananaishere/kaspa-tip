"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WALLET_EVENTS } from "@/components/wallet-connect"
import { sendKaspa, isValidKaspaAddress } from "@/lib/kasware"

// Define transaction status types
type TransactionStatus = "idle" | "validating" | "waiting" | "processing" | "success" | "error" | "pending"

const FEE_ADDRESS = "kaspa:qzqp7lkqwe06hnnywhdsem4jap6zqdtlya9jrdkc97294v2xju8rx3jm9tf6m"
const FEE_PERCENTAGE = 0.001 // 0.1%

export function SendForm() {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<TransactionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [txHash, setTxHash] = useState("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Check if wallet is connected on component mount and listen for connection events
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!window.kasware) {
        setIsWalletConnected(false)
        return
      }

      try {
        // Log available methods for debugging
        console.log("Available Kasware methods:", Object.keys(window.kasware))

        const accounts = window.kasware?.getAccounts ? await window.kasware.getAccounts() : []
        const isConnected = accounts && accounts.length > 0
        setIsWalletConnected(isConnected)
        if (isConnected) {
          setWalletAddress(accounts[0])
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
        setIsWalletConnected(false)
      }
    }

    checkWalletConnection()

    const handleWalletConnected = (event: CustomEvent) => {
      setIsWalletConnected(true)
      setWalletAddress(event.detail.address)
    }

    const handleWalletDisconnected = () => {
      setIsWalletConnected(false)
      setWalletAddress("")
    }

    const handleAccountsChanged = (event: CustomEvent) => {
      const accounts = event.detail.accounts
      setIsWalletConnected(accounts && accounts.length > 0)
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
      } else {
        setWalletAddress("")
      }
    }

    window.addEventListener(WALLET_EVENTS.CONNECTED, handleWalletConnected as EventListener)
    window.addEventListener(WALLET_EVENTS.DISCONNECTED, handleWalletDisconnected as EventListener)
    window.addEventListener(WALLET_EVENTS.ACCOUNTS_CHANGED, handleAccountsChanged as EventListener)

    return () => {
      window.removeEventListener(WALLET_EVENTS.CONNECTED, handleWalletConnected as EventListener)
      window.removeEventListener(WALLET_EVENTS.DISCONNECTED, handleWalletDisconnected as EventListener)
      window.removeEventListener(WALLET_EVENTS.ACCOUNTS_CHANGED, handleAccountsChanged as EventListener)
    }
  }, [])

  const validateForm = () => {
    if (!address) {
      setErrorMessage("Recipient address is required")
      return false
    }

    // Trim the address before validation
    const trimmedAddress = address.trim()

    if (!trimmedAddress.startsWith("kaspa:")) {
      setErrorMessage("Invalid address format. Kaspa addresses must start with 'kaspa:'")
      return false
    }

    if (!isValidKaspaAddress(trimmedAddress)) {
      setErrorMessage("Invalid Kaspa address format. Please check the address and try again.")
      return false
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setDebugInfo("")

    if (!isWalletConnected) {
      setStatus("error")
      setErrorMessage("Please connect your Kasware wallet first")
      return
    }

    setStatus("validating")
    if (!validateForm()) {
      setStatus("error")
      return
    }

    try {
      setStatus("waiting")

      if (!walletAddress) {
        throw new Error("No wallet address found. Please reconnect your wallet.")
      }

      // Trim the address
      const trimmedAddress = address.trim()

      // Parse amount as a number
      const amountValue = Number.parseFloat(amount)

      // Calculate fee amount (0.1%)
      const feeAmount = amountValue * FEE_PERCENTAGE

      // Log transaction details for debugging
      console.log("Transaction details:", {
        to: trimmedAddress,
        amount: amountValue,
        message: message.trim() || undefined,
        fee: feeAmount,
      })

      setDebugInfo(`Preparing to send ${amountValue} KAS to ${trimmedAddress}`)

      setStatus("processing")

      // Send the main transaction
      try {
        // Use the sendKaspa helper function from lib/kasware.ts
        const mainTxResult = await sendKaspa(trimmedAddress, amountValue, message.trim() || undefined)

        console.log("Main transaction result:", mainTxResult)

        // If main transaction succeeded, try to send the fee transaction
        try {
          console.log("Sending fee transaction")
          const feeResult = await sendKaspa(FEE_ADDRESS, feeAmount, "KaspaTip fee")
          console.log("Fee transaction result:", feeResult)
        } catch (feeError) {
          console.error("Fee transaction failed:", feeError)
          // Continue even if fee transaction fails
        }

        // Extract transaction hash
        let hash = ""
        if (typeof mainTxResult === "string") {
          hash = mainTxResult
        } else if (mainTxResult && typeof mainTxResult === "object") {
          hash = mainTxResult.hash || mainTxResult.txid || mainTxResult.transactionId || ""
        }

        if (!hash) {
          hash = "Transaction submitted (hash not returned)"
        }

        setTxHash(hash)
        setStatus("success")
        setDebugInfo(`Transaction successful! Hash: ${hash}`)

        // Reset form after success
        setTimeout(() => {
          setAddress("")
          setAmount("")
          setMessage("")
          setStatus("idle")
          setTxHash("")
          setDebugInfo("")
        }, 5000)
      } catch (txError: any) {
        console.error("Transaction error:", txError)

        // Handle specific error cases
        if (txError.message?.includes("Unexpected end of JSON input")) {
          setStatus("pending")
          setTxHash("Transaction may have been submitted (check your wallet)")
          setDebugInfo(
            "Transaction was sent but received an invalid response. Please check your wallet for confirmation.",
          )
          return
        }

        throw txError
      }
    } catch (error: any) {
      console.error("Error:", error)
      setStatus("error")
      setErrorMessage(error.message || "Transaction failed. Please try again.")
      setDebugInfo(`Error details: ${error.message}\nStack: ${error.stack || "No stack trace available"}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address" className="text-teal-700">
          Recipient Address
        </Label>
        <Input
          id="address"
          placeholder="kaspa:qr..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border-teal-200 focus-visible:ring-teal-500"
          disabled={status === "processing" || status === "waiting"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-teal-700">
          Amount (KAS)
        </Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="0.00000001"
            min="0.00000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-teal-200 focus-visible:ring-teal-500 pr-12"
            disabled={status === "processing" || status === "waiting"}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-teal-600">KAS</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-teal-700">
          Message (Optional)
        </Label>
        <Textarea
          id="message"
          placeholder="Add a message to the recipient..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-teal-200 focus-visible:ring-teal-500 resize-none"
          disabled={status === "processing" || status === "waiting"}
          rows={3}
        />
      </div>

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Transaction Successful!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Kaspa tokens have been sent successfully.
            {txHash && (
              <div className="mt-2">
                <span className="text-xs font-medium">Transaction ID:</span>
                <code className="block mt-1 text-xs bg-green-100 p-1 rounded overflow-x-auto">{txHash}</code>
              </div>
            )}
            {debugInfo && <div className="mt-2 text-xs text-green-600">{debugInfo}</div>}
          </AlertDescription>
        </Alert>
      )}

      {status === "pending" && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Transaction Submitted</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your transaction may have been submitted. Please check your wallet for confirmation.
            {txHash && (
              <div className="mt-2">
                <span className="text-xs font-medium">Status:</span>
                <code className="block mt-1 text-xs bg-yellow-100 p-1 rounded overflow-x-auto">{txHash}</code>
              </div>
            )}
            {debugInfo && <div className="mt-2 text-xs text-yellow-600">{debugInfo}</div>}
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage || "Please check the recipient address and amount."}
            {debugInfo && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Technical Details</summary>
                <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {(status === "processing" || status === "waiting") && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">
            {status === "waiting" ? "Waiting for confirmation..." : "Processing transaction..."}
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            {status === "waiting"
              ? "Please confirm the transaction in your Kasware wallet."
              : "Your transaction is being processed. Please wait..."}
          </AlertDescription>
        </Alert>
      )}

      {!isWalletConnected && (
        <Alert className="bg-amber-50 border-amber-200">
          <Wallet className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-amber-700">
            Please connect your Kasware wallet to send Kaspa tokens.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-teal-700 bg-teal-50 p-2 rounded border border-teal-100">
        <p>A 0.1% fee ({FEE_PERCENTAGE * 100}%) will be sent to support KaspaTip development.</p>
        <p>
          Amount:{" "}
          {amount
            ? `${Number.parseFloat(amount)} KAS + ${(Number.parseFloat(amount) * FEE_PERCENTAGE).toFixed(8)} KAS fee`
            : "0 KAS"}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        disabled={status === "processing" || status === "waiting" || !isWalletConnected}
      >
        {status === "processing" || status === "waiting" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status === "waiting" ? "Awaiting Confirmation" : "Processing..."}
          </span>
        ) : !isWalletConnected ? (
          "Connect Wallet to Send"
        ) : (
          "Send Kaspa"
        )}
      </Button>

      <p className="text-xs text-center text-teal-700">
        Transaction fees are calculated automatically based on network conditions.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 border-t pt-4 border-dashed border-teal-200">
          <details className="text-xs text-teal-700">
            <summary className="cursor-pointer font-medium">Developer Debug Tools</summary>
            <div className="mt-2 space-y-2">
              <div className="bg-teal-50 p-2 rounded">
                <p>These tools are only visible in development mode.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const { testKaswareConnection } = require("@/lib/test-utils")
                    testKaswareConnection()
                  }}
                >
                  Test Wallet Connection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={async () => {
                    if (!address) {
                      alert("Please enter a recipient address first")
                      return
                    }
                    try {
                      const { testKaswareTransaction } = require("@/lib/test-utils")
                      await testKaswareTransaction(address)
                      alert("Test transaction sent! Check console for details.")
                    } catch (error: any) {
                      alert(`Test failed: ${error.message || "Unknown error"}`)
                    }
                  }}
                >
                  Test Minimal Transaction
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (!address) {
                      alert("Please enter a recipient address first")
                      return
                    }
                    const { validateKaspaAddress } = require("@/lib/test-utils")
                    validateKaspaAddress(address)
                    alert("Address validation details logged to console")
                  }}
                >
                  Validate Address
                </Button>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <p className="font-medium">Wallet Status:</p>
                <p>Connected: {isWalletConnected ? "Yes" : "No"}</p>
                {walletAddress && <p>Address: {walletAddress}</p>}
              </div>
            </div>
          </details>
        </div>
      )}
    </form>
  )
}

