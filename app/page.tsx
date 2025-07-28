"use client";

import type React from "react";
import { useState } from "react";

import { CheckCircle, Droplets, Shield, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import z from "zod";

import { mockReportData } from "@/lib/mockdata";

import Header from "@/components/Header";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [formData, setFormData] = useState({
    zipCode: "",
    email: "",
    phone: "",
    consent: false,
  });
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
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative min-h-screen bg-white px-4 py-12 dark:bg-black">
          <div className="absolute right-4 top-4">
            <ModeToggle />
          </div>

          <div className="mx-auto max-w-4xl">
            <Header />

            <div className="mx-auto max-w-2xl">
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
}
