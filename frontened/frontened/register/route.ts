import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { generateId } from "@/lib/id-generator"
import { hashPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType } = await request.json()

   
    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (userType !== "job_seeker" && userType !== "employer") {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    
    const hashedPassword = await hashPassword(password)
    const userId = generateId("usr")

    db.prepare(`
      INSERT INTO users (id, email, password, full_name, user_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email, hashedPassword, fullName, userType)

   
    await createSession(userId)

    return NextResponse.json({ message: "Registration successful", userId }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
