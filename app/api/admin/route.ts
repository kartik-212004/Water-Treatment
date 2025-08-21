import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

interface RequestBody {
  admin: string | null;
  password: string | null;
}

export async function POST(req: NextRequest) {
  const { admin, password }: RequestBody = await req.json();

  if (!admin || !password) {
    return NextResponse.json({ message: "admin or password not provided" }, { status: 400 });
  }

  if (admin === process.env.ADMIN && password === process.env.PASSWORD) {
    const token = bcrypt.hash(`${admin}${password}`, 10);
    return NextResponse.json({ message: "Login successful", token: token }, { status: 200 });
  }

  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
