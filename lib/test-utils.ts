import { formatKaspaAmount, isValidKaspaAddress } from "./kasware"

/**
 * Tests the Kasware wallet connection and logs available methods
 */
export function testKaswareConnection(): void {
  if (typeof window === "undefined" || !window.kasware) {
    console.error("Kasware wallet not detected")
    return
  }

  console.log("Kasware wallet detected")
  console.log("Available methods:")

  // Log all methods and properties
  for (const key in window.kasware) {
    try {
      const type = typeof window.kasware[key]
      console.log(`- ${key}: ${type}`)
    } catch (error) {
      console.log(`- ${key}: [Error accessing property]`)
    }
  }

  // Test getAccounts if available
  if (typeof window.kasware.getAccounts === "function") {
    window.kasware
      .getAccounts()
      .then((accounts) => {
        console.log("Connected accounts:", accounts)
      })
      .catch((error) => {
        console.error("Error getting accounts:", error)
      })
  }
}

/**
 * Tests a small transaction to verify Kasware integration
 * This is for debugging only and should not be used in production
 */
export async function testKaswareTransaction(recipientAddress: string): Promise<void> {
  if (typeof window === "undefined" || !window.kasware) {
    console.error("Kasware wallet not detected")
    return
  }

  // Trim the address
  const trimmedAddress = recipientAddress.trim()

  if (!trimmedAddress.startsWith("kaspa:")) {
    console.error("Invalid Kaspa address format - must start with 'kaspa:'")
    return
  }

  if (!isValidKaspaAddress(trimmedAddress)) {
    console.error("Invalid Kaspa address format - failed validation check")
    console.error("Address length:", trimmedAddress.length)
    return
  }

  try {
    console.log("Testing transaction with minimal amount")

    // Use a very small amount for testing - format with 8 decimal places
    const testAmount = formatKaspaAmount(0.00000001) // Minimum possible amount

    const params = {
      to: trimmedAddress,
      amount: testAmount,
      message: "KaspaTip test transaction",
    }

    console.log("Transaction params:", params)

    // Log the exact format being sent to the wallet
    console.log("JSON params:", JSON.stringify(params))

    // Attempt to send the transaction
    const result = await window.kasware.sendKaspa(params)

    console.log("Test transaction result:", result)
    return result
  } catch (error) {
    console.error("Test transaction failed:", error)
    throw error
  }
}

/**
 * Validates and analyzes a Kaspa address for debugging purposes
 */
export function validateKaspaAddress(address: string): void {
  console.log("Validating address:", address)
  console.log("Address length:", address.length)
  console.log("Starts with 'kaspa:':", address.startsWith("kaspa:"))
  console.log("Trimmed address:", address.trim())
  console.log("Trimmed length:", address.trim().length)
  console.log("Validation result:", isValidKaspaAddress(address))

  // Check for common issues
  if (address.includes(" ")) {
    console.warn("Address contains spaces")
  }

  if (address !== address.trim()) {
    console.warn("Address has leading or trailing whitespace")
  }

  // Check for invalid characters
  const invalidChars = address.replace(/[a-zA-Z0-9:]/g, "")
  if (invalidChars.length > 0) {
    console.warn("Address contains invalid characters:", invalidChars)
  }
}

