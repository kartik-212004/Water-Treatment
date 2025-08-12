"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import axios from "axios";
import { ArrowLeft, Droplets, AlertTriangle, CheckCircle, Info } from "lucide-react";

import CTA from "@/components/CTA";
import Loading from "@/components/Loading";
import { ReportSkeleton } from "@/components/Suspense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  prioritizedContaminants: ProcessedContaminant[];
  detectedPatriotsCount: number;
  pws_id: string;
  generated_at: string;
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

function ReportContent() {
  const searchParams = useSearchParams();
  const pwsid = searchParams.get("pwsid");
  const zipCode = searchParams.get("zipcode") || pwsid;
  const email = searchParams.get("email");

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
        email: email,
        zipCode: zipCode,
      });
      setReportData(response.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to load water quality report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading zipcode={zipCode} />;
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="space-y-4">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Report Not Available</h1>
            <p className="text-lg text-gray-600">{error}</p>
          </div>
          <Link href="/">
            <Button className="">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const prioritizedContaminants = reportData.prioritizedContaminants;
  const detectedPatriotsCount = reportData.detectedPatriotsCount;

  return (
    <div className="relative m-0 min-h-screen bg-white pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden border-b border-gray-200 bg-[#101935] px-6 py-10 shadow-sm sm:rounded-none">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/logo.webp" width={200} height={100} alt="Logo" />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="hidden sm:inline-block">
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
              Personalized Water Quality Report
            </h1>
            <div className="max-w-2xl text-sm font-medium text-white/70">
              Service Area: <span className="text-white">{zipCode}</span> · Priority contaminants detected:{" "}
              <span className="font-medium text-red-400">{detectedPatriotsCount}</span>
              {"  "}
              <Badge className="rounded-md bg-white/10 text-white ring-1 ring-inset ring-white/20">
                {new Date(reportData.generated_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="mb-10 rounded-sm border border-gray-200 bg-gray-100 shadow-sm">
          <CardContent className="p-8 text-center">
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-gray-900">
              {detectedPatriotsCount > 0 ? (
                <>
                  We identified <span className="text-[#B40014]">{detectedPatriotsCount}</span> priority
                  contaminant(s) above guideline levels.
                </>
              ) : (
                <>No priority contaminants exceeded guideline thresholds.</>
              )}
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Focused report displays only the high-impact contaminants our filtration technology targets for
              meaningful risk reduction.
            </p>
          </CardContent>
        </Card>

        {prioritizedContaminants.length > 0 ? (
          <div className="mb-8 space-y-6">
            {prioritizedContaminants.map((contaminant, index) => {
              const guideline = contaminant.fed_mclg ?? null;
              const legal = contaminant.fed_mcl ?? null;
              return (
                <Card
                  key={index}
                  className={`group overflow-hidden rounded-sm transition hover:shadow-md ${
                    contaminant.isDetected ? "bg-white" : "bg-white"
                  }`}>
                  <div
                    className={`absolute left-0 top-0 h-full ${contaminant.isDetected ? "bg-[#B40014]" : "bg-gray-300"}`}></div>
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {contaminant.isDetected ? (
                          <AlertTriangle className="h-5 w-5 text-[#B40014]" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{contaminant.name}</h3>
                        {contaminant.exceedanceRatio > 1 && (
                          <span className="rounded-full bg-[#B40014]/10 px-2 py-0.5 text-xs font-medium text-[#B40014]">
                            Exceeds
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] font-semibold tracking-wide ${contaminant.isDetected ? "bg-[#101935] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-200"}`}>
                          {contaminant.isDetected ? `PRIORITY ${index + 1}` : "NOT DETECTED"}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500">Detection</p>
                          <p className="-mt-0.5 text-sm font-semibold text-gray-900">
                            {contaminant.detection_rate || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Risk Text */}
                    <p className="mb-5 text-sm leading-relaxed text-gray-600">
                      {contaminant.patriotData.healthRisk}
                    </p>
                    {/* Stats Grid */}
                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                      <div
                        className={`rounded-md border p-3 ${contaminant.isDetected ? "border-[#101935]/30 bg-[#101935]/5" : "border-gray-200 bg-gray-50"}`}>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                          Your Level
                        </p>
                        <p
                          className={`text-base font-semibold ${contaminant.isDetected ? "text-[#101935]" : "text-gray-500"}`}>
                          {contaminant.isDetected
                            ? `${contaminant.currentLevel} ${contaminant.unit}`
                            : "Below DL"}
                        </p>
                      </div>
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                          Health Guideline
                        </p>
                        <p className="text-base font-semibold text-gray-800">
                          {guideline ? `${guideline} ${contaminant.unit}` : "—"}
                        </p>
                        <div className="mt-2 border-t border-gray-300 pt-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                            EPA Limit
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {legal ? `${legal} ${contaminant.unit}` : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-md border border-green-300 bg-green-50 px-2 py-3 text-center">
                        <CheckCircle className="mb-1 h-5 w-5 text-green-600" />
                        <p className="text-[11px] font-medium tracking-wide text-green-700">
                          Patriot Pure® Removal:
                        </p>
                        <p className="text-2xl font-bold tracking-tight text-green-700">
                          {contaminant.patriotData.removalRate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-blue-600" />
              <h2 className="mb-4 text-2xl font-semibold text-blue-800">Great News!</h2>
              <p className="text-lg text-gray-700">
                None of the key contaminants that the Patriot Pure® filter targets were detected above
                recommended levels in your area.
              </p>
            </CardContent>
          </Card>
        )}

        <CTA />

        <Card className="rounded-none border border-gray-200 bg-gray-50 shadow-sm sm:rounded-2xl">
          <CardContent className="p-6">
            <p className="text-center text-sm text-gray-600">
              <Info className="mr-1 inline h-4 w-4" />
              This report highlights key contaminants found in your water that the Patriot Pure® filter is
              certified to reduce. For a complete list of tested contaminants from your utility, please refer
              to their annual Consumer Confidence Report (CCR).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Report() {
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportContent />
    </Suspense>
  );
}
