"use client"

import { cn } from "@/lib/utils"
import type { PasswordAnalysis } from "@/lib/password-analyzer"

interface CharDistributionProps {
  analysis: PasswordAnalysis
}

const categories = [
  { key: "uppercase" as const, label: "Uppercase", color: "bg-primary" },
  { key: "lowercase" as const, label: "Lowercase", color: "bg-[oklch(0.65_0.17_145)]" },
  { key: "numbers" as const, label: "Numbers", color: "bg-warning" },
  { key: "special" as const, label: "Special", color: "bg-[oklch(0.7_0.15_50)]" },
]

export function CharDistribution({ analysis }: CharDistributionProps) {
  const total = analysis.charDistribution.uppercase +
    analysis.charDistribution.lowercase +
    analysis.charDistribution.numbers +
    analysis.charDistribution.special

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Character Distribution</h3>
      <div className="space-y-2.5">
        {categories.map((cat) => {
          const count = analysis.charDistribution[cat.key]
          const percent = total > 0 ? (count / total) * 100 : 0

          return (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{cat.label}</span>
                <span className="font-mono text-foreground/70">{count} <span className="text-muted-foreground">({percent.toFixed(0)}%)</span></span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500 ease-out", cat.color)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Stacked bar */}
      {total > 0 && (
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary" role="img" aria-label="Character type distribution">
          {categories.map((cat) => {
            const count = analysis.charDistribution[cat.key]
            const percent = (count / total) * 100
            if (percent === 0) return null
            return (
              <div
                key={cat.key}
                className={cn("h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full", cat.color)}
                style={{ width: `${percent}%` }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
