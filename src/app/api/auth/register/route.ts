import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
const schema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(10).max(128) });
export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid name, email, and password (at least 10 characters)." }, { status: 400 });
    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    if (await db.user.findUnique({ where: { email: normalizedEmail } })) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const user = await db.user.create({ data: { name, email: normalizedEmail, passwordHash: await hash(password, 12), settings: { create: {} } }, select: { id: true, name: true, email: true } });
    return NextResponse.json({ user }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 }); }
}
