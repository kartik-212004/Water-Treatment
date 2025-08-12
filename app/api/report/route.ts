import { NextRequest, NextResponse } from "next/server";

import axios from "axios";
import fs from "fs";
import path from "path";

interface RequestBody {
  pws_id: string;
}

const PATRIOTS_CONTAMINANTS = {
  Lead: {
    removalRate: "99.9%",
    healthRisk:
      "A neurotoxin that can cause serious health problems, particularly in pregnant women and young children.",
  },
  Arsenic: {
    removalRate: "99.9%",
    healthRisk: "A known carcinogen linked to an increased risk of skin, bladder, and lung cancer.",
  },
  Atrazine: {
    removalRate: "99.9%",
    healthRisk:
      "An endocrine-disrupting herbicide that can interfere with hormone systems and cause reproductive harm.",
  },
  PFOA: {
    removalRate: "99.9%",
    healthRisk: "A 'forever chemical' linked to cancer, immune system effects, and developmental issues.",
  },
  Chloroform: {
    removalRate: "99.9%",
    healthRisk: "A disinfection byproduct that is a probable human carcinogen.",
  },
} as const;

interface ContaminantData {
  name: string;
  category: string;
  cas: string;
  unit: string;
  type: string;
  sub_type: string;
  median: number | null;
  average: number | null;
  detection_rate: string;
  reduced_data_quality: boolean;
  sources: string;
  health_effects: string;
  aesthetic_effects: string;
  description: string;
  body_effects: string[];
  slr: number | null;
  fed_mcl: number | null;
  fed_mclg: number | null;
  max: number | null;
}

interface ProcessedContaminant extends ContaminantData {
  isDetected: boolean;
  currentLevel: number;
  healthGuideline: number;
  exceedanceRatio: number;
  priority: number;
  patriotData: {
    removalRate: string;
    healthRisk: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { pws_id }: RequestBody = await req.json();

    if (!pws_id) {
      return NextResponse.json({ error: "PWSID is required" }, { status: 400 });
    }

    let reportData;

    console.log("NODE_ENV:", process.env.NODE_ENV);

    if (false) {
      const response = await axios.get(
        `https://api.gosimplelab.com/api/utilities/results?pws_id=${pws_id}&result_type=mixed`,
        {
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      reportData = response.data;
      console.log(reportData);
    } else {
      const filePath = path.join(process.cwd(), "result.json");
      const fileContents = fs.readFileSync(filePath, "utf8");
      reportData = JSON.parse(fileContents);
    }

    const allPatriotsContaminants = reportData.data.filter((item: ContaminantData) => {
      return Object.keys(PATRIOTS_CONTAMINANTS).includes(item.name);
    });

    const prioritizedContaminants = allPatriotsContaminants
      .map((item: ContaminantData): ProcessedContaminant => {
        const isDetected = Boolean(
          item.detection_rate && item.detection_rate !== "0%" && item.detection_rate !== "0.00%"
        );
        const currentLevel = item.average || item.median || 0;
        const healthGuideline = item.fed_mclg || item.fed_mcl || Infinity;

        const exceedanceRatio = healthGuideline > 0 ? currentLevel / healthGuideline : 0;

        const patriotData = PATRIOTS_CONTAMINANTS[item.name as keyof typeof PATRIOTS_CONTAMINANTS];

        return {
          ...item,
          isDetected,
          currentLevel,
          healthGuideline,
          exceedanceRatio,
          priority: isDetected ? exceedanceRatio : 0,
          patriotData,
        };
      })
      .sort((a: ProcessedContaminant, b: ProcessedContaminant) => {
        // First sort by detection status (detected first)
        if (a.isDetected && !b.isDetected) return -1;
        if (!a.isDetected && b.isDetected) return 1;
        // Then sort by exceedance ratio (highest first)
        return b.priority - a.priority;
      })
      .slice(0, 7); // Show top 5-7 contaminants

    const detectedPatriotsCount = prioritizedContaminants.filter(
      (item: ProcessedContaminant) => item.isDetected
    ).length;

    // Add the processed data to the response
    const response = {
      results: reportData.results,
      data: reportData.data, // Keep original data for reference
      prioritizedContaminants, // Add filtered and processed contaminants
      detectedPatriotsCount,
      pws_id: pws_id,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
}
