"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function Report() {
  const searchParams = useSearchParams();
  const pwsid = searchParams.get("pwsid");

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="absolute right-4 top-4">
            <ModeToggle />
          </div>
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="space-y-4 text-center">
              <Skeleton className="mx-auto h-12 w-3/4" />
              <Skeleton className="mx-auto h-6 w-1/2" />
            </div>
            <div className="grid gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
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

  const detectedContaminants = reportData.data.filter(
    (item) => item.detection_rate && item.detection_rate !== "0%" && item.detection_rate !== "0.00%"
  );

  const highRiskContaminants = reportData.data.filter(
    (item) => item.body_effects && item.body_effects.length > 0
  );

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
                <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">Water Quality Report</h1>
                <p className="text-lg text-blue-100">
                  Analysis for PWSID {reportData.pws_id} • {detectedContaminants.length} contaminants detected
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

          {/* Stats Overview Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Total Contaminants</p>
                  <p className="text-3xl font-bold text-foreground">{reportData.data.length}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Detected</p>
                  <p className="text-3xl font-bold text-orange-600">{detectedContaminants.length}</p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Health Concerns</p>
                  <p className="text-3xl font-bold text-red-600">{highRiskContaminants.length}</p>
                </div>
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Detected Contaminants Section */}
          {detectedContaminants.length > 0 && (
            <Card className="mb-8 rounded-2xl border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="rounded-t-2xl bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="flex items-center text-xl text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="mr-2 h-6 w-6" />
                  Detected Contaminants
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  These contaminants were found above detection limits in your water supply
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {detectedContaminants.slice(0, 6).map((contaminant, index) => {
                    const risk = getRiskLevel(contaminant);
                    return (
                      <div key={index} className="rounded-lg border bg-white p-4 dark:bg-gray-700/50">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {contaminant.name}
                            </h3>
                            <div className="mt-1 flex items-center space-x-2">
                              <Badge className={getCategoryColor(contaminant.category)}>
                                {contaminant.category}
                              </Badge>
                              <span className={`text-sm font-medium ${risk.color}`}>{risk.level} Risk</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {contaminant.detection_rate}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Detection Rate</div>
                          </div>
                        </div>

                        {contaminant.median && (
                          <div className="mb-3 rounded bg-gray-50 p-3 dark:bg-gray-600/50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Median:</span> {contaminant.median}{" "}
                                {contaminant.unit}
                              </div>
                              {contaminant.average && (
                                <div>
                                  <span className="font-medium">Average:</span> {contaminant.average}{" "}
                                  {contaminant.unit}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 text-sm">
                          <div>
                            <h4 className="mb-1 font-medium text-gray-900 dark:text-white">
                              Health Effects:
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">{contaminant.health_effects}</p>
                          </div>
                          <div>
                            <h4 className="mb-1 font-medium text-gray-900 dark:text-white">Sources:</h4>
                            <p className="text-gray-700 dark:text-gray-300">{contaminant.sources}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Categories Overview */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden rounded-2xl border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-semibold text-foreground">
                    <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                      <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Contaminant Categories
                  </CardTitle>
                  <CardDescription>
                    Breakdown of contaminants by category found in your water supply
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {Object.entries(categorizedData)
                      .slice(0, 6)
                      .map(([category, contaminants], index) => {
                        const detectedInCategory = contaminants.filter(
                          (c) => c.detection_rate && c.detection_rate !== "0%" && c.detection_rate !== "0.00%"
                        );

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                                  index === 0
                                    ? "bg-red-500"
                                    : index === 1
                                      ? "bg-orange-500"
                                      : index === 2
                                        ? "bg-yellow-500"
                                        : index === 3
                                          ? "bg-blue-500"
                                          : index === 4
                                            ? "bg-purple-500"
                                            : "bg-green-500"
                                }`}>
                                {category.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{category}</p>
                                <p className="text-sm text-muted-foreground">
                                  {contaminants.length} total contaminants
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <Badge variant={detectedInCategory.length > 0 ? "destructive" : "secondary"}>
                                  {detectedInCategory.length} Detected
                                </Badge>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  99.9% Removal
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="space-y-6">
              {/* Risk Level Card */}
              <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <div className="text-center">
                  <div className="relative mx-auto mb-4 h-24 w-24">
                    <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(detectedContaminants.length || 0) * 10} 251.2`}
                        className="text-red-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">
                        {detectedContaminants.length}
                      </span>
                    </div>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">Detected</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {detectedContaminants.length > 5
                      ? "High Risk"
                      : detectedContaminants.length > 2
                        ? "Medium Risk"
                        : "Low Risk"}
                  </p>
                </div>
              </Card>

              {/* Filter Performance */}
              <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Patriot Pure® Filter</p>
                    <p className="text-sm text-muted-foreground">Certified Performance</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">VOCs Removal</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Heavy Metals</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">99.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pesticides</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">99.7%</span>
                  </div>
                </div>
              </Card>

              {/* CTA Card */}
              <Card className="rounded-2xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-bold">Protect Your Family</h3>
                  <p className="mb-4 text-sm text-green-100">Get certified filtration for your home</p>
                  <Button
                    className="w-full bg-white font-semibold text-green-600 hover:bg-gray-100"
                    onClick={() => window.open("https://4patriots.com/patriot-pure-filter", "_blank")}>
                    Order Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 4Patriots LLC. All rights reserved.</p>
            <p className="mt-2">
              This report is based on publicly available water quality data and EPA standards. Individual
              results may vary. Consult with a healthcare professional for specific health concerns.
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
