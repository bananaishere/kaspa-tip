"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, X, Shield, ExternalLink, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatKaspaAddress } from "@/lib/kasware"

// Create a global event for wallet connection status
export const WALLET_EVENTS = {
  CONNECTED: "kasware_connected",
  DISCONNECTED: "kasware_disconnected",
  ACCOUNTS_CHANGED: "kasware_accounts_changed",
}

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Define callback functions first to avoid initialization errors
  // Handle successful connection
  const handleSuccessfulConnection = useCallback((address: string) => {
    setWalletAddress(address)
    setIsConnected(true)
    setConnectionState("connected")

    // Dispatch global event
    window.dispatchEvent(
      new CustomEvent(WALLET_EVENTS.CONNECTED, {
        detail: { address },
      }),
    )
  }, [])

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setIsConnected(false)
    setWalletAddress("")
    setConnectionState("idle")

    // Dispatch global event
    window.dispatchEvent(new CustomEvent(WALLET_EVENTS.DISCONNECTED))
  }, [])

  // More robust check for Kasware extension
  const checkKaswareExtension = useCallback(() => {
    // Check if window.kasware exists
    const hasKaswareObject = typeof window !== "undefined" && typeof window.kasware !== "undefined"

    // Additional checks to verify it's the real Kasware extension
    const isRealKasware =
      hasKaswareObject && (window.kasware.isKasware === true || typeof window.kasware.getAccounts === "function")

    setIsExtensionInstalled(isRealKasware)
    return isRealKasware
  }, [])

  // Check for extension on load and when window gets focus
  useEffect(() => {
    // Initial check
    checkKaswareExtension()

    // Check again when window gets focus (user might have installed extension)
    const handleFocus = () => {
      checkKaswareExtension()
    }

    window.addEventListener("focus", handleFocus)

    // Also check periodically (some extensions inject late)
    const intervalCheck = setInterval(() => {
      const detected = checkKaswareExtension()
      if (detected) {
        clearInterval(intervalCheck)
      }
    }, 1000)

    // Clean up
    return () => {
      window.removeEventListener("focus", handleFocus)
      clearInterval(intervalCheck)
    }
  }, [checkKaswareExtension])

  // Check for existing connection on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!isExtensionInstalled) return

      try {
        // Try different methods that Kasware might expose
        if (typeof window.kasware.getAccounts === "function") {
          const accounts = await window.kasware.getAccounts()
          if (accounts && accounts.length > 0) {
            handleSuccessfulConnection(accounts[0])
          }
        } else if (typeof window.kasware.accounts === "function") {
          const accounts = await window.kasware.accounts()
          if (accounts && accounts.length > 0) {
            handleSuccessfulConnection(accounts[0])
          }
        } else if (window.kasware.selectedAddress) {
          // Some wallets expose the address directly
          handleSuccessfulConnection(window.kasware.selectedAddress)
        }
      } catch (error) {
        console.error("Error checking existing connection:", error)
      }
    }

    if (isExtensionInstalled) {
      checkExistingConnection()
    }
  }, [isExtensionInstalled, handleSuccessfulConnection])

  // Set up event listeners for wallet events
  useEffect(() => {
    if (!isExtensionInstalled) return

    const handleAccountsChanged = (accounts: string[] | any) => {
      // Handle both array of accounts and single account formats
      const newAccounts = Array.isArray(accounts) ? accounts : [accounts]

      if (newAccounts.length === 0) {
        // Disconnected
        handleDisconnect()
      } else {
        // Connected or changed account
        handleSuccessfulConnection(newAccounts[0])
      }

      // Dispatch custom event for other components
      window.dispatchEvent(
        new CustomEvent(WALLET_EVENTS.ACCOUNTS_CHANGED, {
          detail: { accounts: newAccounts },
        }),
      )
    }

    // Try to attach listeners using different methods wallets might expose
    try {
      if (typeof window.kasware.on === "function") {
        // Standard method
        window.kasware.on("accountsChanged", handleAccountsChanged)
      } else if (typeof window.kasware.addListener === "function") {
        // Alternative method
        window.kasware.addListener("accountsChanged", handleAccountsChanged)
      } else if (typeof window.kasware.addEventListener === "function") {
        // DOM-style method
        window.kasware.addEventListener("accountsChanged", handleAccountsChanged)
      }
    } catch (error) {
      console.error("Error setting up event listeners:", error)
    }

    // Clean up
    return () => {
      try {
        if (typeof window.kasware?.removeListener === "function") {
          window.kasware.removeListener("accountsChanged", handleAccountsChanged)
        } else if (typeof window.kasware?.off === "function") {
          window.kasware.off("accountsChanged", handleAccountsChanged)
        } else if (typeof window.kasware?.removeEventListener === "function") {
          window.kasware.removeEventListener("accountsChanged", handleAccountsChanged)
        }
      } catch (error) {
        console.error("Error removing event listeners:", error)
      }
    }
  }, [isExtensionInstalled, handleDisconnect, handleSuccessfulConnection])

  // Connect wallet with error handling
  const connectWallet = async () => {
    setIsDialogOpen(false)
    setErrorMessage("")

    if (!isExtensionInstalled) {
      setErrorMessage("Kasware extension not detected. Please install it first.")
      return
    }

    try {
      setConnectionState("connecting")

      // Try different methods that Kasware might expose
      let accounts: string[] = []

      if (typeof window.kasware.requestAccounts === "function") {
        accounts = await window.kasware.requestAccounts()
      } else if (typeof window.kasware.enable === "function") {
        // Legacy method used by some wallets
        accounts = await window.kasware.enable()
      } else if (typeof window.kasware.connect === "function") {
        // Another alternative
        const result = await window.kasware.connect()
        accounts = Array.isArray(result) ? result : [result]
      } else {
        throw new Error("Unable to connect to Kasware. The extension API is not compatible.")
      }

      if (accounts && accounts.length > 0) {
        handleSuccessfulConnection(accounts[0])
      } else {
        throw new Error("No accounts returned from wallet.")
      }
    } catch (error: any) {
      console.error("Connection error:", error)
      setConnectionState("error")
      setErrorMessage(error.message || "Failed to connect to Kasware wallet.")
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    // Try to disconnect if the wallet supports it
    try {
      if (typeof window.kasware?.disconnect === "function") {
        window.kasware.disconnect()
      }
    } catch (error) {
      console.error("Error disconnecting:", error)
    }

    // Always update our state regardless of whether the wallet has a disconnect method
    handleDisconnect()
  }

  return (
    <>
      <Button
        variant={isConnected ? "outline" : "default"}
        className={`w-full md:w-auto ${
          isConnected
            ? "bg-white text-teal-600 hover:bg-teal-50 border-white"
            : "bg-white text-teal-600 hover:bg-teal-50 border-white"
        }`}
        onClick={() => {
          if (isConnected) {
            disconnectWallet()
          } else {
            if (isExtensionInstalled) {
              connectWallet()
            } else {
              setIsDialogOpen(true)
            }
          }
        }}
      >
        {connectionState === "connecting" ? (
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 animate-pulse" />
            <span>Connecting...</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center justify-center gap-2">
            <span className="max-w-[80px] md:max-w-[100px] truncate">{formatKaspaAddress(walletAddress)}</span>
            <X className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </div>
        )}
      </Button>

      {/* Dialog for when extension is not installed */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Connect Kasware Wallet</DialogTitle>
            <DialogDescription>
              {isExtensionInstalled
                ? "Connect your Kasware wallet to send Kaspa tokens"
                : "Kasware extension not detected. Please install it to continue."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {isExtensionInstalled ? (
              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={connectWallet}>
                Connect Kasware
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-700">
                    Kasware wallet extension is required to use this application.
                  </p>
                </div>

                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => window.open("https://www.kasware.xyz/", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Install Kasware Extension
                </Button>

                <p className="text-xs text-center text-gray-500 mt-2">After installing, please refresh this page.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error message dialog */}
      {errorMessage && (
        <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage("")}>
          <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Connection Error
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setErrorMessage("")}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

