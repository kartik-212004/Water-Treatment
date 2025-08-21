import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // This endpoint helps debug environment variable issues
  return NextResponse.json({
    hasAdmin: !!process.env.ADMIN,
    hasPassword: !!process.env.PASSWORD,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    nodeEnv: process.env.NODE_ENV,
    // Don't expose actual values for security
    adminLength: process.env.ADMIN?.length || 0,
    passwordLength: process.env.PASSWORD?.length || 0,
  });
}
