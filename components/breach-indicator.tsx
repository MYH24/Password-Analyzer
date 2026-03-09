"use client"

import { ShieldCheck, ShieldAlert, Loader2, ShieldQuestion, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BreachResult } from "@/hooks/use-breach-check"

interface BreachIndicatorProps {
  result: BreachResult
  hasPassword: boolean
}

export function BreachIndicator({ result, hasPassword }: BreachIndicatorProps) {
  if (!hasPassword) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3.5">
        <ShieldQuestion className="h-5 w-5 text-muted-foreground/50" />
        <div>
          <p className="text-sm font-medium text-muted-foreground/60">Breach Database Check</p>
          <p className="text-xs text-muted-foreground/40">Enter a password to check against known data breaches</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300",
        result.status === "checking" && "border-border bg-secondary/30",
        result.status === "safe" && "border-success/30 bg-success/5",
        result.status === "breached" && "border-danger/30 bg-danger/5",
        result.status === "error" && "border-warning/30 bg-warning/5",
        result.status === "idle" && "border-border bg-secondary/30"
      )}
    >
      {result.status === "checking" && (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Checking breach database...</p>
            <p className="text-xs text-muted-foreground">Using k-Anonymity protocol for privacy</p>
          </div>
        </>
      )}
      {result.status === "safe" && (
        <>
          <ShieldCheck className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">Not Found in Breaches</p>
            <p className="text-xs text-muted-foreground">This password has not appeared in any known data breach</p>
          </div>
        </>
      )}
      {result.status === "breached" && (
        <>
          <ShieldAlert className="h-5 w-5 text-danger" />
          <div>
            <p className="text-sm font-medium text-danger">Password Compromised</p>
            <p className="text-xs text-muted-foreground">
              Found in <span className="font-semibold text-danger">{result.count.toLocaleString()}</span> data breaches. Do not use this password.
            </p>
          </div>
        </>
      )}
      {result.status === "error" && (
        <>
          <WifiOff className="h-5 w-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">Breach Check Unavailable</p>
            <p className="text-xs text-muted-foreground">{result.error || "Could not reach the breach database"}</p>
          </div>
        </>
      )}
      {result.status === "idle" && (
        <>
          <ShieldQuestion className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Breach Database Check</p>
            <p className="text-xs text-muted-foreground/70">Will automatically check when you stop typing</p>
          </div>
        </>
      )}
    </div>
  )
}
