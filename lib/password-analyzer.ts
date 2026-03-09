// Common patterns and dictionaries for password analysis
const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "master",
  "dragon", "111111", "baseball", "iloveyou", "trustno1", "sunshine", "ashley",
  "football", "shadow", "123123", "654321", "superman", "qazwsx", "michael",
  "password1", "password123", "welcome", "letmein", "admin", "login",
  "princess", "starwars", "solo", "passw0rd", "hello", "charlie", "donald",
  "loveme", "beer", "access", "hockey", "thunder", "mustang", "batman",
])

const KEYBOARD_PATTERNS = [
  "qwerty", "qwertz", "azerty", "asdfgh", "zxcvbn", "!@#$%^",
  "1234567890", "0987654321", "qweasd", "asdzxc",
]

const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s",
}

export interface CriteriaCheck {
  id: string
  label: string
  description: string
  passed: boolean
  weight: number
  category: "length" | "complexity" | "patterns" | "entropy"
}

export interface PasswordAnalysis {
  score: number // 0-100
  level: "critical" | "weak" | "fair" | "strong" | "excellent"
  label: string
  criteria: CriteriaCheck[]
  entropy: number
  crackTime: string
  suggestions: string[]
  charDistribution: {
    uppercase: number
    lowercase: number
    numbers: number
    special: number
  }
}

function calculateEntropy(password: string): number {
  if (!password) return 0
  const charsetSize = getCharsetSize(password)
  return password.length * Math.log2(charsetSize)
}

function getCharsetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^a-zA-Z0-9]/.test(password)) size += 33
  return Math.max(size, 1)
}

function estimateCrackTime(entropy: number): string {
  // Assume 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 10_000_000_000
  const totalGuesses = Math.pow(2, entropy)
  const seconds = totalGuesses / guessesPerSecond

  if (seconds < 0.001) return "Instantly"
  if (seconds < 1) return "Less than a second"
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`
  if (seconds < 31536000 * 1000000) return `${Math.round(seconds / 31536000).toLocaleString()} years`
  return "Centuries+"
}

function hasRepeatingChars(password: string): boolean {
  return /(.)\1{2,}/.test(password)
}

function hasSequentialChars(password: string): boolean {
  const lower = password.toLowerCase()
  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower.charCodeAt(i)
    const c2 = lower.charCodeAt(i + 1)
    const c3 = lower.charCodeAt(i + 2)
    if (c2 === c1 + 1 && c3 === c2 + 1) return true
    if (c2 === c1 - 1 && c3 === c2 - 1) return true
  }
  return false
}

function hasKeyboardPattern(password: string): boolean {
  const lower = password.toLowerCase()
  return KEYBOARD_PATTERNS.some(p => lower.includes(p))
}

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) return true
  // Check leet-speak variants
  let deleet = lower
  for (const [k, v] of Object.entries(LEET_MAP)) {
    deleet = deleet.replaceAll(k, v)
  }
  return COMMON_PASSWORDS.has(deleet)
}

function getCharDistribution(password: string) {
  let uppercase = 0, lowercase = 0, numbers = 0, special = 0
  for (const char of password) {
    if (/[A-Z]/.test(char)) uppercase++
    else if (/[a-z]/.test(char)) lowercase++
    else if (/[0-9]/.test(char)) numbers++
    else special++
  }
  return { uppercase, lowercase, numbers, special }
}

function hasGoodDistribution(password: string): boolean {
  const dist = getCharDistribution(password)
  const types = [dist.uppercase, dist.lowercase, dist.numbers, dist.special]
  const nonZero = types.filter(t => t > 0).length
  return nonZero >= 3
}

function getUniqueCharsRatio(password: string): number {
  if (!password) return 0
  const unique = new Set(password.split(""))
  return unique.size / password.length
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      level: "critical",
      label: "No Password",
      criteria: buildCriteria(password),
      entropy: 0,
      crackTime: "N/A",
      suggestions: ["Enter a password to begin analysis"],
      charDistribution: { uppercase: 0, lowercase: 0, numbers: 0, special: 0 },
    }
  }

  const criteria = buildCriteria(password)
  const entropy = calculateEntropy(password)
  const crackTime = estimateCrackTime(entropy)
  const charDistribution = getCharDistribution(password)

  // Calculate weighted score
  let score = 0
  let totalWeight = 0
  for (const c of criteria) {
    totalWeight += c.weight
    if (c.passed) score += c.weight
  }
  score = Math.round((score / totalWeight) * 100)

  // Bonus for high entropy
  if (entropy > 60) score = Math.min(100, score + 5)
  if (entropy > 80) score = Math.min(100, score + 5)

  // Penalties
  if (isCommonPassword(password)) score = Math.min(score, 10)
  if (password.length < 6) score = Math.min(score, 15)

  const level = getLevel(score)
  const label = getLevelLabel(level)
  const suggestions = generateSuggestions(password, criteria, entropy)

  return { score, level, label, criteria, entropy, crackTime, suggestions, charDistribution }
}

function buildCriteria(password: string): CriteriaCheck[] {
  return [
    {
      id: "min-length",
      label: "Minimum Length",
      description: "At least 8 characters long",
      passed: password.length >= 8,
      weight: 15,
      category: "length",
    },
    {
      id: "good-length",
      label: "Strong Length",
      description: "At least 12 characters long",
      passed: password.length >= 12,
      weight: 10,
      category: "length",
    },
    {
      id: "excellent-length",
      label: "Excellent Length",
      description: "At least 16 characters long",
      passed: password.length >= 16,
      weight: 5,
      category: "length",
    },
    {
      id: "uppercase",
      label: "Uppercase Letters",
      description: "Contains at least one uppercase letter (A-Z)",
      passed: /[A-Z]/.test(password),
      weight: 10,
      category: "complexity",
    },
    {
      id: "lowercase",
      label: "Lowercase Letters",
      description: "Contains at least one lowercase letter (a-z)",
      passed: /[a-z]/.test(password),
      weight: 10,
      category: "complexity",
    },
    {
      id: "numbers",
      label: "Numbers",
      description: "Contains at least one digit (0-9)",
      passed: /[0-9]/.test(password),
      weight: 10,
      category: "complexity",
    },
    {
      id: "special",
      label: "Special Characters",
      description: "Contains at least one special character (!@#$%...)",
      passed: /[^a-zA-Z0-9]/.test(password),
      weight: 10,
      category: "complexity",
    },
    {
      id: "no-repeating",
      label: "No Repeating Characters",
      description: "No character repeats 3 or more times in a row",
      passed: !hasRepeatingChars(password),
      weight: 8,
      category: "patterns",
    },
    {
      id: "no-sequential",
      label: "No Sequential Characters",
      description: "No sequential runs like abc, 123, or cba",
      passed: !hasSequentialChars(password),
      weight: 8,
      category: "patterns",
    },
    {
      id: "no-keyboard",
      label: "No Keyboard Patterns",
      description: "No common keyboard patterns like qwerty or asdfgh",
      passed: !hasKeyboardPattern(password),
      weight: 7,
      category: "patterns",
    },
    {
      id: "not-common",
      label: "Not a Common Password",
      description: "Not found in the top 100 most common passwords",
      passed: !isCommonPassword(password),
      weight: 12,
      category: "patterns",
    },
    {
      id: "good-distribution",
      label: "Good Character Mix",
      description: "Uses at least 3 different character types",
      passed: hasGoodDistribution(password),
      weight: 8,
      category: "entropy",
    },
    {
      id: "unique-ratio",
      label: "Character Variety",
      description: "At least 60% of characters are unique",
      passed: getUniqueCharsRatio(password) >= 0.6,
      weight: 7,
      category: "entropy",
    },
  ]
}

function getLevel(score: number): PasswordAnalysis["level"] {
  if (score < 20) return "critical"
  if (score < 40) return "weak"
  if (score < 60) return "fair"
  if (score < 80) return "strong"
  return "excellent"
}

function getLevelLabel(level: PasswordAnalysis["level"]): string {
  switch (level) {
    case "critical": return "Critical"
    case "weak": return "Weak"
    case "fair": return "Fair"
    case "strong": return "Strong"
    case "excellent": return "Excellent"
  }
}

function generateSuggestions(
  password: string,
  criteria: CriteriaCheck[],
  entropy: number
): string[] {
  const suggestions: string[] = []
  const failedCriteria = criteria.filter(c => !c.passed)

  if (password.length < 8) {
    suggestions.push("Increase your password to at least 8 characters. Longer passwords are exponentially harder to crack.")
  } else if (password.length < 12) {
    suggestions.push("Consider extending your password to 12+ characters for significantly better protection.")
  }

  if (failedCriteria.some(c => c.id === "uppercase")) {
    suggestions.push("Add uppercase letters to increase complexity. Try capitalizing letters in the middle of words, not just the first letter.")
  }

  if (failedCriteria.some(c => c.id === "special")) {
    suggestions.push("Include special characters like !@#$%^&*() to greatly expand the character space attackers must search.")
  }

  if (failedCriteria.some(c => c.id === "numbers")) {
    suggestions.push("Add numbers throughout your password, not just at the end. Embedding digits within words is more effective.")
  }

  if (failedCriteria.some(c => c.id === "not-common")) {
    suggestions.push("Your password matches a commonly breached password. Choose something unique and unpredictable.")
  }

  if (failedCriteria.some(c => c.id === "no-repeating")) {
    suggestions.push("Avoid repeating characters. Patterns like 'aaa' or '111' are easy for attackers to guess.")
  }

  if (failedCriteria.some(c => c.id === "no-sequential")) {
    suggestions.push("Remove sequential character runs. Sequences like 'abc' or '123' are predictable patterns.")
  }

  if (failedCriteria.some(c => c.id === "no-keyboard")) {
    suggestions.push("Avoid keyboard patterns like 'qwerty'. These are among the first combinations attackers try.")
  }

  if (entropy < 50 && password.length >= 8) {
    suggestions.push("Try using a passphrase: combine 4-5 random words with numbers and symbols for both strength and memorability.")
  }

  if (suggestions.length === 0) {
    suggestions.push("Your password is strong! Consider using a password manager to generate and store unique passwords for each account.")
  }

  return suggestions.slice(0, 4)
}
