"use client";

import type React from "react";
import { useState } from "react";

import {
  CheckCircle,
  AlertTriangle,
  Droplets,
  Shield,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ExternalLink,
} from "lucide-react";
import z from "zod";

import { mockReportData } from "@/lib/mockdata";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { emailSchema } from "@/zodSchema/form";
import { phoneSchema } from "@/zodSchema/form";
import { zipCodeSchema } from "@/zodSchema/form";

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

export default function WaterQualityReport() {
  const [currentStep, setCurrentStep] = useState<"form" | "loading" | "report">("form");
  const [formData, setFormData] = useState({
    zipCode: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.zipCode) {
      newErrors.zipCode = "Zip code is required";
    } else {
      try {
        zipCodeSchema.parse({ zipCode: formData.zipCode });
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.zipCode = error.errors[0].message;
        }
      }
    }

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else {
      try {
        emailSchema.parse({ email: formData.email });
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.email = error.errors[0].message;
        }
      }
    }
    if (formData.phone) {
      try {
        phoneSchema.parse(formData.phone);
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.phone = error.errors[0].message;
        }
      }
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to receive communications";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setCurrentStep("loading");

    // Simulate API call
    setTimeout(() => {
      const mockData = {
        ...mockReportData,
        zipCode: formData.zipCode,
      };
      setReportData(mockData);
      setCurrentStep("report");
    }, 3000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isExceedsGuideline = (yourLevel: number, guideline: number) => {
    return yourLevel > guideline;
  };

  if (currentStep === "form") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative min-h-screen bg-white px-4 py-12 dark:bg-black">
          <div className="absolute right-4 top-4">
            <ModeToggle />
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Header Section */}
            <div className="mb-16 text-center">
              <div className="mb-8 flex items-center justify-center">
                <Droplets className="mr-3 h-8 w-8 text-black dark:text-white" />
                <span className="text-2xl font-bold text-black dark:text-white">4Patriots</span>
              </div>

              <div className="mb-6">
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  WATER QUALITY ANALYSIS
                </p>
                <h1 className="mb-4 text-5xl font-bold leading-tight text-black dark:text-white md:text-6xl">
                  Your{" "}
                  <span className="relative">
                    <span className="rounded bg-black px-2 py-1 text-white dark:bg-white dark:text-black">
                      water
                    </span>
                  </span>{" "}
                  quality report,
                </h1>
                <h2 className="mb-6 text-5xl font-bold leading-tight text-black dark:text-white md:text-6xl">
                  but it <span className="italic">actually</span> protects.
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                  Get your personalized water contamination analysis in under 2 minutes.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="mx-auto max-w-2xl">
              {/* Form Preview Mockup */}
              <div className="relative mb-12">
                <div className="rounded-2xl bg-gray-100 p-8 shadow-2xl dark:bg-gray-900">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
                    <div className="mb-4 flex items-center">
                      <div className="mr-4 flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">4patriots.com</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Droplets className="h-5 w-5 text-black dark:text-white" />
                        <span className="font-semibold text-black dark:text-white">Water Quality Report</span>
                      </div>

                      <div className="space-y-3">
                        <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
                        <div className="h-8 w-32 rounded bg-black dark:bg-white"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Email Input */}
                <div className="absolute -right-4 -top-4 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-black">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Your email address</span>
                  </div>
                </div>

                {/* Get Started Button */}
                <div className="absolute -bottom-4 -left-4">
                  <Button className="rounded-lg bg-black px-6 py-3 font-semibold text-white shadow-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    Get Started
                  </Button>
                </div>
              </div>

              {/* Actual Form */}
              <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl dark:border-gray-800">
                <CardHeader className="border-b border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-black">
                  <CardTitle className="text-center text-2xl font-bold text-black dark:text-white">
                    Get Your Water Quality Report
                  </CardTitle>
                  <CardDescription className="text-center text-lg text-gray-600 dark:text-gray-400">
                    Enter your information to receive your personalized analysis
                  </CardDescription>
                </CardHeader>

                <CardContent className="bg-white p-8 dark:bg-black">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="zipCode"
                          className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                          Zip Code *
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            id="zipCode"
                            type="text"
                            placeholder="Enter your zip code (e.g., 90210)"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                            className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                              errors.zipCode
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                            } bg-white text-black dark:bg-black dark:text-white`}
                          />
                        </div>
                        {errors.zipCode && (
                          <p className="text-sm font-medium text-red-500">{errors.zipCode}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="email"
                          className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                          Email Address *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                              errors.email
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                            } bg-white text-black dark:bg-black dark:text-white`}
                          />
                        </div>
                        {errors.email && <p className="text-sm font-medium text-red-500">{errors.email}</p>}
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
                          Mobile Number (Optional)
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className={`h-14 rounded-xl border-2 pl-12 text-lg transition-all duration-200 ${
                              errors.phone
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-200 focus:border-black dark:border-gray-800 dark:focus:border-white"
                            } bg-white text-black dark:bg-black dark:text-white`}
                          />
                        </div>
                        {errors.phone && <p className="text-sm font-medium text-red-500">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 rounded-xl bg-gray-50 p-6 dark:bg-gray-950">
                      <Checkbox
                        id="consent"
                        checked={formData.consent}
                        onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                        className={`mt-1 ${
                          errors.consent ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                        }`}
                      />
                      <Label
                        htmlFor="consent"
                        className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        I agree to receive email and SMS marketing communications from 4Patriots about water
                        filtration products and health tips. I understand I can unsubscribe at any time.
                      </Label>
                    </div>
                    {errors.consent && <p className="text-sm font-medium text-red-500">{errors.consent}</p>}

                    <Button
                      type="submit"
                      className="h-16 w-full transform rounded-xl bg-black text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      See My Report Now
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div className="mt-12 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  +18000 HOMEOWNERS USE 4PATRIOTS FOR THEIR WATER SAFETY
                </p>
                <div className="flex items-center justify-center space-x-8 text-xs text-gray-400 dark:text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    EPA Certified
                  </div>
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Lab Tested
                  </div>
                  <div className="flex items-center">
                    <Droplets className="mr-2 h-4 w-4" />
                    99.9% Effective
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (currentStep === "loading") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4 dark:from-gray-900 dark:to-gray-800">
          <div className="absolute right-4 top-4">
            <ModeToggle />
          </div>
          <Card className="w-full max-w-2xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-blue-600 dark:text-blue-400" />
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                Analyzing water quality data for {formData.zipCode}...
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We're cross-referencing millions of records from local, state, and federal sources and
                comparing them against our certified lab results to build your custom report.
              </p>
              <div className="mt-8 flex justify-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  EPA Database
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  State Records
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Lab Results
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

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
