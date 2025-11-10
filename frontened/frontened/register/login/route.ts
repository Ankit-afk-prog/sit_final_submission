import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email)

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json(
      { message: "Login successful", userId: user.id, userType: user.user_type },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
