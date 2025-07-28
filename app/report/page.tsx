"use client";

import React, { useState, useEffect } from "react";

import { CheckCircle, AlertTriangle, Droplets, Shield, ExternalLink } from "lucide-react";

import { mockReportData } from "@/lib/mockdata";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ContaminantData {
  name: string;
  healthRisk: string;
  yourWater: number;
  healthGuideline: number;
  legalLimit: number;
  removalRate: string;
  unit: string;
}

interface ReportData {
  zipCode: string;
  contaminantsFound: number;
  contaminants: ContaminantData[];
}

export default function Report() {
  const isExceedsGuideline = (yourLevel: number, guideline: number) => {
    return yourLevel > guideline;
  };

  const [reportData, setReportData] = useState<ReportData | null>(null);
  // Set mock data on mount
  React.useEffect(() => {
    setReportData(mockReportData);
  }, []);
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
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Badge>
              </div>

              <div className="mb-4">
                <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">Water Quality Report</h1>
                <p className="text-lg text-blue-100">
                  Analysis for {reportData?.zipCode} • {reportData?.contaminantsFound} contaminants detected
                </p>
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
                  <p className="text-3xl font-bold text-foreground">{reportData?.contaminantsFound}</p>
                </div>
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Above Guidelines</p>
                  <p className="text-3xl font-bold text-foreground">{reportData?.contaminantsFound}</p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Filter Efficiency</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">99.9%</p>
                </div>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Contaminants List */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden rounded-2xl border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-semibold text-foreground">
                    <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                      <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Detected Contaminants
                  </CardTitle>
                  <CardDescription>
                    Contaminants found in your water supply that exceed health guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {reportData?.contaminants.slice(0, 4).map((contaminant, index) => (
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
                                    : "bg-blue-500"
                            }`}>
                            {contaminant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{contaminant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {contaminant.yourWater} {contaminant.unit} detected
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                isExceedsGuideline(contaminant.yourWater, contaminant.healthGuideline)
                                  ? "destructive"
                                  : "secondary"
                              }>
                              {isExceedsGuideline(contaminant.yourWater, contaminant.healthGuideline)
                                ? "High"
                                : "Normal"}
                            </Badge>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {contaminant.removalRate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        strokeDasharray={`${(reportData?.contaminantsFound || 0) * 15} 251.2`}
                        className="text-red-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">
                        {reportData?.contaminantsFound}
                      </span>
                    </div>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">High Risk</p>
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
                    <span className="text-sm text-muted-foreground">Arsenic Removal</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lead Removal</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">99.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">PFAS Removal</span>
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

          {/* Detailed Analysis Table */}
          <Card className="mt-8 overflow-hidden rounded-2xl border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Detailed Analysis</CardTitle>
              <CardDescription>
                Complete breakdown of all contaminants detected in your water supply
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Contaminant
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Your Level
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Health Guideline
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Filter Removal
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportData?.contaminants.map((contaminant, index) => (
                      <tr key={index} className="transition-colors hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
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
                                          : "bg-gray-500"
                              }`}>
                              {contaminant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{contaminant.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {contaminant.healthRisk.slice(0, 50)}
                                ...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              isExceedsGuideline(contaminant.yourWater, contaminant.healthGuideline)
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}>
                            {contaminant.yourWater} {contaminant.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-muted-foreground">
                            {contaminant.healthGuideline} {contaminant.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {contaminant.removalRate}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              isExceedsGuideline(contaminant.yourWater, contaminant.healthGuideline)
                                ? "destructive"
                                : "secondary"
                            }>
                            {isExceedsGuideline(contaminant.yourWater, contaminant.healthGuideline)
                              ? "Exceeds Guideline"
                              : "Within Limits"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

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
