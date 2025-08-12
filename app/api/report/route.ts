import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import path from "path";

interface RequestBody {
  pws_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const { pws_id }: RequestBody = await req.json();

    if (!pws_id) {
      return NextResponse.json({ error: "PWSID is required" }, { status: 400 });
    }

    // For now, return the mock data from result.json
    // In production, you would make the actual API call:
    // const response = await axios.get(
    //   `https://api.gosimplelab.com/api/utilities/results?pws_id=${pws_id}&result_type=mixed`
    // );

    const filePath = path.join(process.cwd(), "result.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const reportData = JSON.parse(fileContents);

    // Add the pwsid to the response for reference
    const response = {
      ...reportData,
      pws_id: pws_id,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
}
