"use client"

import { useState, useCallback, useRef } from "react"

export type BreachStatus = "idle" | "checking" | "safe" | "breached" | "error"

export interface BreachResult {
  status: BreachStatus
  count: number
  error?: string
}

// SHA-1 hash using SubtleCrypto (browser-native, no dependencies)
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase()
}

export function useBreachCheck() {
  const [result, setResult] = useState<BreachResult>({ status: "idle", count: 0 })
  const abortRef = useRef<AbortController | null>(null)

  const checkPassword = useCallback(async (password: string) => {
    if (!password) {
      setResult({ status: "idle", count: 0 })
      return
    }

    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setResult({ status: "checking", count: 0 })

    try {
      const hash = await sha1(password)
      const prefix = hash.substring(0, 5)
      const suffix = hash.substring(5)

      const response = await fetch("/api/breach-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashPrefix: prefix }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error("Breach check failed")
      }

      const data = await response.json()
      const hashes: string = data.hashes

      // Search for our hash suffix in the returned list
      const lines = hashes.split("\n")
      let breachCount = 0

      for (const line of lines) {
        const [hashSuffix, count] = line.split(":")
        if (hashSuffix?.trim() === suffix) {
          breachCount = parseInt(count?.trim() || "0", 10)
          break
        }
      }

      if (breachCount > 0) {
        setResult({ status: "breached", count: breachCount })
      } else {
        setResult({ status: "safe", count: 0 })
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return // Ignore aborted requests
      }
      setResult({ status: "error", count: 0, error: "Could not check breach database" })
    }
  }, [])

  const reset = useCallback(() => {
    setResult({ status: "idle", count: 0 })
  }, [])

  return { result, checkPassword, reset }
}
