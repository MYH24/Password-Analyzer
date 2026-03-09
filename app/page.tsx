"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ShieldCheck, Lock, Info } from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import { StrengthMeter } from "@/components/strength-meter"
import { CriteriaChecklist } from "@/components/criteria-checklist"
import { BreachIndicator } from "@/components/breach-indicator"
import { CharDistribution } from "@/components/char-distribution"
import { SuggestionsPanel } from "@/components/suggestions-panel"
import { analyzePassword } from "@/lib/password-analyzer"
import { useBreachCheck } from "@/hooks/use-breach-check"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

export default function PasswordAnalyzerPage() {
  const [password, setPassword] = useState("")
  const analysis = analyzePassword(password)
  const { result: breachResult, checkPassword, reset: resetBreach } = useBreachCheck()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const debouncedBreachCheck = useCallback(
    (pw: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!pw) {
        resetBreach()
        return
      }
      debounceRef.current = setTimeout(() => {
        checkPassword(pw)
      }, 800)
    },
    [checkPassword, resetBreach]
  )

  useEffect(() => {
    debouncedBreachCheck(password)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [password, debouncedBreachCheck])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight font-sans">PassGuard</h1>
              <p className="text-xs text-muted-foreground">Password Strength Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Your password never leaves your device</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ml-1 rounded-full p-0.5 hover:bg-secondary transition-colors" aria-label="Privacy information">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                All analysis is performed locally in your browser. For breach checking, only a partial hash prefix (5 characters) is sent using the k-Anonymity protocol. Your full password is never transmitted.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero input section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-balance font-sans md:text-3xl">
            How strong is your password?
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto text-pretty">
            Get a comprehensive security analysis with real-time feedback, breach detection, and actionable recommendations.
          </p>
          <div className="max-w-2xl mx-auto">
            <PasswordInput value={password} onChange={setPassword} />
          </div>
        </div>

        {/* Main analysis grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Score + Breach + Distribution */}
          <div className="space-y-6 lg:col-span-1">
            {/* Score card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <StrengthMeter analysis={analysis} />
            </div>

            {/* Breach check */}
            <BreachIndicator result={breachResult} hasPassword={password.length > 0} />

            {/* Character distribution */}
            <div className="rounded-xl border border-border bg-card p-5">
              <CharDistribution analysis={analysis} />
            </div>
          </div>

          {/* Middle column - Criteria */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5 h-full">
              <CriteriaChecklist criteria={analysis.criteria} hasPassword={password.length > 0} />
            </div>
          </div>

          {/* Right column - Suggestions + Tips */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5">
              <SuggestionsPanel suggestions={analysis.suggestions} hasPassword={password.length > 0} />
            </div>

            {/* Pro tips card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Security Tips</h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Use a Password Manager",
                    desc: "Generate and store unique, complex passwords for every account without memorizing them.",
                  },
                  {
                    title: "Enable Two-Factor Auth",
                    desc: "Add an extra layer of security beyond your password with 2FA on all critical accounts.",
                  },
                  {
                    title: "Try a Passphrase",
                    desc: "Combine 4-5 random words with special characters for a password that is both strong and memorable.",
                  },
                  {
                    title: "Never Reuse Passwords",
                    desc: "A single breach can cascade to all your accounts if you reuse the same password.",
                  },
                ].map((tip) => (
                  <div key={tip.title} className="group">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tip.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border/50 pt-6 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            Breach data powered by{" "}
            <a
              href="https://haveibeenpwned.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Have I Been Pwned
            </a>
            . All analysis is performed client-side. No passwords are stored or transmitted.
          </p>
        </footer>
      </div>
    </main>
  )
}
