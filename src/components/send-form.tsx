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

        const accounts = await window.kasware.getAccounts()
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

    if (!address.startsWith("kaspa:")) {
      setErrorMessage("Invalid Kaspa address format")
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

      // Parse amount as a number with fixed precision to avoid floating point issues
      const amountInKas = Number.parseFloat(Number.parseFloat(amount).toFixed(8))

      // Calculate the fee amount (0.1%)
      const feeAmount = Number.parseFloat((amountInKas * FEE_PERCENTAGE).toFixed(8))

      // Log all available methods for debugging
      console.log("All Kasware methods:", Object.keys(window.kasware).join(", "))
      console.log("Transaction amount:", amountInKas, "Fee amount:", feeAmount)

      setStatus("processing")

      // Check if sendKaspa method exists
      if (typeof window.kasware.sendKaspa !== "function") {
        throw new Error("The wallet doesn't support the required sendKaspa method.")
      }

      // First, try to send the main transaction
      console.log("Sending main transaction with amount:", amountInKas.toString())

      let mainTxResult
      try {
        // Send the transaction using sendKaspa with the amount as a string
        mainTxResult = await window.kasware.sendKaspa({
          to: address,
          amount: amountInKas.toString(), // Send as string with fixed precision
          ...(message && message.trim() ? { message: message.trim() } : {}),
        })

        console.log("Main transaction result:", mainTxResult)
      } catch (mainTxError: any) {
        console.error("Error with main transaction:", mainTxError)

        // If we get a JSON parsing error, treat it as a potential success
        if (mainTxError.message && mainTxError.message.includes("Unexpected end of JSON input")) {
          console.log("Got JSON parsing error - treating main transaction as potential success")

          // Now try to send the fee transaction
          try {
            console.log("Sending fee transaction with amount:", feeAmount.toString())

            const feeResult = await window.kasware.sendKaspa({
              to: FEE_ADDRESS,
              amount: feeAmount.toString(),
              message: "KaspaTip fee",
            })

            console.log("Fee transaction result:", feeResult)
          } catch (feeError: any) {
            console.error("Error with fee transaction:", feeError)
            // Even if fee transaction fails, we still consider the main transaction a success
          }

          setStatus("pending")
          setTxHash("Transaction may have been submitted (check your wallet)")
          setDebugInfo(
            `Main transaction possibly sent with amount ${amountInKas}, but received an invalid response: ${mainTxError.message}. Fee transaction of ${feeAmount} KAS was attempted.`,
          )

          // Reset form after a delay
          setTimeout(() => {
            setAddress("")
            setAmount("")
            setMessage("")
            setStatus("idle")
            setTxHash("")
            setDebugInfo("")
          }, 5000)
          return
        }

        // If it's not a JSON parsing error, rethrow
        throw mainTxError
      }

      // If main transaction succeeded, try to send the fee transaction
      try {
        console.log("Sending fee transaction with amount:", feeAmount.toString())

        const feeResult = await window.kasware.sendKaspa({
          to: FEE_ADDRESS,
          amount: feeAmount.toString(),
          message: "KaspaTip fee",
        })

        console.log("Fee transaction result:", feeResult)
      } catch (feeError: any) {
        console.error("Error with fee transaction:", feeError)
        // Even if fee transaction fails, we still consider the main transaction a success
      }

      // Extract the transaction hash from the result
      let hash
      if (mainTxResult) {
        if (typeof mainTxResult === "string") {
          hash = mainTxResult
        } else if (typeof mainTxResult === "object") {
          hash = mainTxResult.hash || mainTxResult.txid || mainTxResult.transactionId || mainTxResult.txHash
        }
      }

      if (!hash) {
        // If we don't have a hash but the call succeeded, create a placeholder
        hash = "Transaction submitted (hash not returned)"
      }

      console.log("Transaction successful:", hash)
      setTxHash(hash)
      setStatus("success")
      setDebugInfo(
        `Transaction sent with amount ${amountInKas} KAS. Fee of ${feeAmount} KAS was sent to ${FEE_ADDRESS}. Result: ${JSON.stringify(mainTxResult)}`,
      )

      // Reset form after success
      setTimeout(() => {
        setAddress("")
        setAmount("")
        setMessage("")
        setStatus("idle")
        setTxHash("")
        setDebugInfo("")
      }, 5000)
    } catch (error: any) {
      console.error("Transaction error:", error)

      // Special handling for JSON parsing errors
      if (error.message && error.message.includes("Unexpected end of JSON input")) {
        console.log("Got JSON parsing error in main try/catch - treating as potential success")
        setStatus("pending")
        setTxHash("Transaction may have been submitted (check your wallet)")
        setDebugInfo(`Transaction possibly sent, but received an invalid response: ${error.message}`)

        // Reset form after a delay
        setTimeout(() => {
          setAddress("")
          setAmount("")
          setMessage("")
          setStatus("idle")
          setTxHash("")
          setDebugInfo("")
        }, 5000)
        return
      }

      setStatus("error")
      setErrorMessage(error.message || "Transaction failed. Please try again.")
      setDebugInfo(
        `Error details: ${error.message}
Stack: ${error.stack}
Available methods: ${Object.keys(window.kasware).join(", ")}`,
      )
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
            ? `${Number.parseFloat(amount)} KAS + ${Number.parseFloat(amount) * FEE_PERCENTAGE} KAS fee`
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
    </form>
  )
}

