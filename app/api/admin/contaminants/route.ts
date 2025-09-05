import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

import { prisma, ContaminantCreateInput } from "@/lib";

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
}

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

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyToken(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contaminants }: { contaminants: ContaminantCreateInput[] } = await req.json();

    if (!contaminants || !Array.isArray(contaminants)) {
      return NextResponse.json({ error: "Invalid contaminants data" }, { status: 400 });
    }

    for (const contaminant of contaminants) {
      if (!contaminant.name || !contaminant.removalRate || !contaminant.healthRisk) {
        return NextResponse.json({ error: "All fields are required for each contaminant" }, { status: 400 });
      }
    }

    const existingNames = await prisma.contaminant.findMany({
      where: {
        name: {
          in: contaminants.map((c) => c.name),
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

    const result = await prisma.contaminant.createMany({
      data: contaminants.map((c) => ({
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
