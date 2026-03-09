import { NextRequest, NextResponse } from "next/server"

// Uses the Have I Been Pwned k-Anonymity API
// Only the first 5 characters of the SHA-1 hash are sent
// This means the actual password is NEVER transmitted

export async function POST(request: NextRequest) {
  try {
    const { hashPrefix } = await request.json()

    if (!hashPrefix || typeof hashPrefix !== "string" || hashPrefix.length !== 5) {
      return NextResponse.json(
        { error: "Invalid hash prefix" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
      {
        headers: {
          "Add-Padding": "true",
          "User-Agent": "PasswordStrengthAnalyzer",
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Breach check service unavailable" },
        { status: 502 }
      )
    }

    const text = await response.text()

    return NextResponse.json({ hashes: text })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
