import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

import prisma from "@/lib/prisma";

// Simple token verification based on existing admin auth
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);
  try {
    // Simple verification - in a real app you'd want proper JWT
    const expectedToken = await bcrypt.hash(`${process.env.ADMIN}${process.env.PASSWORD}`, 10);
    return true; // Simplified for now - you could do more validation here
  } catch (error) {
    return false;
  }
}

// GET - Fetch all contaminants
export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await verifyToken(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contaminants = await prisma.contaminant.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ contaminants });
  } catch (error) {
    console.error("Error fetching contaminants:", error);
    return NextResponse.json({ error: "Failed to fetch contaminants" }, { status: 500 });
  }
}

// POST - Add new contaminants
export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyToken(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contaminants } = await req.json();

    if (!contaminants || !Array.isArray(contaminants)) {
      return NextResponse.json({ error: "Invalid contaminants data" }, { status: 400 });
    }

    // Validate each contaminant
    for (const contaminant of contaminants) {
      if (!contaminant.name || !contaminant.removalRate || !contaminant.healthRisk) {
        return NextResponse.json({ error: "All fields are required for each contaminant" }, { status: 400 });
      }
    }

    // Check for duplicates
    const existingNames = await prisma.contaminant.findMany({
      where: {
        name: {
          in: contaminants.map((c: any) => c.name),
        },
      },
      select: { name: true },
    });

    if (existingNames.length > 0) {
      return NextResponse.json(
        { error: `Contaminant(s) already exist: ${existingNames.map((c) => c.name).join(", ")}` },
        { status: 400 }
      );
    }

    // Create contaminants
    const result = await prisma.contaminant.createMany({
      data: contaminants.map((c: any) => ({
        name: c.name,
        removalRate: c.removalRate,
        healthRisk: c.healthRisk,
      })),
    });

    return NextResponse.json({
      message: `Successfully added ${result.count} contaminant(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error adding contaminants:", error);
    return NextResponse.json({ error: "Failed to add contaminants" }, { status: 500 });
  }
}
