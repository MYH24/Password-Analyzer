"use client"

import { useState } from "react"
import { Eye, EyeOff, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PasswordInput({ value, onChange, className }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
        <Shield className="h-5 w-5" />
      </div>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your password to analyze..."
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-xl border border-border bg-secondary/50 py-4 pl-12 pr-14 font-mono text-base text-foreground placeholder:text-muted-foreground/60",
          "outline-none transition-all duration-200",
          "focus:border-primary/50 focus:bg-secondary focus:ring-2 focus:ring-primary/20",
          "hover:border-border/80"
        )}
        aria-label="Password to analyze"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}
