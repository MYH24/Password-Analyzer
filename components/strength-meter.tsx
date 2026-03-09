"use client"

import { cn } from "@/lib/utils"
import type { PasswordAnalysis } from "@/lib/password-analyzer"

interface StrengthMeterProps {
  analysis: PasswordAnalysis
}

const levelConfig = {
  critical: { color: "bg-danger", textColor: "text-danger", segments: 1 },
  weak: { color: "bg-[oklch(0.7_0.15_50)]", textColor: "text-[oklch(0.7_0.15_50)]", segments: 2 },
  fair: { color: "bg-warning", textColor: "text-warning", segments: 3 },
  strong: { color: "bg-[oklch(0.65_0.17_145)]", textColor: "text-[oklch(0.65_0.17_145)]", segments: 4 },
  excellent: { color: "bg-success", textColor: "text-success", segments: 5 },
}

export function StrengthMeter({ analysis }: StrengthMeterProps) {
  const config = levelConfig[analysis.level]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("text-3xl font-bold tabular-nums font-sans", config.textColor)}>
            {analysis.score}
          </span>
          <div>
            <p className={cn("text-sm font-semibold", config.textColor)}>{analysis.label}</p>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimated crack time</p>
          <p className="text-sm font-semibold text-foreground">{analysis.crackTime}</p>
        </div>
      </div>

      {/* Segmented strength bar */}
      <div className="flex gap-1.5" role="meter" aria-valuenow={analysis.score} aria-valuemin={0} aria-valuemax={100} aria-label={`Password strength: ${analysis.label}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-500",
              i < config.segments ? config.color : "bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Entropy display */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Entropy: <span className="font-mono text-foreground">{analysis.entropy.toFixed(1)} bits</span></span>
        <span>{analysis.charDistribution.uppercase + analysis.charDistribution.lowercase + analysis.charDistribution.numbers + analysis.charDistribution.special} characters</span>
      </div>
    </div>
  )
}
