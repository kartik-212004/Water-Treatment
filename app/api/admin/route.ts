import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

import { prisma, AdminRequestBody } from "@/lib";

export async function POST(req: NextRequest) {
  const body: AdminRequestBody = await req.json();

  if (body.admin && body.password) {
    if (!process.env.ADMIN || !process.env.PASSWORD) {
      console.error("Missing environment variables: ADMIN or PASSWORD not set");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    if (body.admin === process.env.ADMIN && body.password === process.env.PASSWORD) {
      const token = await bcrypt.hash(`${body.admin}${body.password}`, 10);
      return NextResponse.json(
        {
          message: "Login successful",
          token: token,
          status: 200,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // Check if this is a contaminants request
  if (body.contaminants) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Add multiple contaminants
      const createdContaminants = await Promise.all(
        body.contaminants.map((contaminant: { name: string; removalRate: string; healthRisk: string }) =>
          prisma.contaminant.create({
            data: {
              name: contaminant.name,
              removalRate: contaminant.removalRate,
              healthRisk: contaminant.healthRisk,
            },
          })
        )
      );

      return NextResponse.json(
        {
          message: `Successfully added ${createdContaminants.length} contaminant(s)`,
          data: createdContaminants,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error adding contaminants:", error);
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Contaminant with this name already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to add contaminants" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Invalid request" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await prisma.contaminant.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: data, status: 200 });
  } catch (error) {
    console.error("Error fetching contaminants:", error);
    return NextResponse.json({ error: "Failed to fetch contaminants" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: AdminRequestBody = await req.json();

    if (!body.contaminant || !body.contaminant.id) {
      return NextResponse.json({ error: "Contaminant data and ID required" }, { status: 400 });
    }

    const updatedContaminant = await prisma.contaminant.update({
      where: { id: body.contaminant.id },
      data: {
        name: body.contaminant.name,
        removalRate: body.contaminant.removalRate,
        healthRisk: body.contaminant.healthRisk,
      },
    });

    return NextResponse.json(
      {
        message: "Contaminant updated successfully",
        data: updatedContaminant,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating contaminant:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Contaminant with this name already exists" }, { status: 400 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contaminant not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update contaminant" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: AdminRequestBody = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Contaminant ID required" }, { status: 400 });
    }

    await prisma.contaminant.delete({
      where: { id: body.id },
    });

    return NextResponse.json(
      {
        message: "Contaminant deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting contaminant:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contaminant not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete contaminant" }, { status: 500 });
  }
}
