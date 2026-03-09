"use client"

import { Lightbulb, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuggestionsPanelProps {
  suggestions: string[]
  hasPassword: boolean
}

export function SuggestionsPanel({ suggestions, hasPassword }: SuggestionsPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-warning" />
        Recommendations
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 rounded-lg border border-border/50 bg-secondary/30 px-4 py-3 transition-all duration-300",
              hasPassword ? "opacity-100 translate-y-0" : "opacity-50"
            )}
            style={{ transitionDelay: `${i * 75}ms` }}
          >
            <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p className="text-sm text-foreground/80 leading-relaxed">{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
