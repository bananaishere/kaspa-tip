interface KaswareWallet {
  isKasware?: boolean

  // Account methods
  getAccounts?: () => Promise<string[]>
  accounts?: () => Promise<string[]>
  selectedAddress?: string

  // Transaction methods
  sendKaspa: (params: {
    to: string
    amount: string
    message?: string
  }) => Promise<
    | {
        hash?: string
        txid?: string
        transactionId?: string
      }
    | string
  >
  sendTransaction?: (txParams: any) => Promise<any>
  transfer?: (txParams: any) => Promise<any>
  send?: (txParams: any) => Promise<any>
  signTransaction?: (txParams: any) => Promise<any>
  sendSignedTransaction?: (signedTx: any) => Promise<any>
  createTransaction?: (txParams: any) => Promise<any>
  signAndSendTransaction?: (tx: any) => Promise<any>
  request?: (args: { method: string; params: any[] }) => Promise<any>

  // Event methods
  on?: (event: string, handler: (data: any) => void) => void
  addListener?: (event: string, handler: (data: any) => void) => void
  addEventListener?: (event: string, handler: (data: any) => void) => void
  removeListener?: (event: string, handler: (data: any) => void) => void
  off?: (event: string, handler: (data: any) => void) => void
  removeEventListener?: (event: string, handler: (data: any) => void) => void

  [key: string]: any // Allow any method to be accessed
}

// Extend Window interface to include kasware
declare global {
  interface Window {
    kasware?: KaswareWallet
  }
}

/**
 * Checks if the Kasware wallet extension is installed
 * Uses multiple detection methods for better compatibility
 */
export function isKaswareInstalled(): boolean {
  if (typeof window === "undefined") return false

  const hasKaswareObject = typeof window.kasware !== "undefined"

  if (!hasKaswareObject) return false

  // Try multiple detection methods
  return (
    // Official flag
    window.kasware.isKasware === true ||
    // Method existence checks
    typeof window.kasware.getAccounts === "function" ||
    typeof window.kasware.accounts === "function" ||
    typeof window.kasware.requestAccounts === "function" ||
    typeof window.kasware.enable === "function" ||
    // Property checks
    typeof window.kasware.selectedAddress === "string"
  )
}

/**
 * Formats a Kaspa address for display by truncating the middle
 */
export function formatKaspaAddress(address: string, startChars = 12, endChars = 4): string {
  if (!address) return ""
  if (address.length <= startChars + endChars) return address

  const start = address.substring(0, startChars)
  const end = address.substring(address.length - endChars)
  return `${start}...${end}`
}

/**
 * Validates a Kaspa address format
 */
export function isValidKaspaAddress(address: string): boolean {
  // Basic validation - Kaspa addresses start with "kaspa:" and are typically 62-66 characters long
  return address.startsWith("kaspa:") && address.length >= 62 && address.length <= 66
}

/**
 * Converts KAS amount to sompi (smallest unit)
 * 1 KAS = 100,000,000 sompi
 */
export function kasToSompi(kas: number): bigint {
  return BigInt(Math.floor(kas * 100_000_000))
}

/**
 * Converts sompi amount to KAS
 */
export function sompiToKas(sompi: bigint): number {
  return Number(sompi) / 100_000_000
}

/**
 * Gets the current connected wallet address
 * Tries multiple methods for better compatibility
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
  if (!isKaswareInstalled()) return null

  try {
    // Try different methods to get the current address
    if (typeof window.kasware.getAccounts === "function") {
      const accounts = await window.kasware.getAccounts()
      return accounts && accounts.length > 0 ? accounts[0] : null
    }

    if (typeof window.kasware.accounts === "function") {
      const accounts = await window.kasware.accounts()
      return accounts && accounts.length > 0 ? accounts[0] : null
    }

    if (window.kasware.selectedAddress) {
      return window.kasware.selectedAddress
    }

    return null
  } catch (error) {
    console.error("Error getting current wallet address:", error)
    return null
  }
}

/**
 * Logs all available methods on the Kasware object
 * Useful for debugging
 */
export function logKaswareMethods(): void {
  if (!isKaswareInstalled()) {
    console.log("Kasware not installed")
    return
  }

  console.log("Available Kasware methods:")
  for (const key in window.kasware) {
    const type = typeof window.kasware[key]
    console.log(`- ${key}: ${type}`)
  }
}

