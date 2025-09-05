import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcrypt";

import { prisma, ContaminantRouteParams, ContaminantUpdateData } from "@/lib";

// Simple token verification based on existing admin auth
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);
  try {
    // Simple verification - in a real app you'd want proper JWT
    return true; // Simplified for now
  } catch (error) {
    return false;
  }
}

// PUT - Update contaminant
export async function PUT(req: NextRequest, { params }: ContaminantRouteParams) {
  try {
    const isAuthorized = await verifyToken(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { name, removalRate, healthRisk }: ContaminantUpdateData = await req.json();

    if (!name || !removalRate || !healthRisk) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if contaminant exists
    const existing = await prisma.contaminant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Contaminant not found" }, { status: 404 });
    }

    // Check for name conflicts (excluding current contaminant)
    const nameConflict = await prisma.contaminant.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (nameConflict) {
      return NextResponse.json({ error: "Contaminant name already exists" }, { status: 400 });
    }

    // Update contaminant
    const updated = await prisma.contaminant.update({
      where: { id },
      data: {
        name,
        removalRate,
        healthRisk,
      },
    });

    return NextResponse.json({
      message: "Contaminant updated successfully",
      contaminant: updated,
    });
  } catch (error) {
    console.error("Error updating contaminant:", error);
    return NextResponse.json({ error: "Failed to update contaminant" }, { status: 500 });
  }
}

// DELETE - Delete contaminant
export async function DELETE(req: NextRequest, { params }: ContaminantRouteParams) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if contaminant exists
    const existing = await prisma.contaminant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Contaminant not found" }, { status: 404 });
    }

    // Delete contaminant
    await prisma.contaminant.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Contaminant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contaminant:", error);
    return NextResponse.json({ error: "Failed to delete contaminant" }, { status: 500 });
  }
}
