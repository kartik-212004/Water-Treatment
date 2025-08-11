"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import axios from "axios";
import {
  ArrowLeft,
  Droplets,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
  ExternalLink,
  Shield,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// 4Patriots Contaminant Mapping - Only show these contaminants
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

interface ReportData {
  results: string;
  data: ContaminantData[];
  pws_id: string;
  generated_at: string;
}

function ReportContent() {
  const searchParams = useSearchParams();
  const pwsid = searchParams.get("pwsid");
  const zipCode = searchParams.get("zipcode") || pwsid; // Use zipcode if available, fallback to pwsid

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pwsid) {
      fetchReportData(pwsid);
    } else {
      setError("No PWSID provided");
      setLoading(false);
    }
  }, [pwsid]);

  const fetchReportData = async (pwsid: string) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/report", {
        pws_id: pwsid,
      });
      setReportData(response.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to load water quality report");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      VOCs: "bg-red-100 text-red-800 border-red-200",
      Pesticides: "bg-orange-100 text-orange-800 border-orange-200",
      Properties: "bg-blue-100 text-blue-800 border-blue-200",
      Metals: "bg-purple-100 text-purple-800 border-purple-200",
      Microorganisms: "bg-green-100 text-green-800 border-green-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colorMap[category] || colorMap["Other"];
  };

  const getRiskLevel = (contaminant: ContaminantData) => {
    if (contaminant.body_effects && contaminant.body_effects.length > 0) {
      if (contaminant.body_effects.includes("cancer")) return { level: "High", color: "text-red-600" };
      if (contaminant.body_effects.length > 2) return { level: "Medium", color: "text-orange-600" };
      return { level: "Low", color: "text-yellow-600" };
    }
    return { level: "Minimal", color: "text-green-600" };
  };

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="max-w-2xl space-y-6 text-center">
            {/* Loading Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
                <div className="absolute left-0 top-0 h-20 w-20 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            </div>

            {/* Loading Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analyzing Water Quality Data{zipCode ? ` for ${zipCode}` : ""}...
              </h2>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                We're cross-referencing millions of records from local, state, and federal sources and
                comparing them against our certified lab results to build your custom report. This may take a
                moment.
              </p>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (error || !reportData) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="absolute right-4 top-4">
            <ModeToggle />
          </div>
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <div className="space-y-4">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Not Available</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{error}</p>
            </div>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Form
              </Button>
            </Link>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Get all 4Patriots contaminants (whether detected or not)
  const allPatriotsContaminants = reportData.data.filter((item) => {
    return Object.keys(PATRIOTS_CONTAMINANTS).includes(item.name);
  });

  // Calculate health guideline exceedance and prioritize
  const prioritizedContaminants = allPatriotsContaminants
    .map((item) => {
      const isDetected =
        item.detection_rate && item.detection_rate !== "0%" && item.detection_rate !== "0.00%";
      const currentLevel = item.average || item.median || 0;
      const healthGuideline = item.fed_mclg || item.fed_mcl || Infinity;

      // Calculate exceedance ratio (higher = worse)
      const exceedanceRatio = healthGuideline > 0 ? currentLevel / healthGuideline : 0;

      return {
        ...item,
        isDetected,
        currentLevel,
        healthGuideline,
        exceedanceRatio,
        priority: isDetected ? exceedanceRatio : 0, // Detected contaminants get priority
      };
    })
    .sort((a, b) => {
      // First sort by detection status (detected first)
      if (a.isDetected && !b.isDetected) return -1;
      if (!a.isDetected && b.isDetected) return 1;
      // Then sort by exceedance ratio (highest first)
      return b.priority - a.priority;
    })
    .slice(0, 7); // Show top 5-7 contaminants

  const detectedPatriotsCount = prioritizedContaminants.filter((item) => item.isDetected).length;

  const categorizedData = reportData.data.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ContaminantData[]>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="absolute right-4 top-4">
          <ModeToggle />
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Modern Header Section */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('/water-illustration.png')] bg-contain bg-right bg-no-repeat opacity-20"></div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-white/90">4Patriots</span>
                </div>
                <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm">
                  {new Date(reportData.generated_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Badge>
              </div>

              <div className="mb-4">
                <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
                  Your Custom Water Quality Report for {zipCode}
                </h1>
                <p className="text-lg text-blue-100">
                  Our analysis found {detectedPatriotsCount} contaminants in your water that exceed
                  recommended health guidelines
                </p>
              </div>

              <div className="mb-4">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Form
                  </Button>
                </Link>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute right-20 top-4 h-16 w-16 rounded-full bg-white/10 blur-sm"></div>
              <div className="absolute right-32 top-20 h-8 w-8 rounded-full bg-cyan-300/30"></div>
              <div className="absolute bottom-8 right-16 h-12 w-12 rounded-full bg-blue-300/20 blur-sm"></div>
            </div>
          </div>

          {/* Summary Statement */}
          <Card className="mb-8 rounded-2xl border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Our analysis found {detectedPatriotsCount} contaminants in your water that are above
                recommended health guidelines.
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                The Patriot Pure® Nanomesh™ Filter is certified to remove these specific contaminants from
                your water supply.
              </p>
            </CardContent>
          </Card>

          {/* Patriots Contaminants - Three Column Layout */}
          {prioritizedContaminants.length > 0 ? (
            <div className="mb-8 space-y-6">
              {prioritizedContaminants.map((contaminant, index) => {
                const patriotData =
                  PATRIOTS_CONTAMINANTS[contaminant.name as keyof typeof PATRIOTS_CONTAMINANTS];

                return (
                  <Card
                    key={index}
                    className={`rounded-2xl border-0 shadow-lg backdrop-blur-sm ${
                      contaminant.isDetected
                        ? "border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                        : "bg-white/80 dark:bg-gray-800/80"
                    }`}>
                    <CardContent className="p-6">
                      {/* Priority Badge */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={contaminant.isDetected ? "destructive" : "secondary"}
                            className="text-xs">
                            {contaminant.isDetected ? `Priority ${index + 1}` : "Not Detected"}
                          </Badge>
                          {contaminant.exceedanceRatio > 1 && (
                            <Badge variant="destructive" className="text-xs">
                              Exceeds Guidelines
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-bold ${
                              contaminant.isDetected ? "text-orange-600" : "text-green-600"
                            }`}>
                            {contaminant.detection_rate || "Not Detected"}
                          </div>
                          <div className="text-xs text-gray-500">Detection Rate</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Column 1: The Contaminant */}
                        <div className="space-y-3">
                          <h3 className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
                            {contaminant.isDetected ? (
                              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                            ) : (
                              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                            )}
                            {contaminant.name}
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Health Risk:</p>
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                              {patriotData.healthRisk}
                            </p>
                          </div>
                        </div>

                        {/* Column 2: Your Local Levels */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Your Local Levels
                          </h4>
                          <div className="space-y-3">
                            <div
                              className={`rounded-lg border p-3 ${
                                contaminant.isDetected
                                  ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                                  : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                              }`}>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Your Water:</p>
                              <p
                                className={`text-lg font-bold ${
                                  contaminant.isDetected
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}>
                                {contaminant.isDetected
                                  ? `${contaminant.currentLevel} ${contaminant.unit}`
                                  : "Below Detection Limit"}
                              </p>
                            </div>

                            {contaminant.fed_mclg !== null && (
                              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Health Guideline:
                                </p>
                                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                  {contaminant.fed_mclg} {contaminant.unit}
                                </p>
                              </div>
                            )}

                            {contaminant.fed_mcl !== null && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Legal Limit (EPA):
                                </p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {contaminant.fed_mcl} {contaminant.unit}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 3: The 4Patriots Solution */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            The 4Patriots Solution
                          </h4>
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
                            <div className="mb-2 flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                              Patriot Pure® Removal:
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {patriotData.removalRate}
                            </p>
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              Certified Lab Tested
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="mb-8 rounded-2xl border-0 bg-green-50 shadow-lg backdrop-blur-sm dark:bg-green-900/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600 dark:text-green-400" />
                <h2 className="mb-4 text-2xl font-bold text-green-800 dark:text-green-200">Great News!</h2>
                <p className="text-lg text-green-700 dark:text-green-300">
                  None of the key contaminants that the Patriot Pure® filter targets were detected above
                  recommended levels in your area.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="mb-8 rounded-2xl border-0 bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl">
            <CardContent className="p-8 text-center text-white">
              <h2 className="mb-4 text-3xl font-bold">
                Protect Your Family with the Patriot Pure® Nanomesh™ Filter
              </h2>
              <p className="mb-6 text-lg opacity-90">
                Based on your personalized report, the Patriot Pure® filter is certified to significantly
                reduce or remove the key contaminants found in your water. Take control of your family's
                drinking water today.
              </p>
              <Button
                size="lg"
                className="bg-white px-8 py-4 text-lg font-bold text-blue-600 hover:bg-gray-100"
                onClick={() => window.open("https://4patriots.com/patriot-pure-filter", "_blank")}>
                Learn More & Secure Your Filter
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="mb-8 rounded-2xl border-0 bg-gray-50 shadow-sm dark:bg-gray-800/50">
            <CardContent className="p-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                <Info className="mr-1 inline h-4 w-4" />
                This report highlights key contaminants found in your water that the Patriot Pure® filter is
                certified to reduce. For a complete list of tested contaminants from your utility, please
                refer to their annual Consumer Confidence Report (CCR).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default function Report() {
  return (
    <Suspense fallback={<div>Loading report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
