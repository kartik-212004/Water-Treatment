import { NextRequest, NextResponse } from "next/server";

import axios from "axios";
import fs from "fs";
import { ApiKeySession, EventsApi, ProfilesApi } from "klaviyo-api";
import path from "path";

import { withRateLimit } from "@/lib/rate-limit";

import {
  prisma,
  PATRIOTS_CONTAMINANTS_TYPE,
  ReportRequestBody,
  ContaminantData,
  ProcessedContaminant,
  EmailResult,
  StructuredReportData,
  KlaviyoEventPayload,
} from "@/lib";

let PATRIOTS_CONTAMINANTS: PATRIOTS_CONTAMINANTS_TYPE[];

const session = new ApiKeySession(process.env.KLAVIYO_API_KEY || "");
const eventsApi = new EventsApi(session);

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function getContaminants() {
  PATRIOTS_CONTAMINANTS = await prisma.contaminant.findMany({});
}

async function determineUserEmail(pws_id: string, providedEmail?: string): Promise<EmailResult> {
  if (providedEmail && isValidEmail(providedEmail)) {
    return { email: providedEmail, source: "provided", isValid: true };
  }

  if (providedEmail && !isValidEmail(providedEmail)) {
    console.warn(`Invalid email format provided: ${providedEmail}`);
  }

  try {
    const existingLead = await prisma.leads.findFirst({
      where: { pwsid: pws_id },
      orderBy: { created_at: "desc" },
    });

    if (existingLead?.email && isValidEmail(existingLead.email)) {
      return { email: existingLead.email, source: "existing", isValid: true };
    }
  } catch (leadSearchError) {}

  return { email: null, source: "none", isValid: false };
}

async function handleReportRequest(req: NextRequest) {
  try {
    await getContaminants();

    const { pws_id, email, zipCode }: ReportRequestBody = await req.json();

    if (!pws_id) {
      return NextResponse.json({ error: "PWSID is required" }, { status: 400 });
    }

    if (!zipCode) {
      return NextResponse.json({ error: "Zip code is required" }, { status: 400 });
    }

    const emailResult = await determineUserEmail(pws_id, email);

    if (!emailResult.email || !emailResult.isValid) {
      return NextResponse.json(
        {
          error: "Valid email is required",
          details: "Please provide a valid email address to generate your water report",
        },
        { status: 400 }
      );
    }

    let reportData;

    if (true) {
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
    } else {
      const filePath = path.join(process.cwd(), "result.json");
      const fileContents = fs.readFileSync(filePath, "utf8");
      reportData = JSON.parse(fileContents);
    }

    const allPatriotsContaminants = reportData.data.filter((item: ContaminantData) => {
      return PATRIOTS_CONTAMINANTS.some((contaminant) => contaminant.name === item.name);
    });

    const prioritizedContaminants = allPatriotsContaminants
      .map((item: ContaminantData): ProcessedContaminant => {
        const isDetected = Boolean(
          item.detection_rate && item.detection_rate !== "0%" && item.detection_rate !== "0.00%"
        );
        const currentLevel = item.average || item.median || 0;
        const healthGuideline = item.fed_mclg || item.fed_mcl || Infinity;

        const exceedanceRatio = healthGuideline > 0 ? currentLevel / healthGuideline : 0;

        const patriotData = PATRIOTS_CONTAMINANTS.find((contaminant) => contaminant.name === item.name);

        return {
          ...item,
          isDetected,
          currentLevel,
          healthGuideline,
          exceedanceRatio,
          priority: isDetected ? exceedanceRatio : 0,
          patriotData: {
            removalRate: patriotData?.removalRate || "N/A",
            healthRisk: patriotData?.healthRisk || "No data available",
          },
        };
      })
      .sort((a: ProcessedContaminant, b: ProcessedContaminant) => {
        if (a.isDetected && !b.isDetected) return -1;
        if (!a.isDetected && b.isDetected) return 1;
        return b.priority - a.priority;
      })
      .slice(0, 7);

    const detectedPatriotsCount = prioritizedContaminants.filter(
      (item: ProcessedContaminant) => item.isDetected
    ).length;

    const response = {
      results: reportData.results,
      data: reportData.data,
      prioritizedContaminants,
      detectedPatriotsCount,
      pws_id: pws_id,
      generated_at: new Date().toISOString(),
      email_captured: true,
      requires_email_capture: false,
      email_source: emailResult.source,
      email_valid: emailResult.isValid,
      can_send_immediate_email: true,
      email_status_message:
        emailResult.source === "provided"
          ? "Report will be sent to the provided email address"
          : "Report will be sent to your previously used email address",
    };

    try {
      const waterSystemName = reportData.results || "Unknown Water System";

      const structuredReportData = {
        zip_code: zipCode,
        water_system_name: waterSystemName,
        pws_id: pws_id,
        detected_patriots_count: detectedPatriotsCount,
        generated_at: response.generated_at,
        contaminants: prioritizedContaminants.map((contaminant: ProcessedContaminant) => ({
          name: contaminant.name,
          health_risk: contaminant.patriotData.healthRisk,
          local_level: contaminant.currentLevel
            ? `${contaminant.currentLevel} ${contaminant.unit || "ppb"}`
            : "Not detected",
          health_guideline:
            contaminant.healthGuideline !== Infinity
              ? `${contaminant.healthGuideline} ${contaminant.unit || "ppb"}`
              : "No guideline",
          legal_limit: contaminant.fed_mcl
            ? `${contaminant.fed_mcl} ${contaminant.unit || "ppb"}`
            : "No limit set",
          removal_rate: contaminant.patriotData.removalRate,
          detection_rate: contaminant.detection_rate,
          is_detected: contaminant.isDetected,
          exceedance_ratio: contaminant.exceedanceRatio,
          category: contaminant.category,
        })),
      };

      let waterReport;
      let isNewReport = false;
      try {
        const existingReport = await prisma.contaminant_Mapping.findUnique({
          where: {
            pws_id_zip_code_email: {
              pws_id: pws_id,
              zip_code: structuredReportData.zip_code,
              email: emailResult.email!,
            },
          },
        });

        if (existingReport) {
          const currentDataString = JSON.stringify(structuredReportData.contaminants);
          const existingDataString = JSON.stringify(existingReport.report_data);

          if (currentDataString !== existingDataString) {
            waterReport = await prisma.contaminant_Mapping.update({
              where: { id: existingReport.id },
              data: {
                detected_patriots_count: detectedPatriotsCount,
                report_data: structuredReportData.contaminants,
                klaviyo_event_sent: false,
              },
            });
            isNewReport = true;
          } else {
            waterReport = existingReport;
            isNewReport = false;
          }
        } else {
          waterReport = await prisma.contaminant_Mapping.create({
            data: {
              pws_id: pws_id,
              zip_code: structuredReportData.zip_code,
              water_system_name: waterSystemName,
              email: emailResult.email!,
              detected_patriots_count: detectedPatriotsCount,
              report_data: structuredReportData.contaminants,
              klaviyo_event_sent: false,
            },
          });
          isNewReport = true;
        }
      } catch (e: any) {
        if (e.code === "P2002") {
          waterReport = await prisma.contaminant_Mapping.findFirst({
            where: { pws_id: pws_id, zip_code: structuredReportData.zip_code, email: emailResult.email! },
          });
          isNewReport = false;
        } else if (e.message?.includes("Unknown arg pws_id_zip_code_email")) {
          let existing = await prisma.contaminant_Mapping.findFirst({
            where: { pws_id: pws_id, zip_code: structuredReportData.zip_code, email: emailResult.email! },
          });
          if (!existing) {
            try {
              existing = await prisma.contaminant_Mapping.create({
                data: {
                  pws_id: pws_id,
                  zip_code: structuredReportData.zip_code,
                  water_system_name: waterSystemName,
                  email: emailResult.email!,
                  detected_patriots_count: detectedPatriotsCount,
                  report_data: structuredReportData.contaminants,
                  klaviyo_event_sent: false,
                },
              });
              isNewReport = true;
            } catch (inner: any) {
              if (inner.code === "P2002") {
                existing = await prisma.contaminant_Mapping.findFirst({
                  where: {
                    pws_id: pws_id,
                    zip_code: structuredReportData.zip_code,
                    email: emailResult.email!,
                  },
                });
                isNewReport = false;
              } else throw inner;
            }
          } else {
            const currentDataString = JSON.stringify(structuredReportData.contaminants);
            const existingDataString = JSON.stringify(existing.report_data);

            if (currentDataString !== existingDataString) {
              existing = await prisma.contaminant_Mapping.update({
                where: { id: existing.id },
                data: {
                  detected_patriots_count: detectedPatriotsCount,
                  report_data: structuredReportData.contaminants,
                  klaviyo_event_sent: false, // Reset only when data changes
                },
              });
              isNewReport = true;
            } else {
              isNewReport = false;
            }
          }
          waterReport = existing;
        } else {
          throw e;
        }
      }

      const tempReportId = `${Date.now()}_${pws_id}`;

      if (process.env.KLAVIYO_API_KEY) {
        try {
          if (emailResult.email && emailResult.source === "provided") {
            try {
              await prisma.leads.upsert({
                where: {
                  email: emailResult.email,
                },
                create: {
                  email: emailResult.email,
                  pwsid: pws_id,
                  zip_code: structuredReportData.zip_code,
                  created_at: new Date(),
                },
                update: {
                  pwsid: pws_id,
                  zip_code: structuredReportData.zip_code,
                  created_at: new Date(),
                },
              });
            } catch (leadSaveError) {
              console.warn("Could not save lead to database:", leadSaveError);
            }
          }

          const eventPayload = {
            data: {
              type: "event" as const,
              attributes: {
                properties: {
                  zip_code: structuredReportData.zip_code,
                  water_system_name: structuredReportData.water_system_name,
                  pws_id: structuredReportData.pws_id,
                  detected_patriots_count: structuredReportData.detected_patriots_count,
                  generated_at: structuredReportData.generated_at,
                  contaminants: structuredReportData.contaminants,
                  has_lead: structuredReportData.contaminants.some(
                    (c: any) => c.name === "Lead" && c.is_detected
                  ),
                  has_arsenic: structuredReportData.contaminants.some(
                    (c: any) => c.name === "Arsenic" && c.is_detected
                  ),
                  has_pfas: structuredReportData.contaminants.some(
                    (c: any) => c.name.includes("PF") && c.is_detected
                  ),
                  high_priority_count: structuredReportData.contaminants.filter(
                    (c: any) => c.is_detected && c.exceedance_ratio > 0.5
                  ).length,

                  report_summary: `${structuredReportData.detected_patriots_count} priority contaminants detected in ${structuredReportData.water_system_name}`,

                  email_deliverable: !!emailResult.email,
                  delivery_method: emailResult.email ? "immediate" : "manual_capture_required",
                  email_source: emailResult.source,
                  email_provided_in_request: !!email,
                  email_found_in_database: emailResult.source === "existing",
                },
                metric: {
                  data: {
                    type: "metric" as const,
                    attributes: {
                      name: "Generated Water Report",
                    },
                  },
                },
                profile: {
                  data: {
                    type: "profile" as const,
                    attributes: emailResult.email
                      ? {
                          email: emailResult.email,
                        }
                      : {
                          external_id: `anonymous_${pws_id}_${Date.now()}`,
                        },
                  },
                },
                time: new Date(),
                unique_id: `water_report_${tempReportId}_${emailResult.email || "anonymous"}`,
              },
            },
          };

          if (waterReport && isNewReport && !waterReport.klaviyo_event_sent) {
            await eventsApi.createEvent(eventPayload);
            await prisma.contaminant_Mapping.update({
              where: { id: waterReport.id },
              data: { klaviyo_event_sent: true },
            });
          }
        } catch (klaviyoError: any) {
          console.error("Error sending event to Klaviyo:", klaviyoError);
          if (klaviyoError.response) {
            console.error("Klaviyo API Response Status:", klaviyoError.response.status);
            console.error("Klaviyo API Response Data:", klaviyoError.response.data);
          }
        }
      } else {
        console.warn("KLAVIYO_API_KEY not set, skipping event creation");
      }
    } catch (error) {
      console.error("Error in post-processing:", error);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
}

export const POST = withRateLimit(handleReportRequest, {
  maxRequests: 5,
  windowMs: 60 * 1000,
});
