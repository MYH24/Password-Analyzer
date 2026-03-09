"use client"

import { Check, X, Ruler, Braces, Fingerprint, Shuffle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CriteriaCheck } from "@/lib/password-analyzer"

interface CriteriaChecklistProps {
  criteria: CriteriaCheck[]
  hasPassword: boolean
}

const categoryMeta = {
  length: { icon: Ruler, label: "Length" },
  complexity: { icon: Braces, label: "Complexity" },
  patterns: { icon: Fingerprint, label: "Patterns" },
  entropy: { icon: Shuffle, label: "Unpredictability" },
}

export function CriteriaChecklist({ criteria, hasPassword }: CriteriaChecklistProps) {
  const categories = ["length", "complexity", "patterns", "entropy"] as const

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Criteria Analysis</h3>
      <div className="space-y-5">
        {categories.map((cat) => {
          const meta = categoryMeta[cat]
          const Icon = meta.icon
          const items = criteria.filter((c) => c.category === cat)
          const passedCount = items.filter((c) => c.passed).length

          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span className="font-medium uppercase tracking-wider">{meta.label}</span>
                {hasPassword && (
                  <span className="ml-auto font-mono text-foreground/60">
                    {passedCount}/{items.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                      hasPassword
                        ? item.passed
                          ? "bg-success/5 text-foreground"
                          : "bg-danger/5 text-muted-foreground"
                        : "text-muted-foreground/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                        hasPassword
                          ? item.passed
                            ? "bg-success text-success-foreground"
                            : "bg-danger/20 text-danger"
                          : "bg-secondary text-muted-foreground/40"
                      )}
                    >
                      {hasPassword ? (
                        item.passed ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight">{item.label}</p>
                      <p className="text-xs text-muted-foreground/70 leading-tight mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
